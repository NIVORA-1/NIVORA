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
    const dateParam = searchParams.get('date') || getTodayString();

    const profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
      select: { waterGoalMl: true },
    });
    const goalMl = profile?.waterGoalMl || 2500;

    // Fetch logs for requested date
    const todayLogs = await prisma.waterLog.findMany({
      where: { userId: user.id, date: dateParam },
      orderBy: { loggedAt: 'desc' },
    });

    const currentMl = todayLogs.reduce((sum, log) => sum + log.amountMl, 0);

    // Fetch past 7 days history
    const past7DaysLogs = await prisma.waterLog.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: 'desc' },
      take: 100,
    });

    // Group past 7 days by date
    const historyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      historyMap.set(ds, 0);
    }

    for (const log of past7DaysLogs) {
      if (historyMap.has(log.date)) {
        historyMap.set(log.date, (historyMap.get(log.date) || 0) + log.amountMl);
      }
    }

    const weeklyHistory = Array.from(historyMap.entries()).map(([date, amountMl]) => ({
      date,
      amountMl,
      goalMl,
      isGoalMet: amountMl >= goalMl,
    }));

    return NextResponse.json({
      success: true,
      date: dateParam,
      currentMl,
      goalMl,
      percentage: Math.min(100, Math.round((currentMl / goalMl) * 100)),
      logs: todayLogs,
      weeklyHistory,
    });
  } catch (error) {
    console.error('Water GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch water data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amountMl, date = getTodayString() } = body;

    const parsedAmount = parseInt(String(amountMl));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid water amount in ml is required' }, { status: 400 });
    }

    const log = await prisma.waterLog.create({
      data: {
        userId: user.id,
        date,
        amountMl: parsedAmount,
      },
    });

    // Update today's checkin water intake cache
    const todayLogs = await prisma.waterLog.findMany({
      where: { userId: user.id, date },
    });
    const totalMl = todayLogs.reduce((acc, curr) => acc + curr.amountMl, 0);

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
        waterIntakeMl: totalMl,
      },
      update: {
        waterIntakeMl: totalMl,
      },
    });

    return NextResponse.json({ success: true, log, totalMl });
  } catch (error) {
    console.error('Water POST error:', error);
    return NextResponse.json({ error: 'Failed to log water intake' }, { status: 500 });
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

    const existing = await prisma.waterLog.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    await prisma.waterLog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Water log deleted' });
  } catch (error) {
    console.error('Water DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete water log' }, { status: 500 });
  }
}
