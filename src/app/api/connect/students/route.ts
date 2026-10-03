import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const streamFilter = searchParams.get('stream')?.trim() || '';
    const semesterFilter = searchParams.get('semester')?.trim() || '';
    const filter = searchParams.get('filter')?.trim() || 'all'; // 'all' | 'suggested'

    const currentUser = await getCurrentUser();

    // 1. Fetch user's existing connections to determine status
    const userConnections = currentUser
      ? await prisma.studentConnection.findMany({
          where: {
            OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
          },
        })
      : [];

    const connectionMap = new Map<
      string,
      { status: 'CONNECTED' | 'PENDING_SENT' | 'PENDING_RECEIVED'; connectionId: string }
    >();

    if (currentUser) {
      for (const conn of userConnections) {
        const otherId = conn.senderId === currentUser.id ? conn.receiverId : conn.senderId;
        if (conn.status === 'ACCEPTED') {
          connectionMap.set(otherId, { status: 'CONNECTED', connectionId: conn.id });
        } else if (conn.status === 'PENDING') {
          if (conn.senderId === currentUser.id) {
            connectionMap.set(otherId, { status: 'PENDING_SENT', connectionId: conn.id });
          } else {
            connectionMap.set(otherId, { status: 'PENDING_RECEIVED', connectionId: conn.id });
          }
        }
      }
    }

    // 2. Fetch candidates from database
    const users = await prisma.user.findMany({
      where: currentUser
        ? {
            id: { not: currentUser.id },
          }
        : undefined,
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
            cgpa: true,
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
          orderBy: { progress: 'desc' },
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
      orderBy: { name: 'asc' },
    });

    const currentProfile = currentUser?.profile;
    const currentUserSkills = currentUser
      ? await prisma.skill.findMany({ where: { userId: currentUser.id }, select: { name: true } })
      : [];
    const currentSkillNames = new Set(currentUserSkills.map((s) => s.name.toLowerCase()));
    const currentInterests = new Set((currentProfile?.interests || []).map((i) => i.toLowerCase()));

    // 3. Process, calculate suggestions & apply filters
    const results = users
      .map((student) => {
        const connInfo = connectionMap.get(student.id);
        const connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' =
          connInfo?.status || 'NONE';

        // Calculate matching affinity score
        let matchScore = 0;
        const matchReasons: string[] = [];

        if (currentProfile) {
          // Stream match
          if (
            student.profile?.streamCode &&
            student.profile.streamCode.toLowerCase() === (currentProfile.streamCode || '').toLowerCase()
          ) {
            matchScore += 30;
            matchReasons.push(`Same Stream (${student.profile.stream || student.profile.streamCode})`);
          } else if (
            student.profile?.stream &&
            currentProfile.stream &&
            student.profile.stream.toLowerCase().includes(currentProfile.stream.toLowerCase())
          ) {
            matchScore += 20;
            matchReasons.push('Related Academic Field');
          }

          // Semester match
          if (student.profile?.semester === currentProfile.semester) {
            matchScore += 15;
            matchReasons.push(`Semester ${student.profile?.semester} Peer`);
          }

          // College match
          if (
            student.profile?.college &&
            currentProfile.college &&
            student.profile.college.toLowerCase() === currentProfile.college.toLowerCase()
          ) {
            matchScore += 10;
            matchReasons.push('Same College');
          }

          // Common skills
          const matchingSkills = student.skills
            .filter((sk) => currentSkillNames.has(sk.name.toLowerCase()))
            .map((sk) => sk.name);
          if (matchingSkills.length > 0) {
            matchScore += Math.min(30, matchingSkills.length * 10);
            matchReasons.push(`Shared skills: ${matchingSkills.slice(0, 2).join(', ')}`);
          }

          // Common interests
          const studentInterests = student.profile?.interests || [];
          const matchingInterests = studentInterests.filter((intr) =>
            currentInterests.has(intr.toLowerCase())
          );
          if (matchingInterests.length > 0) {
            matchScore += Math.min(25, matchingInterests.length * 8);
            matchReasons.push(`Common interests: ${matchingInterests.slice(0, 2).join(', ')}`);
          }
        }

        return {
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          college: student.profile?.college || 'University Campus',
          degree: student.profile?.degree || 'B.Tech',
          stream: student.profile?.stream || 'Computer Science',
          streamCode: student.profile?.streamCode || 'CSE',
          specialization: student.profile?.specialization || 'General',
          semester: student.profile?.semester || 1,
          year: student.profile?.year || 1,
          cgpa: student.profile?.cgpa || null,
          bio: student.profile?.bio || null,
          careerGoal: student.profile?.careerGoal || 'Software Engineer',
          interests: student.profile?.interests || [],
          skills: student.skills,
          projects: student.projects,
          connectionStatus,
          connectionId: connInfo?.connectionId,
          matchScore,
          matchReasons,
        };
      })
      .filter((student) => {
        // Stream filter
        if (streamFilter && streamFilter !== 'ALL') {
          const sFilter = streamFilter.toLowerCase();
          const matchesStream =
            student.streamCode.toLowerCase() === sFilter ||
            student.stream.toLowerCase().includes(sFilter);
          if (!matchesStream) return false;
        }

        // Semester filter
        if (semesterFilter && semesterFilter !== 'ALL') {
          if (student.semester !== parseInt(semesterFilter, 10)) return false;
        }

        // Search query
        if (search) {
          const nameMatch = student.name.toLowerCase().includes(search);
          const streamMatch =
            student.stream.toLowerCase().includes(search) ||
            student.streamCode.toLowerCase().includes(search);
          const specMatch = student.specialization.toLowerCase().includes(search);
          const collegeMatch = student.college.toLowerCase().includes(search);
          const degreeMatch = student.degree.toLowerCase().includes(search);
          const bioMatch = (student.bio || '').toLowerCase().includes(search);
          const goalMatch = student.careerGoal.toLowerCase().includes(search);
          const skillMatch = student.skills.some((sk) => sk.name.toLowerCase().includes(search));
          const projectMatch = student.projects.some(
            (p) =>
              p.name.toLowerCase().includes(search) ||
              p.techStack.toLowerCase().includes(search)
          );
          const interestMatch = student.interests.some((i) => i.toLowerCase().includes(search));

          if (
            !nameMatch &&
            !streamMatch &&
            !specMatch &&
            !collegeMatch &&
            !degreeMatch &&
            !bioMatch &&
            !goalMatch &&
            !skillMatch &&
            !projectMatch &&
            !interestMatch
          ) {
            return false;
          }
        }

        // Suggested filter: only show non-connected candidates with non-zero match or common attributes
        if (filter === 'suggested') {
          if (student.connectionStatus === 'CONNECTED') return false;
          if (student.matchScore <= 0) return false;
        }

        return true;
      });

    // Sort order
    if (filter === 'suggested') {
      results.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      // Unconnected first, then pending, then connected
      const statusOrder: Record<string, number> = {
        NONE: 0,
        PENDING_RECEIVED: 1,
        PENDING_SENT: 2,
        CONNECTED: 3,
      };
      results.sort((a, b) => {
        const diff = (statusOrder[a.connectionStatus] ?? 0) - (statusOrder[b.connectionStatus] ?? 0);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      });
    }

    return NextResponse.json({
      students: results,
      totalCount: results.length,
    });
  } catch (error) {
    console.error('Students GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
