import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getGoogleClassroomAuthUrl,
  getClassroomOAuthCredentials,
} from '@/lib/classroomService';
import {
  getBaseUrl,
  generateOAuthState,
  setOAuthStateCookie,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleConnect(request);
}

export async function POST(request: Request) {
  return handleConnect(request);
}

async function handleConnect(request: Request) {
  const url = new URL(request.url);
  const wantsJson =
    request.headers.get('accept')?.includes('application/json') ||
    url.searchParams.get('format') === 'json';

  console.log('[Classroom Connect] Initiating Google Classroom connection request...');

  try {
    // 1. Verify authenticated user
    const user = await getCurrentUser();
    if (!user) {
      console.warn('[Classroom Connect] Unauthenticated user attempt');
      if (wantsJson) {
        return NextResponse.json(
          {
            success: false,
            error: 'unauthorized',
            message: 'You must be logged into NIVORA to connect Google Classroom.',
          },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login?redirect=/assignments', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Verify server-side credentials
    const { clientId, clientSecret, configuredRedirect } = getClassroomOAuthCredentials();

    if (!clientId || !clientSecret) {
      console.error('[Classroom Connect] Google Classroom OAuth credentials missing in server environment.');
      const errorMessage =
        'Google Classroom OAuth credentials (GOOGLE_CLASSROOM_CLIENT_ID / GOOGLE_CLASSROOM_CLIENT_SECRET) are not configured in .env. Please configure them to enable Google Classroom sync.';

      if (wantsJson) {
        return NextResponse.json(
          {
            success: false,
            error: 'config_missing',
            message: errorMessage,
            requiredEnvVars: [
              'GOOGLE_CLASSROOM_CLIENT_ID (or GOOGLE_CLIENT_ID)',
              'GOOGLE_CLASSROOM_CLIENT_SECRET (or GOOGLE_CLIENT_SECRET)',
              'GOOGLE_CLASSROOM_REDIRECT_URI (optional, defaults to /api/integrations/google-classroom/callback)',
            ],
          },
          { status: 400 }
        );
      }

      const errorUrl = new URL(
        '/assignments?error=config_missing&message=' + encodeURIComponent(errorMessage),
        request.url
      );
      return NextResponse.redirect(errorUrl);
    }

    // 3. Determine redirect URI
    const baseUrl = getBaseUrl(request);
    const redirectUri =
      configuredRedirect || `${baseUrl}/api/integrations/google-classroom/callback`;

    // 4. Generate cryptographically secure state incorporating random nonce and user.id
    const nonce = generateOAuthState();
    const state = `${user.id}:${nonce}`;

    console.log('[Classroom Connect] Generating auth URL:', {
      userId: user.id,
      clientId: `${clientId.slice(0, 12)}...`,
      redirectUri,
    });

    const authUrl = getGoogleClassroomAuthUrl(state, redirectUri);

    if (wantsJson) {
      const jsonResponse = NextResponse.json({
        success: true,
        authUrl,
        redirectUri,
        scopes: [
          'https://www.googleapis.com/auth/classroom.courses.readonly',
          'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
        ],
      });
      setOAuthStateCookie(jsonResponse, state);
      return jsonResponse;
    }

    const redirectResponse = NextResponse.redirect(authUrl);
    setOAuthStateCookie(redirectResponse, state);
    return redirectResponse;
  } catch (error: any) {
    console.error('[Classroom Connect] Error generating OAuth URL:', error);
    if (wantsJson) {
      return NextResponse.json(
        {
          success: false,
          error: 'connect_error',
          message: error.message || 'Failed to initiate Google Classroom authorization.',
        },
        { status: 500 }
      );
    }

    const errorUrl = new URL(
      '/assignments?error=connect_error&message=' +
        encodeURIComponent(error.message || 'Failed to initiate authorization'),
      request.url
    );
    return NextResponse.redirect(errorUrl);
  }
}
