import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.clubMembership.findMany({
      where: { userId: user.id },
      include: {
        club: {
          include: {
            leader: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: {
                memberships: true,
                events: true,
                announcements: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const myClubs = memberships.map((m) => ({
      id: m.club.id,
      name: m.club.name,
      slug: m.club.slug,
      description: m.club.description,
      category: m.club.category,
      logo: m.club.logo,
      bannerImage: m.club.bannerImage,
      memberCount: m.club._count.memberships,
      eventsCount: m.club._count.events,
      announcementsCount: m.club._count.announcements,
      membershipRole: m.role,
      joinedAt: m.joinedAt,
      isMember: true,
      isOrganizer: m.club.leaderId === user.id || m.role === 'ADMIN' || m.role === 'LEAD',
    }));

    return NextResponse.json(myClubs);
  } catch (error) {
    console.error('My Clubs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch joined clubs' }, { status: 500 });
  }
}
