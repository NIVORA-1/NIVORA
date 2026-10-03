import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  authenticateMyConnect,
  fetchMyConnectAttendance,
  MyConnectSession,
} from '@/lib/myconnectAdapter';
import jwt from 'jsonwebtoken';

const MYCONNECT_COOKIE = 'nivora_myconnect_session';
const SESSION_SECRET = process.env.JWT_SECRET || 'nivora-student-os-super-secret-key-2026';

function signMyConnectToken(session: MyConnectSession): string {
  // 14 day session expiration for student convenience
  return jwt.sign(session, SESSION_SECRET, { expiresIn: '14d' });
}

function verifyMyConnectToken(token: string): MyConnectSession | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as MyConnectSession;
  } catch {
    return null;
  }
}

/**
 * GET:
 * - default / action=data: Returns live attendance if connected
 * - action=status: Returns connection status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'data';
    const cookie = request.cookies.get(MYCONNECT_COOKIE)?.value;

    const session = cookie ? verifyMyConnectToken(cookie) : null;

    if (action === 'status') {
      return NextResponse.json({
        connected: Boolean(session),
        session: session
          ? {
              username: session.username,
              studentName: session.studentName,
              collegeUrl: session.collegeUrl,
              connectedAt: session.connectedAt,
              lastUpdated: session.lastUpdated,
            }
          : null,
      });
    }

    if (!session) {
      return NextResponse.json(
        {
          connected: false,
          error: 'MyConnect account is not connected. Please connect your student account to view live attendance.',
        },
        { status: 401 }
      );
    }

    // Fetch actual live attendance data
    const data = await fetchMyConnectAttendance(session);

    return NextResponse.json({
      connected: true,
      data,
    });
  } catch (error: any) {
    console.error('MyConnect GET error:', error?.message || error);
    return NextResponse.json(
      {
        error: 'Unable to retrieve attendance data. The MyConnect service may be momentarily unreachable.',
      },
      { status: 500 }
    );
  }
}

/**
 * POST:
 * - action='login': Authenticate credentials and store encrypted session
 * - action='disconnect': Clear session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'login';

    if (action === 'disconnect') {
      const response = NextResponse.json({
        success: true,
        message: 'MyConnect disconnected successfully.',
      });

      response.cookies.set(MYCONNECT_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });

      return response;
    }

    if (action === 'login') {
      const { username, password, collegeUrl } = body;

      if (!username || !password) {
        return NextResponse.json(
          { error: 'Please enter both your Student Username/ID and Password.' },
          { status: 400 }
        );
      }

      // Call dedicated isolated adapter
      const authResult = await authenticateMyConnect({
        username,
        password,
        collegeUrl,
      });

      if (!authResult.success || !authResult.session) {
        return NextResponse.json(
          {
            error:
              authResult.error ||
              'MyConnect authentication failed. Please check your Student ID and Password.',
            diagnostics: authResult.diagnostics,
          },
          { status: 401 }
        );
      }

      // Generate secure signed JWT session token (NEVER storing password)
      const token = signMyConnectToken(authResult.session);

      const response = NextResponse.json({
        success: true,
        message: 'MyConnect student account connected successfully.',
        session: {
          username: authResult.session.username,
          studentName: authResult.session.studentName,
          collegeUrl: authResult.session.collegeUrl,
          connectedAt: authResult.session.connectedAt,
        },
        diagnostics: authResult.diagnostics,
      });

      // Set secure HTTP-only cookie
      response.cookies.set(MYCONNECT_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 14 * 24 * 60 * 60, // 14 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('MyConnect POST error:', error?.message || error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while communicating with MyConnect.',
      },
      { status: 500 }
    );
  }
}
