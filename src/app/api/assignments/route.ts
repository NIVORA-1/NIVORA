import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getStudentSubjects } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceFilter = searchParams.get('source') || 'all'; // all, google_classroom, manual
    const statusFilter = searchParams.get('status') || 'all'; // all, today, upcoming, overdue, completed
    const subjectFilter = searchParams.get('subject') || 'ALL';

    // Fetch user's assignments
    const allUserAssignments = await prisma.assignment.findMany({
      where: { userId: user.id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Compute dynamic status flags & counts across all assignments
    let todayCount = 0;
    let upcomingCount = 0;
    let overdueCount = 0;
    let completedCount = 0;
    let classroomCount = 0;
    let manualCount = 0;

    const enrichedAssignments = allUserAssignments.map((asg) => {
      const isCompleted = asg.status === 'completed';
      const deadlineDate = asg.deadline ? new Date(asg.deadline) : null;

      let effectiveStatus = asg.status;
      let isDueToday = false;
      let isOverdue = false;
      let isUpcoming = false;

      if (isCompleted) {
        effectiveStatus = 'completed';
        completedCount++;
      } else if (deadlineDate) {
        if (deadlineDate < now) {
          effectiveStatus = 'overdue';
          overdueCount++;
          isOverdue = true;
        } else if (deadlineDate >= startOfToday && deadlineDate <= endOfToday) {
          effectiveStatus = 'today';
          todayCount++;
          isDueToday = true;
        } else if (deadlineDate > endOfToday) {
          effectiveStatus = 'upcoming';
          upcomingCount++;
          isUpcoming = true;
        }
      } else {
        effectiveStatus = 'upcoming';
        upcomingCount++;
        isUpcoming = true;
      }

      if (asg.source === 'google_classroom') {
        classroomCount++;
      } else {
        manualCount++;
      }

      return {
        ...asg,
        effectiveStatus,
        isDueToday,
        isOverdue,
        isUpcoming,
      };
    });

    // Apply filters
    const filtered = enrichedAssignments.filter((asg) => {
      // Source filter
      if (sourceFilter === 'google_classroom' && asg.source !== 'google_classroom') return false;
      if (sourceFilter === 'manual' && asg.source === 'google_classroom') return false;

      // Status filter
      if (statusFilter === 'today' && !asg.isDueToday) return false;
      if (statusFilter === 'upcoming' && !asg.isUpcoming) return false;
      if (statusFilter === 'overdue' && !asg.isOverdue) return false;
      if (statusFilter === 'completed' && asg.status !== 'completed') return false;

      // Subject filter
      if (subjectFilter !== 'ALL') {
        const matchesCode = asg.code?.toLowerCase().includes(subjectFilter.toLowerCase());
        const matchesSub = asg.subject?.code?.toLowerCase() === subjectFilter.toLowerCase() ||
          asg.subject?.id === subjectFilter;
        if (!matchesCode && !matchesSub) return false;
      }

      return true;
    });

    // Gather student's known subjects
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
      },
      orderBy: { name: 'asc' },
    });

    // Also get connection status
    const connection = await prisma.googleClassroomConnection.findUnique({
      where: { userId: user.id },
      select: {
        status: true,
        lastSyncedAt: true,
        connectedAt: true,
      },
    });

    const isConnected = connection?.status === 'connected';

    return NextResponse.json({
      success: true,
      assignments: filtered,
      counts: {
        all: allUserAssignments.length,
        today: todayCount,
        upcoming: upcomingCount,
        overdue: overdueCount,
        completed: completedCount,
        classroom: classroomCount,
        manual: manualCount,
      },
      classroom: {
        isConnected,
        status: connection?.status || 'disconnected',
        lastSyncedAt: connection?.lastSyncedAt || null,
      },
      subjects,
    });
  } catch (error: any) {
    console.error('Error in GET /api/assignments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assignments.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description = '',
      code = 'ASG',
      subjectId = null,
      deadline = null,
      dueDate = null,
      dueTime = null,
      priority = 'NORMAL',
      estimatedMins = 45,
      weightage = 15.0,
      maxScore = 100.0,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Assignment title is required.' }, { status: 400 });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        userId: user.id,
        subjectId: subjectId || null,
        title: title.trim(),
        description: description.trim(),
        code: (code || 'ASG').trim().toUpperCase(),
        deadline: deadline ? new Date(deadline) : null,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        priority: priority || 'NORMAL',
        estimatedMins: parseInt(String(estimatedMins), 10) || 45,
        weightage: parseFloat(String(weightage)) || 15.0,
        maxScore: parseFloat(String(maxScore)) || 100.0,
        status: 'pending',
        source: 'manual',
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      assignment: newAssignment,
      message: 'Assignment created successfully.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/assignments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create assignment.' },
      { status: 500 }
    );
  }
}
