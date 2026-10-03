import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to register for events.' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 2. Check event exists
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: 'REGISTERED' },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    // 3. Check event isn't cancelled
    if (event.isCancelled) {
      return NextResponse.json(
        { error: 'This event has been cancelled and is no longer accepting registrations.' },
        { status: 400 }
      );
    }

    const now = new Date();

    // 4. Check registration deadline if configured
    if (event.registrationDeadline && new Date(event.registrationDeadline) < now) {
      return NextResponse.json(
        { error: 'Registration deadline has passed for this event.' },
        { status: 400 }
      );
    }

    // Check if event has already passed
    if (new Date(event.eventDate).getTime() < now.getTime()) {
      return NextResponse.json(
        { error: 'Cannot register for a past event.' },
        { status: 400 }
      );
    }

    // 5. Check capacity if configured
    const activeRegistrations = event._count.registrations;
    if (event.capacity !== null && activeRegistrations >= event.capacity) {
      return NextResponse.json(
        { error: 'This event is currently at full capacity.' },
        { status: 400 }
      );
    }

    // 6. Check student isn't already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: event.id,
        },
      },
    });

    if (existingRegistration && existingRegistration.status === 'REGISTERED') {
      return NextResponse.json(
        {
          message: 'You are already registered for this event.',
          isRegistered: true,
          status: 'REGISTERED',
        },
        { status: 200 }
      );
    }

    let registration;
    if (existingRegistration) {
      // Re-activate cancelled registration
      registration = await prisma.eventRegistration.update({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: event.id,
          },
        },
        data: {
          status: 'REGISTERED',
          registeredAt: new Date(),
        },
      });
    } else {
      // 7. Create EventRegistration
      registration = await prisma.eventRegistration.create({
        data: {
          userId: user.id,
          eventId: event.id,
          status: 'REGISTERED',
        },
      });
    }

    // 8. Create in-app notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Registered for ${event.title}`,
        description: `You are registered for ${event.title} (${event.date} at ${event.venue}). Your seat is confirmed.`,
        type: 'event',
        isRead: false,
      },
    });

    // Calculate updated seats
    const newActiveCount = activeRegistrations + (existingRegistration ? 0 : 1);
    const remainingSeats =
      event.capacity !== null ? Math.max(0, event.capacity - newActiveCount) : null;

    return NextResponse.json({
      success: true,
      isRegistered: true,
      status: registration.status,
      registeredAt: registration.registeredAt,
      remainingSeats,
      registrationsCount: newActiveCount,
    });
  } catch (error) {
    console.error('Event register error:', error);
    return NextResponse.json(
      { error: 'Failed to process event registration.' },
      { status: 500 }
    );
  }
}
