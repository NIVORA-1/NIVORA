import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plan = await prisma.workoutPlan.findFirst({
      where: { id: params.id, userId: user.id },
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

    if (!plan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Workout plan single GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workout plan' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.workoutPlan.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, goal, isActive, days } = body;

    if (isActive) {
      await prisma.workoutPlan.updateMany({
        where: { userId: user.id, id: { not: params.id } },
        data: { isActive: false },
      });
    }

    // If days are provided, delete existing plan days and recreate
    if (Array.isArray(days)) {
      await prisma.workoutPlanDay.deleteMany({
        where: { planId: params.id },
      });
    }

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id: params.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(goal ? { goal } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
        ...(Array.isArray(days)
          ? {
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
            }
          : {}),
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

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error('Workout plan PUT error:', error);
    return NextResponse.json({ error: 'Failed to update workout plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.workoutPlan.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    await prisma.workoutPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    console.error('Workout plan DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete workout plan' }, { status: 500 });
  }
}
