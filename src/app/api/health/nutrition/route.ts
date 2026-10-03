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
      select: { dailyCalorieGoal: true },
    });
    const calorieGoal = profile?.dailyCalorieGoal || 2200;

    const meals = await prisma.mealLog.findMany({
      where: { userId: user.id, date: dateParam },
      orderBy: { loggedAt: 'asc' },
    });

    const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (m.carbsGrams || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (m.fatGrams || 0), 0);

    // Group meals by mealType
    const grouped = {
      Breakfast: meals.filter((m) => m.mealType.toLowerCase() === 'breakfast'),
      Lunch: meals.filter((m) => m.mealType.toLowerCase() === 'lunch'),
      Dinner: meals.filter((m) => m.mealType.toLowerCase() === 'dinner'),
      Snack: meals.filter((m) => m.mealType.toLowerCase() === 'snack'),
    };

    return NextResponse.json({
      success: true,
      date: dateParam,
      calorieGoal,
      totals: {
        calories: totalCalories,
        proteinGrams: Math.round(totalProtein * 10) / 10,
        carbsGrams: Math.round(totalCarbs * 10) / 10,
        fatGrams: Math.round(totalFat * 10) / 10,
        mealsCount: meals.length,
      },
      grouped,
      allMeals: meals,
    });
  } catch (error) {
    console.error('Nutrition GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition data' }, { status: 500 });
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
      mealType = 'Lunch',
      name,
      calories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      notes,
      date = getTodayString(),
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Meal description or food name is required' }, { status: 400 });
    }

    const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const normalizedType = validMealTypes.find((t) => t.toLowerCase() === String(mealType).toLowerCase()) || 'Snack';

    const log = await prisma.mealLog.create({
      data: {
        userId: user.id,
        date,
        mealType: normalizedType,
        name: name.trim(),
        calories: calories !== undefined && calories !== '' ? Math.max(0, parseInt(String(calories))) : null,
        proteinGrams: proteinGrams !== undefined && proteinGrams !== '' ? Math.max(0, parseFloat(String(proteinGrams))) : null,
        carbsGrams: carbsGrams !== undefined && carbsGrams !== '' ? Math.max(0, parseFloat(String(carbsGrams))) : null,
        fatGrams: fatGrams !== undefined && fatGrams !== '' ? Math.max(0, parseFloat(String(fatGrams))) : null,
        notes: notes?.trim() || null,
      },
    });

    // Update today's checkin meals count
    const todayCount = await prisma.mealLog.count({
      where: { userId: user.id, date },
    });

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
        mealsCount: todayCount,
      },
      update: {
        mealsCount: todayCount,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Nutrition POST error:', error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
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
      return NextResponse.json({ error: 'Meal ID required' }, { status: 400 });
    }

    const existing = await prisma.mealLog.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Meal log not found' }, { status: 404 });
    }

    await prisma.mealLog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Meal log deleted' });
  } catch (error) {
    console.error('Nutrition DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete meal log' }, { status: 500 });
  }
}
