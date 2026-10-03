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

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = getTodayString();
    const todayDayName = DAYS_OF_WEEK[new Date().getDay()];

    // 1. Get or create HealthProfile
    let healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    if (!healthProfile) {
      healthProfile = await prisma.healthProfile.create({
        data: {
          userId: user.id,
          waterGoalMl: 2500,
          sleepGoalHours: 8.0,
          weeklyWorkoutGoal: 4,
          dailyCalorieGoal: 2200,
          activityLevel: 'Moderate',
          fitnessGoal: 'Strength & General Vitality',
        },
      });
    }

    // 2. Active Workout Plan & Today's Target
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId: user.id, isActive: true },
      include: {
        days: {
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    const todayPlanDay = activePlan?.days.find(
      (d) => d.dayOfWeek.toLowerCase() === todayDayName.toLowerCase()
    );

    // Today's completed workout session if any
    const todaySession = await prisma.workoutSession.findFirst({
      where: {
        userId: user.id,
        startedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        status: 'completed',
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // 3. Today's Water Logs
    const todayWaterLogs = await prisma.waterLog.findMany({
      where: { userId: user.id, date: todayStr },
      orderBy: { loggedAt: 'asc' },
    });

    const totalWaterToday = todayWaterLogs.reduce((sum, log) => sum + log.amountMl, 0);

    // 4. Today's Sleep (most recent sleep log waking on today or yesterday)
    const latestSleepLog = await prisma.sleepLog.findFirst({
      where: { userId: user.id },
      orderBy: { loggedAt: 'desc' },
    });

    // 5. Today's Meals
    const todayMeals = await prisma.mealLog.findMany({
      where: { userId: user.id, date: todayStr },
      orderBy: { loggedAt: 'asc' },
    });

    const totalCaloriesToday = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProteinToday = todayMeals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
    const totalCarbsToday = todayMeals.reduce((sum, m) => sum + (m.carbsGrams || 0), 0);
    const totalFatToday = todayMeals.reduce((sum, m) => sum + (m.fatGrams || 0), 0);

    // 6. Active Health Goals
    const activeGoals = await prisma.healthGoal.findMany({
      where: { userId: user.id, isCompleted: false },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    const completedGoalsCount = await prisma.healthGoal.count({
      where: { userId: user.id, isCompleted: true },
    });

    // 7. Today's Daily Check-In
    const todayCheckIn = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: todayStr,
        },
      },
    });

    // 8. Weekly Stats: Workouts in past 7 days
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const workoutsThisWeek = await prisma.workoutSession.count({
      where: {
        userId: user.id,
        startedAt: { gte: weekStart },
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      today: {
        date: todayStr,
        dayOfWeek: todayDayName,
      },
      profile: healthProfile,
      workout: {
        activePlan: activePlan
          ? {
              id: activePlan.id,
              name: activePlan.name,
              goal: activePlan.goal,
            }
          : null,
        todayDay: todayPlanDay || null,
        isCompletedToday: !!todaySession,
        todaySession: todaySession || null,
        weeklyGoal: healthProfile.weeklyWorkoutGoal,
        workoutsThisWeek,
      },
      water: {
        currentMl: totalWaterToday,
        goalMl: healthProfile.waterGoalMl,
        logsCount: todayWaterLogs.length,
        logs: todayWaterLogs,
        percentage: Math.min(100, Math.round((totalWaterToday / (healthProfile.waterGoalMl || 2500)) * 100)),
      },
      sleep: {
        latest: latestSleepLog
          ? {
              id: latestSleepLog.id,
              date: latestSleepLog.date,
              bedtime: latestSleepLog.bedtime,
              wakeTime: latestSleepLog.wakeTime,
              durationMinutes: latestSleepLog.durationMinutes,
              durationFormatted: `${Math.floor(latestSleepLog.durationMinutes / 60)}h ${latestSleepLog.durationMinutes % 60}m`,
              quality: latestSleepLog.quality,
              notes: latestSleepLog.notes,
            }
          : null,
        goalHours: healthProfile.sleepGoalHours,
      },
      nutrition: {
        mealsCount: todayMeals.length,
        calories: totalCaloriesToday,
        proteinGrams: Math.round(totalProteinToday * 10) / 10,
        carbsGrams: Math.round(totalCarbsToday * 10) / 10,
        fatGrams: Math.round(totalFatToday * 10) / 10,
        calorieGoal: healthProfile.dailyCalorieGoal || 2200,
        meals: todayMeals,
      },
      goals: {
        activeCount: activeGoals.length,
        completedCount: completedGoalsCount,
        active: activeGoals,
      },
      checkIn: todayCheckIn || null,
    });
  } catch (error) {
    console.error('Health overview GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch health overview' }, { status: 500 });
  }
}
