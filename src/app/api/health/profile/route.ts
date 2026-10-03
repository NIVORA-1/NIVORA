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

    let profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.healthProfile.create({
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

    return NextResponse.json({
      success: true,
      profile,
      user: {
        name: user.name,
        email: user.email,
        degree: user.profile?.degree,
        stream: user.profile?.stream,
        streamCode: user.profile?.streamCode,
        year: user.profile?.year,
        semester: user.profile?.semester,
      },
    });
  } catch (error) {
    console.error('Health profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch health profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      waterGoalMl,
      sleepGoalHours,
      weeklyWorkoutGoal,
      dailyCalorieGoal,
      heightCm,
      weightKg,
      activityLevel,
      fitnessGoal,
    } = body;

    const dataToUpdate: Record<string, any> = {};
    if (typeof waterGoalMl === 'number') dataToUpdate.waterGoalMl = Math.max(500, Math.min(10000, waterGoalMl));
    if (typeof sleepGoalHours === 'number') dataToUpdate.sleepGoalHours = Math.max(4, Math.min(16, sleepGoalHours));
    if (typeof weeklyWorkoutGoal === 'number') dataToUpdate.weeklyWorkoutGoal = Math.max(1, Math.min(7, weeklyWorkoutGoal));
    if (typeof dailyCalorieGoal === 'number') dataToUpdate.dailyCalorieGoal = Math.max(800, Math.min(6000, dailyCalorieGoal));
    if (heightCm !== undefined) dataToUpdate.heightCm = heightCm === null ? null : parseFloat(String(heightCm));
    if (weightKg !== undefined) dataToUpdate.weightKg = weightKg === null ? null : parseFloat(String(weightKg));
    if (typeof activityLevel === 'string') dataToUpdate.activityLevel = activityLevel;
    if (typeof fitnessGoal === 'string') dataToUpdate.fitnessGoal = fitnessGoal;

    const updatedProfile = await prisma.healthProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...dataToUpdate,
      },
      update: dataToUpdate,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Health profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update health profile' }, { status: 500 });
  }
}
