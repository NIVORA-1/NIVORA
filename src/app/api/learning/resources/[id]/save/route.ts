import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: resourceId } = params;

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const existingSaved = await prisma.savedResource.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId: resource.id,
        },
      },
    });

    if (existingSaved) {
      await prisma.savedResource.delete({
        where: {
          userId_resourceId: {
            userId: user.id,
            resourceId: resource.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        resourceId: resource.id,
        isSaved: false,
      });
    } else {
      await prisma.savedResource.create({
        data: {
          userId: user.id,
          resourceId: resource.id,
        },
      });

      return NextResponse.json({
        success: true,
        resourceId: resource.id,
        isSaved: true,
      });
    }
  } catch (error) {
    console.error('Resource save error:', error);
    return NextResponse.json({ error: 'Failed to save resource' }, { status: 500 });
  }
}
