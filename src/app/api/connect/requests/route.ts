import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ received: [], sent: [] });
    }

    const [receivedRequests, sentRequests] = await Promise.all([
      // Requests received by current user (waiting for approval)
      prisma.studentConnection.findMany({
        where: {
          receiverId: currentUser.id,
          status: 'PENDING',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              profile: {
                select: {
                  college: true,
                  degree: true,
                  stream: true,
                  streamCode: true,
                  specialization: true,
                  semester: true,
                  year: true,
                  bio: true,
                  careerGoal: true,
                  interests: true,
                },
              },
              skills: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  level: true,
                  progress: true,
                  verified: true,
                },
              },
              projects: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  techStack: true,
                  repoUrl: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Requests sent by current user (waiting for receiver to respond)
      prisma.studentConnection.findMany({
        where: {
          senderId: currentUser.id,
          status: 'PENDING',
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
              profile: {
                select: {
                  college: true,
                  degree: true,
                  stream: true,
                  streamCode: true,
                  specialization: true,
                  semester: true,
                  year: true,
                  bio: true,
                  careerGoal: true,
                  interests: true,
                },
              },
              skills: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  level: true,
                  progress: true,
                  verified: true,
                },
              },
              projects: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  techStack: true,
                  repoUrl: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formatProfile = (u: any) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      college: u.profile?.college || 'University Campus',
      degree: u.profile?.degree || 'B.Tech',
      stream: u.profile?.stream || 'Computer Science',
      streamCode: u.profile?.streamCode || 'CSE',
      specialization: u.profile?.specialization || 'General',
      semester: u.profile?.semester || 1,
      year: u.profile?.year || 1,
      bio: u.profile?.bio || null,
      careerGoal: u.profile?.careerGoal || 'Student',
      interests: u.profile?.interests || [],
      skills: u.skills || [],
      projects: u.projects || [],
    });

    return NextResponse.json({
      received: receivedRequests.map((r) => ({
        id: r.id,
        note: r.note,
        createdAt: r.createdAt.toISOString(),
        sender: formatProfile(r.sender),
      })),
      sent: sentRequests.map((r) => ({
        id: r.id,
        note: r.note,
        createdAt: r.createdAt.toISOString(),
        receiver: formatProfile(r.receiver),
      })),
    });
  } catch (error) {
    console.error('Connection requests GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch connection requests' }, { status: 500 });
  }
}
