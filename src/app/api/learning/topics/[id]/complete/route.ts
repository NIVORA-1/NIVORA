import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: topicId } = params;

    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        subject: {
          include: {
            topics: { select: { id: true } },
          },
        },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const existingProgress = await prisma.topicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: topic.id,
        },
      },
    });

    const nextStatus = existingProgress ? !existingProgress.isCompleted : true;

    // Upsert topic progress
    const progress = await prisma.topicProgress.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: topic.id,
        },
      },
      update: {
        isCompleted: nextStatus,
        completedAt: nextStatus ? new Date() : null,
      },
      create: {
        userId: user.id,
        topicId: topic.id,
        subjectId: topic.subjectId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Record activity
    await prisma.learningActivity.create({
      data: {
        userId: user.id,
        subjectId: topic.subjectId,
        topicId: topic.id,
        completedAt: nextStatus ? new Date() : null,
      },
    });

    // If completed, create in-app notification
    if (nextStatus) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Topic Completed: ${topic.title}`,
          description: `Great progress! You completed ${topic.title} in ${topic.subject.name}.`,
          type: 'academic',
          isRead: false,
        },
      });
    }

    // Compute updated subject stats for user
    const userCompletedCount = await prisma.topicProgress.count({
      where: {
        userId: user.id,
        subjectId: topic.subjectId,
        isCompleted: true,
      },
    });

    const totalTopics = topic.subject.topics.length;
    const progressPercent = totalTopics > 0 ? Math.round((userCompletedCount / totalTopics) * 100) : 0;

    return NextResponse.json({
      success: true,
      topicId: topic.id,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
      completedTopics: userCompletedCount,
      totalTopics,
      progressPercent,
      status: userCompletedCount === 0 ? 'Not started' : userCompletedCount === totalTopics ? 'Completed' : `${progressPercent}%`,
    });
  } catch (error) {
    console.error('Topic complete error:', error);
    return NextResponse.json({ error: 'Failed to update topic completion' }, { status: 500 });
  }
}
