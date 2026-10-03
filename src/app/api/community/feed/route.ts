import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [announcements, upcomingEvents, recentDiscussions] = await Promise.all([
      prisma.clubAnnouncement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          club: { select: { id: true, name: true, logo: true, category: true } },
          author: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.event.findMany({
        where: { eventDate: { gte: new Date() }, isCancelled: false },
        take: 5,
        orderBy: { eventDate: 'asc' },
        include: {
          club: { select: { id: true, name: true } },
        },
      }),
      prisma.discussion.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          group: { select: { id: true, name: true, subjectCode: true } },
        },
      }),
    ]);

    return NextResponse.json({
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        createdAt: a.createdAt.toISOString(),
        clubName: a.club.name,
        clubCategory: a.club.category,
        clubLogo: a.club.logo,
        authorName: a.author.name,
        authorAvatar: a.author.avatar,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        venue: e.venue,
        category: e.category,
        clubName: e.club?.name || 'Campus Organizing Committee',
      })),
      recentDiscussions: recentDiscussions.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        authorName: d.authorName,
        groupName: d.group.name,
        subjectCode: d.group.subjectCode,
        repliesCount: d.repliesCount,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Feed GET error:', error);
    return NextResponse.json({ announcements: [], upcomingEvents: [], recentDiscussions: [] });
  }
}
