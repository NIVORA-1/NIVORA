import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { AttendanceService } from '@/lib/attendance/attendance-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { subjectId, subjectCode, subjectName, attendedClasses, totalClasses } = body;

    if (!subjectCode && !subjectName) {
      return NextResponse.json(
        { error: 'Subject code or subject name is required.' },
        { status: 400 }
      );
    }

    const attended = Number(attendedClasses);
    const total = Number(totalClasses);

    if (isNaN(attended) || isNaN(total) || attended < 0 || total < 0) {
      return NextResponse.json(
        { error: 'Please enter valid non-negative numbers for attended and total classes.' },
        { status: 400 }
      );
    }

    if (attended > total) {
      return NextResponse.json(
        { error: 'Attended classes cannot be greater than total classes.' },
        { status: 400 }
      );
    }

    const record = await AttendanceService.recordManualAttendance(user.id, {
      subjectId: subjectId || null,
      subjectCode: subjectCode || subjectName,
      subjectName: subjectName || subjectCode,
      attendedClasses: attended,
      totalClasses: total,
    });

    const refreshed = await AttendanceService.getUserAttendance(user.id);

    return NextResponse.json({
      success: true,
      record,
      overall: refreshed.overall,
      message: 'Attendance record saved successfully.',
    });
  } catch (error: any) {
    console.error('[Attendance Manual API] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save attendance record.' },
      { status: 500 }
    );
  }
}
