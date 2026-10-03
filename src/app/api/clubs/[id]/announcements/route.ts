import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const club = await prisma.club.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const announcements = await prisma.clubAnnouncement.findMany({
      where: { clubId: club.id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Club announcements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const club = await prisma.club.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        memberships: {
          where: { userId: user.id },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const userMembership = club.memberships[0];
    const isAuthorized =
      club.leaderId === user.id ||
      userMembership?.role === 'ADMIN' ||
      userMembership?.role === 'LEAD';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Only club leads and admins can publish announcements' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Announcement title is required' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Announcement content is required' }, { status: 400 });
    }

    const announcement = await prisma.clubAnnouncement.create({
      data: {
        clubId: club.id,
        authorId: user.id,
        title: title.trim(),
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    // Notify all members of the club
    const clubMembers = await prisma.clubMembership.findMany({
      where: { clubId: club.id, userId: { not: user.id } },
      select: { userId: true },
    });

    if (clubMembers.length > 0) {
      await prisma.notification.createMany({
        data: clubMembers.map((m) => ({
          userId: m.userId,
          title: `New announcement from ${club.name}`,
          description: `${title.trim()}: ${content.trim().slice(0, 100)}...`,
          type: 'club',
          isRead: false,
        })),
      });
    }

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Club announcement POST error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
