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

    const now = new Date();

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId: user.id,
        status: 'REGISTERED',
      },
      include: {
        event: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
            _count: {
              select: {
                registrations: {
                  where: { status: 'REGISTERED' },
                },
              },
            },
          },
        },
      },
      orderBy: {
        event: {
          eventDate: 'asc',
        },
      },
    });

    const upcoming: any[] = [];
    const past: any[] = [];

    registrations.forEach((reg) => {
      const ev = reg.event;
      const isPast = new Date(ev.eventDate).getTime() < now.getTime();
      const activeCount = ev._count.registrations;

      const item = {
        registrationId: reg.id,
        status: reg.status,
        registeredAt: reg.registeredAt,
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
        remainingSeats: ev.capacity !== null ? Math.max(0, ev.capacity - activeCount) : null,
        prizePool: ev.prizePool,
        isCancelled: ev.isCancelled,
        isRegistered: true,
        isPast,
      };

      if (isPast) {
        past.push(item);
      } else {
        upcoming.push(item);
      }
    });

    return NextResponse.json({
      upcoming,
      past,
      total: registrations.length,
    });
  } catch (error) {
    console.error('My Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch registered events' }, { status: 500 });
  }
}
