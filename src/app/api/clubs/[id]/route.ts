import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();

    const club = await prisma.club.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        leader: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { memberships: true },
        },
        announcements: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        events: {
          orderBy: { eventDate: 'asc' },
          include: {
            _count: {
              select: {
                registrations: {
                  where: { status: 'REGISTERED' },
                },
              },
            },
            registrations: user
              ? {
                  where: { userId: user.id, status: 'REGISTERED' },
                  select: { id: true, status: true },
                }
              : false,
          },
        },
        memberships: user
          ? {
              where: { userId: user.id },
              select: { id: true, role: true },
            }
          : false,
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const userMembership = user && club.memberships?.length ? club.memberships[0] : null;
    const isOrganizer = Boolean(
      user &&
        (club.leaderId === user.id ||
          userMembership?.role === 'ADMIN' ||
          userMembership?.role === 'LEAD')
    );

    const formattedEvents = club.events.map((ev) => {
      const regCount = ev._count.registrations;
      const isReg = Boolean(user && ev.registrations?.length);
      return {
        id: ev.id,
        title: ev.title,
        description: ev.description,
        category: ev.category,
        date: ev.date,
        eventDate: ev.eventDate,
        startTime: ev.startTime,
        endTime: ev.endTime,
        venue: ev.venue,
        organizerName: ev.organizerName,
        capacity: ev.capacity,
        remainingSeats: ev.capacity !== null ? Math.max(0, ev.capacity - regCount) : null,
        registrationDeadline: ev.registrationDeadline,
        prizePool: ev.prizePool,
        isCancelled: ev.isCancelled,
        isRegistered: isReg,
      };
    });

    return NextResponse.json({
      id: club.id,
      name: club.name,
      slug: club.slug,
      description: club.description,
      category: club.category,
      logo: club.logo,
      bannerImage: club.bannerImage,
      leaderId: club.leaderId,
      leader: club.leader,
      memberCount: club._count.memberships,
      isMember: Boolean(userMembership),
      membershipRole: userMembership?.role || null,
      isOrganizer,
      announcements: club.announcements,
      events: formattedEvents,
    });
  } catch (error) {
    console.error('Club detail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch club' }, { status: 500 });
  }
}
