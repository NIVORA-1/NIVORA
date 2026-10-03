import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const connection = await prisma.googleClassroomConnection.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        connectedAt: true,
        lastSyncedAt: true,
        expiresAt: true,
        googleAccountId: true,
      },
    });

    if (!connection || connection.status === 'disconnected') {
      return NextResponse.json({
        isConnected: false,
        status: 'disconnected',
        connection: null,
        courses: [],
        unmappedCourses: [],
      });
    }

    // Fetch synced courses
    const courses = await prisma.googleClassroomCourse.findMany({
      where: { userId: user.id },
      orderBy: { courseName: 'asc' },
    });

    // Check if token expired
    const isExpired = connection.expiresAt && new Date(connection.expiresAt).getTime() < Date.now();
    const effectiveStatus = isExpired ? 'expired' : connection.status;

    const unmappedCourses = courses.filter((c) => !c.nivoraSubjectId);

    // Count imported assignments
    const importedAssignmentsCount = await prisma.assignment.count({
      where: {
        userId: user.id,
        source: 'google_classroom',
      },
    });

    return NextResponse.json({
      isConnected: effectiveStatus === 'connected',
      status: effectiveStatus,
      connection: {
        connectedAt: connection.connectedAt,
        lastSyncedAt: connection.lastSyncedAt,
      },
      coursesCount: courses.length,
      importedAssignmentsCount,
      courses,
      unmappedCourses,
    });
  } catch (error: any) {
    console.error('Error in /api/classroom/status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Classroom connection status.' },
      { status: 500 }
    );
  }
}
