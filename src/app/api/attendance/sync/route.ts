import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { AttendanceService } from '@/lib/attendance/attendance-service';
import { AttendanceSource } from '@/lib/attendance/attendance-types';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const MYCONNECT_COOKIE = 'nivora_myconnect_session';
const SESSION_SECRET = process.env.JWT_SECRET || 'nivora-student-os-super-secret-key-2026';

export async function POST(request: Request) {
  try {
    // 1. Authenticate the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    let providerId: AttendanceSource = body.providerId || 'myconnect';

    // Check for MyConnect session cookie
    const cookieStore = cookies();
    const myconnectCookie = cookieStore.get(MYCONNECT_COOKIE)?.value;
    let myconnectSession: any = null;

    if (myconnectCookie) {
      try {
        myconnectSession = jwt.verify(myconnectCookie, SESSION_SECRET);
      } catch {}
    }

    const isErpConfigured = Boolean(
      process.env.COLLEGE_ERP_BASE_URL && process.env.COLLEGE_ERP_API_KEY
    );

    // Auto-select active provider
    if (!body.providerId) {
      if (myconnectSession) {
        providerId = 'myconnect';
      } else if (isErpConfigured) {
        providerId = 'college_erp';
      }
    }

    if (providerId === 'myconnect' && !myconnectSession) {
      return NextResponse.json(
        {
          success: false,
          error:
            'MyConnect is not connected. Please connect your student account or add attendance manually.',
        },
        { status: 400 }
      );
    }

    if (providerId === 'college_erp' && !isErpConfigured) {
      return NextResponse.json(
        {
          success: false,
          error:
            'College ERP is not configured on the server. Please add attendance manually or connect MyConnect.',
        },
        { status: 400 }
      );
    }

    // 2-6. Request attendance, normalize, match subjects, upsert records, update last_updated
    const result = await AttendanceService.syncAttendance(user.id, providerId, {
      userId: user.id,
      sessionToken: myconnectSession?.token,
      collegeUrl: myconnectSession?.collegeUrl,
      credentials: {
        username: myconnectSession?.username,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Attendance data unavailable from your connected source.',
        },
        { status: 502 }
      );
    }

    // 7. Return refreshed attendance records and summary
    const refreshed = await AttendanceService.getUserAttendance(user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.syncedCount} subject attendance records.`,
      records: refreshed.records,
      overall: refreshed.overall,
      unmatched: refreshed.unmatched,
      lastSynced: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Attendance Sync API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Server error occurred during attendance synchronization.',
      },
      { status: 500 }
    );
  }
}
