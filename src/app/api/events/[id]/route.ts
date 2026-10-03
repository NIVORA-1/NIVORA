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
    const now = new Date();

    const ev = await prisma.event.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            category: true,
            leaderId: true,
          },
        },
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
              select: { id: true, status: true, registeredAt: true },
            }
          : false,
      },
    });

    if (!ev) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const regCount = ev._count.registrations;
    const userReg = user && ev.registrations?.length ? ev.registrations[0] : null;
    const isPast = new Date(ev.eventDate).getTime() < now.getTime();
    const isOrganizer = Boolean(
      user &&
        (ev.createdById === user.id ||
          (ev.club && ev.club.leaderId === user.id))
    );

    return NextResponse.json({
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
      clubId: ev.clubId,
      club: ev.club,
      capacity: ev.capacity,
      remainingSeats: ev.capacity !== null ? Math.max(0, ev.capacity - regCount) : null,
      registrationsCount: regCount,
      registrationDeadline: ev.registrationDeadline,
      isDeadlinePassed: ev.registrationDeadline ? new Date(ev.registrationDeadline) < now : false,
      prizePool: ev.prizePool,
      isCancelled: ev.isCancelled,
      isPast,
      isRegistered: Boolean(userReg),
      registeredAt: userReg?.registeredAt || null,
      isOrganizer,
    });
  } catch (error) {
    console.error('Event detail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        club: { select: { leaderId: true } },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isAuthorized =
      existingEvent.createdById === user.id ||
      (existingEvent.club && existingEvent.club.leaderId === user.id);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Only the organizer can modify this event' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.venue !== undefined) updateData.venue = body.venue.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.date !== undefined) updateData.date = body.date.trim();
    if (body.startTime !== undefined) updateData.startTime = body.startTime.trim();
    if (body.endTime !== undefined) updateData.endTime = body.endTime.trim();
    if (body.prizePool !== undefined) updateData.prizePool = body.prizePool ? body.prizePool.trim() : null;
    if (body.capacity !== undefined) updateData.capacity = body.capacity ? parseInt(body.capacity, 10) : null;
    if (body.isCancelled !== undefined) updateData.isCancelled = Boolean(body.isCancelled);
    if (body.registrationDeadline !== undefined) {
      updateData.registrationDeadline = body.registrationDeadline ? new Date(body.registrationDeadline) : null;
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    // If cancelled, notify registered attendees
    if (body.isCancelled === true && !existingEvent.isCancelled) {
      const attendees = await prisma.eventRegistration.findMany({
        where: { eventId: id, status: 'REGISTERED' },
        select: { userId: true },
      });

      if (attendees.length > 0) {
        await prisma.notification.createMany({
          data: attendees.map((a) => ({
            userId: a.userId,
            title: `Event Cancelled: ${existingEvent.title}`,
            description: `The event scheduled for ${existingEvent.date} has been cancelled by the organizer.`,
            type: 'event',
            isRead: false,
          })),
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Event PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
