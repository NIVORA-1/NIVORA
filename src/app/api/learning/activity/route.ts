import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subjectId, topicId, resourceId } = body;

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    const activity = await prisma.learningActivity.create({
      data: {
        userId: user.id,
        subjectId,
        topicId: topicId || null,
        resourceId: resourceId || null,
        startedAt: new Date(),
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Learning activity POST error:', error);
    return NextResponse.json({ error: 'Failed to record study session' }, { status: 500 });
  }
}
