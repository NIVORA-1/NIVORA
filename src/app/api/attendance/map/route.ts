import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { AttendanceService } from '@/lib/attendance/attendance-service';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { attendanceId, subjectId } = body;

    if (!attendanceId || !subjectId) {
      return NextResponse.json(
        { error: 'Attendance ID and Subject ID are required.' },
        { status: 400 }
      );
    }

    await AttendanceService.mapSubjectManually(user.id, attendanceId, subjectId);

    const refreshed = await AttendanceService.getUserAttendance(user.id);

    return NextResponse.json({
      success: true,
      message: 'Subject mapped successfully.',
      records: refreshed.records,
      unmatched: refreshed.unmatched,
    });
  } catch (error: any) {
    console.error('[Attendance Map API] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to map subject.' },
      { status: 500 }
    );
  }
}
