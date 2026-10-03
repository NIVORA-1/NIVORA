import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ connections: [], totalCount: 0 });
    }

    const acceptedConnections = await prisma.studentConnection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
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
      orderBy: { updatedAt: 'desc' },
    });

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

    const formatted = acceptedConnections.map((conn) => {
      const partner = conn.senderId === currentUser.id ? conn.receiver : conn.sender;
      return {
        id: conn.id,
        connectedSince: conn.updatedAt.toISOString(),
        partner: formatProfile(partner),
      };
    });

    return NextResponse.json({
      connections: formatted,
      totalCount: formatted.length,
    });
  } catch (error) {
    console.error('Connections GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}
