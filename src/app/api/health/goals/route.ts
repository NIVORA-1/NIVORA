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

    const goals = await prisma.healthGoal.findMany({
      where: { userId: user.id },
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      goals,
      activeCount: goals.filter((g) => !g.isCompleted).length,
      completedCount: goals.filter((g) => g.isCompleted).length,
    });
  } catch (error) {
    console.error('Health goals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch health goals' }, { status: 500 });
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
      title,
      target,
      unit = 'times/week',
      frequency = 'weekly',
      category = 'fitness',
      startDate = new Date().toISOString(),
      endDate,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 });
    }

    const parsedTarget = parseFloat(String(target));
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return NextResponse.json({ error: 'A positive target number is required' }, { status: 400 });
    }

    const goal = await prisma.healthGoal.create({
      data: {
        userId: user.id,
        title: title.trim(),
        target: parsedTarget,
        unit: unit.trim(),
        frequency: frequency === 'daily' ? 'daily' : 'weekly',
        category: category || 'fitness',
        currentProgress: 0,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCompleted: false,
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('Health goals POST error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, currentProgress, isCompleted } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const existing = await prisma.healthGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (currentProgress !== undefined) {
      const progress = parseFloat(String(currentProgress));
      if (!isNaN(progress)) {
        updateData.currentProgress = Math.max(0, progress);
        if (updateData.currentProgress >= existing.target) {
          updateData.isCompleted = true;
        }
      }
    }

    if (typeof isCompleted === 'boolean') {
      updateData.isCompleted = isCompleted;
      if (isCompleted && existing.currentProgress < existing.target) {
        updateData.currentProgress = existing.target;
      }
    }

    const updated = await prisma.healthGoal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, goal: updated });
  } catch (error) {
    console.error('Health goals PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
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
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    const existing = await prisma.healthGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    await prisma.healthGoal.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    console.error('Health goals DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
