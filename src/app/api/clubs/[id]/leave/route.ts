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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    const club = await prisma.club.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const membership = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: club.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of this club' }, { status: 400 });
    }

    await prisma.clubMembership.delete({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: club.id,
        },
      },
    });

    const memberCount = await prisma.clubMembership.count({
      where: { clubId: club.id },
    });

    return NextResponse.json({
      success: true,
      isMember: false,
      role: null,
      memberCount,
    });
  } catch (error) {
    console.error('Club leave error:', error);
    return NextResponse.json({ error: 'Failed to leave club' }, { status: 500 });
  }
}
