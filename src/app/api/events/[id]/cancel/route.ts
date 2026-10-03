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

    const { id } = params;

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

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: event.id,
        },
      },
    });

    if (!registration || registration.status !== 'REGISTERED') {
      return NextResponse.json(
        { error: 'You do not have an active registration for this event.' },
        { status: 400 }
      );
    }

    // Delete the registration to fully free the seat
    await prisma.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: event.id,
        },
      },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Registration Cancelled: ${event.title}`,
        description: `Your registration for ${event.title} has been cancelled.`,
        type: 'event',
        isRead: false,
      },
    });

    const newActiveCount = Math.max(0, event._count.registrations - 1);
    const remainingSeats =
      event.capacity !== null ? Math.max(0, event.capacity - newActiveCount) : null;

    return NextResponse.json({
      success: true,
      isRegistered: false,
      remainingSeats,
      registrationsCount: newActiveCount,
    });
  } catch (error) {
    console.error('Event cancel error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel event registration.' },
      { status: 500 }
    );
  }
}
