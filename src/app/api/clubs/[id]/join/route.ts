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
      return NextResponse.json({ error: 'Authentication required to join clubs' }, { status: 401 });
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

    // Check if user is already a member
    const existingMembership = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: club.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({
        message: 'You are already a member of this club',
        isMember: true,
        role: existingMembership.role,
      });
    }

    // Create membership
    const membership = await prisma.clubMembership.create({
      data: {
        userId: user.id,
        clubId: club.id,
        role: 'MEMBER',
      },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Welcome to ${club.name}`,
        description: `You are now an official member of ${club.name}. Check out the club's upcoming events and announcements.`,
        type: 'club',
        isRead: false,
      },
    });

    // Get updated member count
    const memberCount = await prisma.clubMembership.count({
      where: { clubId: club.id },
    });

    return NextResponse.json({
      success: true,
      isMember: true,
      role: membership.role,
      memberCount,
    });
  } catch (error) {
    console.error('Club join error:', error);
    return NextResponse.json({ error: 'Failed to join club' }, { status: 500 });
  }
}
