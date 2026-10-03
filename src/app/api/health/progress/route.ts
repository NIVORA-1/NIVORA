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
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const weeklyWorkoutGoal = profile?.weeklyWorkoutGoal || 4;
    const waterGoalMl = profile?.waterGoalMl || 2500;
    const sleepGoalHours = profile?.sleepGoalHours || 8.0;

    // 1. Workout history & consistency
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: user.id, status: 'completed' },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 30,
    });

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const workoutsThisWeek = sessions.filter((s) => new Date(s.startedAt) >= sevenDaysAgo);

    // Personal Records
    const prMap = new Map<string, { exerciseName: string; maxWeightKg: number; repsAtMax: number; date: string }>();
    for (const session of sessions) {
      const sessionDate = session.startedAt.toISOString().split('T')[0];
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          if (set.isCompleted && set.weightKg > 0) {
            const current = prMap.get(ex.exerciseName);
            if (!current || set.weightKg > current.maxWeightKg) {
              prMap.set(ex.exerciseName, {
                exerciseName: ex.exerciseName,
                maxWeightKg: set.weightKg,
                repsAtMax: set.reps,
                date: sessionDate,
              });
            }
          }
        }
      }
    }
    const personalRecords = Array.from(prMap.values()).sort((a, b) => b.maxWeightKg - a.maxWeightKg);

    // 2. Water consistency (past 7 days)
    const sevenDaysDateStrings: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      sevenDaysDateStrings.push(d.toISOString().split('T')[0]);
    }

    const waterLogsPast7Days = await prisma.waterLog.findMany({
      where: {
        userId: user.id,
        date: { in: sevenDaysDateStrings },
      },
    });

    const waterDailyTotals = new Map<string, number>();
    for (const ds of sevenDaysDateStrings) waterDailyTotals.set(ds, 0);
    for (const wl of waterLogsPast7Days) {
      waterDailyTotals.set(wl.date, (waterDailyTotals.get(wl.date) || 0) + wl.amountMl);
    }

    let daysWaterGoalMet = 0;
    let daysWithAnyWater = 0;
    const waterTrend = Array.from(waterDailyTotals.entries()).map(([date, amountMl]) => {
      if (amountMl > 0) daysWithAnyWater++;
      if (amountMl >= waterGoalMl) daysWaterGoalMet++;
      return {
        date,
        amountMl,
        goalMl: waterGoalMl,
        percentage: Math.min(100, Math.round((amountMl / waterGoalMl) * 100)),
      };
    });

    const waterConsistencyPercent = Math.round((daysWaterGoalMet / 7) * 100);

    // 3. Sleep consistency & average (past 14 days)
    const sleepLogs = await prisma.sleepLog.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 14,
    });

    const avgSleepMinutes =
      sleepLogs.length > 0
        ? Math.round(sleepLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / sleepLogs.length)
        : 0;
    const avgSleepQuality =
      sleepLogs.length > 0
        ? Math.round((sleepLogs.reduce((acc, log) => acc + log.quality, 0) / sleepLogs.length) * 10) / 10
        : 0;

    const sleepTrend = sleepLogs.slice(0, 7).reverse().map((sl) => ({
      date: sl.date,
      hours: Math.round((sl.durationMinutes / 60) * 10) / 10,
      quality: sl.quality,
      goalHours: sleepGoalHours,
    }));

    // 4. Goals summary
    const goals = await prisma.healthGoal.findMany({
      where: { userId: user.id },
    });
    const completedGoals = goals.filter((g) => g.isCompleted);
    const goalCompletionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

    // Check if sufficient data exists overall
    const hasEnoughData = sessions.length > 0 || waterLogsPast7Days.length > 0 || sleepLogs.length > 0;

    return NextResponse.json({
      success: true,
      hasEnoughData,
      insufficientData: !hasEnoughData,
      workouts: {
        countThisWeek: workoutsThisWeek.length,
        goalThisWeek: weeklyWorkoutGoal,
        consistencyPercent: Math.min(100, Math.round((workoutsThisWeek.length / weeklyWorkoutGoal) * 100)),
        totalCompleted: sessions.length,
        recentSessions: sessions.slice(0, 10),
      },
      personalRecords,
      water: {
        consistencyPercent: waterConsistencyPercent,
        daysGoalMet: daysWaterGoalMet,
        daysTracked: daysWithAnyWater,
        trend: waterTrend,
      },
      sleep: {
        averageHours: Math.round((avgSleepMinutes / 60) * 10) / 10,
        averageQuality: avgSleepQuality,
        totalLogs: sleepLogs.length,
        trend: sleepTrend,
      },
      goals: {
        total: goals.length,
        completed: completedGoals.length,
        active: goals.length - completedGoals.length,
        completionRate: goalCompletionRate,
      },
    });
  } catch (error) {
    console.error('Health progress GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress trends' }, { status: 500 });
  }
}
