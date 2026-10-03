import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { syncStudentClassroom } from '@/lib/classroomService';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const result = await syncStudentClassroom(user.id);

    if (!result.success && result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors[0] || 'Failed to sync Google Classroom.',
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      syncedCoursesCount: result.syncedCoursesCount,
      syncedAssignmentsCount: result.syncedAssignmentsCount,
      unmappedCourses: result.unmappedCourses,
      message: `Successfully synchronized ${result.syncedAssignmentsCount} assignments from ${result.syncedCoursesCount} Google Classroom courses.`,
    });
  } catch (error: any) {
    console.error('Error in /api/classroom/sync:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while synchronizing Google Classroom.' },
      { status: 500 }
    );
  }
}
