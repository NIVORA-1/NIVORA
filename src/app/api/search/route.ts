import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({ subjects: [], topics: [], assignments: [], resources: [] });
    }

    const [subjects, topics, assignments, resources] = await Promise.all([
      prisma.subject.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
          ],
        },
        take: 5,
      }),
      prisma.topic.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { unitName: { contains: query } },
          ],
        },
        include: { subject: true },
        take: 5,
      }),
      prisma.assignment.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { subject: true },
        take: 5,
      }),
      prisma.resource.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        include: { subject: true },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      subjects,
      topics,
      assignments,
      resources,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
