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

    const tasks = await prisma.plannerTask.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Planner GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, date, startTime, endTime, priority, relatedSubjectCode, meetingUrl } = body;

    const task = await prisma.plannerTask.create({
      data: {
        userId: user.id,
        title,
        description,
        category: category || 'personal',
        date: date || new Date().toISOString().split('T')[0],
        startTime,
        endTime,
        priority: priority || 'medium',
        relatedSubjectCode,
        meetingUrl,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Planner POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, isCompleted } = await request.json();

    const existing = await prisma.plannerTask.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updated = await prisma.plannerTask.update({
      where: { id },
      data: { isCompleted },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Planner PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
