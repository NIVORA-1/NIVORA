import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { AttendanceService } from '@/lib/attendance/attendance-service';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const MYCONNECT_COOKIE = 'nivora_myconnect_session';
const SESSION_SECRET = process.env.JWT_SECRET || 'nivora-student-os-super-secret-key-2026';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 1. Fetch real attendance records for this authenticated user
    const { records, overall, unmatched } = await AttendanceService.getUserAttendance(user.id);

    // 2. Fetch known subjects to support subject mapping and manual add
    const knownSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        instructor: true,
      },
      orderBy: { name: 'asc' },
    });

    // 3. Check connection status for MyConnect
    const cookieStore = cookies();
    const myconnectCookie = cookieStore.get(MYCONNECT_COOKIE)?.value;
    let isMyConnectConnected = false;
    let connectedSession = null;

    if (myconnectCookie) {
      try {
        const decoded = jwt.verify(myconnectCookie, SESSION_SECRET) as any;
        if (decoded && decoded.username) {
          isMyConnectConnected = true;
          connectedSession = {
            username: decoded.username,
            studentName: decoded.studentName,
            collegeUrl: decoded.collegeUrl,
          };
        }
      } catch {}
    }

    const isErpConfigured = Boolean(
      process.env.COLLEGE_ERP_BASE_URL && process.env.COLLEGE_ERP_API_KEY
    );

    return NextResponse.json({
      records,
      overall,
      unmatched,
      knownSubjects,
      connected: isMyConnectConnected || isErpConfigured,
      activeProvider: isMyConnectConnected ? 'myconnect' : isErpConfigured ? 'college_erp' : null,
      session: connectedSession,
      hasRecords: records.length > 0,
    });
  } catch (error: any) {
    console.error('[Attendance API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve attendance records.' },
      { status: 500 }
    );
  }
}
