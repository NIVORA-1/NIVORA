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
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch sessions
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: user.id, status: 'completed' },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    // Calculate Personal Records (PRs) from real user logged sets
    const prMap = new Map<string, { exerciseName: string; maxWeightKg: number; repsAtMax: number; date: string }>();

    for (const session of sessions) {
      const sessionDate = session.startedAt.toISOString().split('T')[0];
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          if (set.isCompleted && set.weightKg > 0) {
            const currentPr = prMap.get(ex.exerciseName);
            if (!currentPr || set.weightKg > currentPr.maxWeightKg) {
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

    // Consistency: Workouts completed in the past 7 days and 30 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const workoutsLast7Days = sessions.filter((s) => new Date(s.startedAt) >= sevenDaysAgo).length;
    const workoutsLast30Days = sessions.filter((s) => new Date(s.startedAt) >= thirtyDaysAgo).length;

    return NextResponse.json({
      success: true,
      sessions,
      personalRecords,
      stats: {
        totalWorkouts: sessions.length,
        workoutsLast7Days,
        workoutsLast30Days,
      },
    });
  } catch (error) {
    console.error('Workouts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
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
      title = 'Workout Session',
      planId,
      planName,
      startedAt,
      endedAt = new Date().toISOString(),
      durationMinutes = 0,
      notes,
      exercises = [],
    } = body;

    // Calculate total sets, reps, volume
    let totalVolumeKg = 0;
    let totalSets = 0;
    let totalReps = 0;

    for (const ex of exercises) {
      if (Array.isArray(ex.sets)) {
        for (const s of ex.sets) {
          if (s.isCompleted !== false) {
            totalSets += 1;
            const reps = parseInt(String(s.reps)) || 0;
            const weight = parseFloat(String(s.weightKg)) || 0;
            totalReps += reps;
            totalVolumeKg += reps * weight;
          }
        }
      }
    }

    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        title: title.trim(),
        planId: planId || null,
        planName: planName || null,
        startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - durationMinutes * 60 * 1000),
        endedAt: new Date(endedAt),
        durationMinutes: Math.max(1, Math.round(durationMinutes)),
        totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
        totalSets,
        totalReps,
        status: 'completed',
        notes: notes?.trim() || null,
        exercises: {
          create: exercises.map((ex: any, exIdx: number) => ({
            exerciseName: ex.exerciseName || 'Exercise',
            muscleGroup: ex.muscleGroup || 'Full Body',
            order: exIdx + 1,
            sets: {
              create: (ex.sets || []).map((s: any, sIdx: number) => ({
                setNumber: s.setNumber || sIdx + 1,
                reps: parseInt(String(s.reps)) || 10,
                weightKg: parseFloat(String(s.weightKg)) || 0,
                isCompleted: s.isCompleted !== false,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    // Update today's daily check-in if one exists or create
    const todayStr = getTodayString();
    await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: todayStr,
        },
      },
      create: {
        userId: user.id,
        date: todayStr,
        workoutCompleted: true,
      },
      update: {
        workoutCompleted: true,
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Workouts POST error:', error);
    return NextResponse.json({ error: 'Failed to save workout session' }, { status: 500 });
  }
}
