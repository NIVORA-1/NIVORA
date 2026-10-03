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

    const savedRecords = await prisma.savedResource.findMany({
      where: { userId: user.id },
      include: {
        resource: {
          include: {
            subject: {
              select: { id: true, code: true, name: true },
            },
            topic: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    const savedResources = savedRecords.map((sr) => ({
      id: sr.resource.id,
      title: sr.resource.title,
      description: sr.resource.description,
      type: sr.resource.type,
      url: sr.resource.url,
      thumbnailUrl: sr.resource.thumbnailUrl,
      channel: sr.resource.channel,
      duration: sr.resource.duration,
      fileSize: sr.resource.fileSize,
      author: sr.resource.author,
      subjectId: sr.resource.subjectId,
      subjectCode: sr.resource.subject.code,
      subjectName: sr.resource.subject.name,
      topicId: sr.resource.topicId,
      topicTitle: sr.resource.topic?.title || null,
      savedAt: sr.savedAt,
      isSaved: true,
    }));

    return NextResponse.json(savedResources);
  } catch (error) {
    console.error('Saved resources GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch saved resources' }, { status: 500 });
  }
}
