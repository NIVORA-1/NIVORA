import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getTodayString();

    const checkIn = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
    });

    return NextResponse.json({ success: true, date, checkIn });
  } catch (error) {
    console.error('CheckIn GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch check-in' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      date = getTodayString(),
      energyLevel = 3,
      workoutCompleted,
      waterIntakeMl,
      sleepHours,
      mealsCount,
      mood,
      notes,
    } = body;

    const data: Record<string, any> = {
      energyLevel: Math.max(1, Math.min(5, parseInt(String(energyLevel)) || 3)),
      notes: notes?.trim() || null,
      mood: mood?.trim() || null,
    };

    if (typeof workoutCompleted === 'boolean') data.workoutCompleted = workoutCompleted;
    if (waterIntakeMl !== undefined) data.waterIntakeMl = Math.max(0, parseInt(String(waterIntakeMl)) || 0);
    if (sleepHours !== undefined) data.sleepHours = Math.max(0, parseFloat(String(sleepHours)) || 0);
    if (mealsCount !== undefined) data.mealsCount = Math.max(0, parseInt(String(mealsCount)) || 0);

    const checkIn = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      create: {
        userId: user.id,
        date,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({ success: true, checkIn });
  } catch (error) {
    console.error('CheckIn POST error:', error);
    return NextResponse.json({ error: 'Failed to submit daily check-in' }, { status: 500 });
  }
}
