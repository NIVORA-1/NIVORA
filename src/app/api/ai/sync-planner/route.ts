import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface SyncTaskPayload {
  title: string;
  description?: string;
  category?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
  relatedSubjectCode?: string;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to sync study plans with your Nivora Planner.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const tasks: SyncTaskPayload[] = body.tasks;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks provided for synchronization.' }, { status: 400 });
    }

    // Limit to at most 50 tasks per sync for safety
    const safeTasks = tasks.slice(0, 50).map((t) => ({
      userId: user.id,
      title: t.title || 'Study Session',
      description: t.description || null,
      category: t.category || 'deepwork',
      date: t.date || new Date().toISOString().split('T')[0],
      startTime: t.startTime || '09:00 AM',
      endTime: t.endTime || '11:00 AM',
      priority: t.priority || 'high',
      relatedSubjectCode: t.relatedSubjectCode || null,
      isCompleted: false,
    }));

    const result = await prisma.plannerTask.createMany({
      data: safeTasks,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully synchronized ${result.count} study session(s) into your Nivora Planner!`,
    });
  } catch (error) {
    console.error('Study plan sync error:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize study plan with planner.' },
      { status: 500 }
    );
  }
}
