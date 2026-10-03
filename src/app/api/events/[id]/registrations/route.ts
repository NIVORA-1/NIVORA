import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            leaderId: true,
            memberships: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const clubMembership = event.club?.memberships?.[0];
    const isAuthorized =
      event.createdById === user.id ||
      event.club?.leaderId === user.id ||
      clubMembership?.role === 'ADMIN' ||
      clubMembership?.role === 'LEAD';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Only authorized organizers can view attendee rosters.' },
        { status: 403 }
      );
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId: id,
        status: 'REGISTERED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: {
              select: {
                college: true,
                streamCode: true,
                year: true,
              },
            },
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });

    const attendees = registrations.map((r) => ({
      registrationId: r.id,
      registeredAt: r.registeredAt,
      studentName: r.user.name,
      studentEmail: r.user.email,
      avatar: r.user.avatar,
      college: r.user.profile?.college,
      stream: r.user.profile?.streamCode,
      year: r.user.profile?.year,
    }));

    return NextResponse.json({
      eventId: event.id,
      eventTitle: event.title,
      totalAttendees: attendees.length,
      capacity: event.capacity,
      attendees,
    });
  } catch (error) {
    console.error('Event attendees GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event attendees' },
      { status: 500 }
    );
  }
}
