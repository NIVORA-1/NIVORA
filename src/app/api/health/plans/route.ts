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

    const plans = await prisma.workoutPlan.findMany({
      where: { userId: user.id },
      include: {
        days: {
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error('Workout plans GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workout plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, goal = 'Hypertrophy & Strength', isActive = true, days = [] } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    // If setting active, deactivate existing active plans for this user
    if (isActive) {
      await prisma.workoutPlan.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      });
    }

    const newPlan = await prisma.workoutPlan.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        goal,
        isActive,
        days: {
          create: days.map((day: any) => ({
            dayOfWeek: day.dayOfWeek || 'Monday',
            name: day.name || 'Workout Day',
            muscleGroups: Array.isArray(day.muscleGroups) ? day.muscleGroups : [],
            isRestDay: !!day.isRestDay,
            estimatedDuration: parseInt(String(day.estimatedDuration)) || 45,
            exercises: {
              create: (day.exercises || []).map((ex: any, idx: number) => ({
                exerciseName: ex.exerciseName || 'Exercise',
                muscleGroup: ex.muscleGroup || 'Full Body',
                targetSets: parseInt(String(ex.targetSets)) || 3,
                targetReps: String(ex.targetReps || '8-12'),
                targetWeightKg: ex.targetWeightKg ? parseFloat(String(ex.targetWeightKg)) : null,
                restSeconds: parseInt(String(ex.restSeconds)) || 90,
                order: idx + 1,
                notes: ex.notes || null,
              })),
            },
          })),
        },
      },
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

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error) {
    console.error('Workout plans POST error:', error);
    return NextResponse.json({ error: 'Failed to create workout plan' }, { status: 500 });
  }
}
