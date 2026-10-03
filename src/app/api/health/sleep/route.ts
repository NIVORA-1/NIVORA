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

function computeSleepDuration(bedStr: string, wakeStr: string, dateStr: string): {
  bedDateTime: Date;
  wakeDateTime: Date;
  durationMinutes: number;
} {
  // If inputs are already ISO strings
  if (bedStr.includes('T') && wakeStr.includes('T')) {
    const bed = new Date(bedStr);
    const wake = new Date(wakeStr);
    let diffMs = wake.getTime() - bed.getTime();
    if (diffMs < 0) {
      // Overnight adjustment if dates were identical
      diffMs += 24 * 60 * 60 * 1000;
    }
    const durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return { bedDateTime: bed, wakeDateTime: wake, durationMinutes };
  }

  // If inputs are "HH:MM" (e.g. "23:15" and "07:30")
  const [bedH, bedM] = bedStr.split(':').map((v) => parseInt(v, 10));
  const [wakeH, wakeM] = wakeStr.split(':').map((v) => parseInt(v, 10));

  const wakeDate = new Date(`${dateStr}T${String(wakeH).padStart(2, '0')}:${String(wakeM).padStart(2, '0')}:00`);

  // Bed date: if wake time is earlier in day or equal to bed time, bedtime was yesterday
  const bedDate = new Date(wakeDate);
  if (wakeH < bedH || (wakeH === bedH && wakeM < bedM)) {
    bedDate.setDate(bedDate.getDate() - 1);
  }
  bedDate.setHours(bedH, bedM, 0, 0);

  const diffMs = wakeDate.getTime() - bedDate.getTime();
  const durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

  return { bedDateTime: bedDate, wakeDateTime: wakeDate, durationMinutes };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
      select: { sleepGoalHours: true },
    });
    const goalHours = profile?.sleepGoalHours || 8.0;

    const sleepLogs = await prisma.sleepLog.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 14,
    });

    const latest = sleepLogs[0] || null;

    // Compute weekly averages (last 7 logs)
    const recentLogs = sleepLogs.slice(0, 7);
    const avgDurationMinutes =
      recentLogs.length > 0
        ? Math.round(recentLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / recentLogs.length)
        : 0;
    const avgQuality =
      recentLogs.length > 0
        ? Math.round((recentLogs.reduce((acc, log) => acc + log.quality, 0) / recentLogs.length) * 10) / 10
        : 0;

    return NextResponse.json({
      success: true,
      goalHours,
      latest: latest
        ? {
            id: latest.id,
            date: latest.date,
            bedtime: latest.bedtime,
            wakeTime: latest.wakeTime,
            durationMinutes: latest.durationMinutes,
            durationHours: Math.round((latest.durationMinutes / 60) * 10) / 10,
            quality: latest.quality,
            notes: latest.notes,
          }
        : null,
      stats: {
        avgDurationMinutes,
        avgDurationHours: Math.round((avgDurationMinutes / 60) * 10) / 10,
        avgQuality,
        logsCount: sleepLogs.length,
      },
      history: sleepLogs,
    });
  } catch (error) {
    console.error('Sleep GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sleep data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bedtime, wakeTime, quality = 4, notes, date = getTodayString() } = body;

    if (!bedtime || !wakeTime) {
      return NextResponse.json({ error: 'Both bedtime and wake-up time are required' }, { status: 400 });
    }

    const { bedDateTime, wakeDateTime, durationMinutes } = computeSleepDuration(
      String(bedtime),
      String(wakeTime),
      date
    );

    const log = await prisma.sleepLog.create({
      data: {
        userId: user.id,
        date,
        bedtime: bedDateTime,
        wakeTime: wakeDateTime,
        durationMinutes,
        quality: Math.max(1, Math.min(5, parseInt(String(quality)) || 4)),
        notes: notes?.trim() || null,
      },
    });

    // Update today's checkin sleep hours if applicable
    const durationHours = Math.round((durationMinutes / 60) * 10) / 10;
    await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      create: {
        userId: user.id,
        date,
        sleepHours: durationHours,
      },
      update: {
        sleepHours: durationHours,
      },
    });

    return NextResponse.json({ success: true, log, durationMinutes, durationHours });
  } catch (error) {
    console.error('Sleep POST error:', error);
    return NextResponse.json({ error: 'Failed to log sleep' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Log ID required' }, { status: 400 });
    }

    const existing = await prisma.sleepLog.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sleep log not found' }, { status: 404 });
    }

    await prisma.sleepLog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Sleep log deleted' });
  } catch (error) {
    console.error('Sleep DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete sleep log' }, { status: 500 });
  }
}
