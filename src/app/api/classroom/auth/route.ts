import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getGoogleClassroomAuthUrl } from '@/lib/classroomService';
import { getBaseUrl, generateOAuthState, setOAuthStateCookie } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const loginUrl = new URL('/login?redirect=/assignments', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const errorUrl = new URL(
        '/assignments?error=config_missing&message=' +
          encodeURIComponent('Google Classroom OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env'),
        request.url
      );
      return NextResponse.redirect(errorUrl);
    }

    const baseUrl = getBaseUrl(request);
    const redirectUri = `${baseUrl}/api/classroom/callback`;

    // State incorporates random nonce + userId for CSRF verification
    const nonce = generateOAuthState();
    const state = `${user.id}:${nonce}`;

    const authUrl = getGoogleClassroomAuthUrl(state, redirectUri);
    const response = NextResponse.redirect(authUrl);

    // Save state in secure HTTP-only cookie
    setOAuthStateCookie(response, state);

    return response;
  } catch (error: any) {
    console.error('Error starting Google Classroom OAuth:', error);
    const redirectUrl = new URL(
      '/assignments?error=auth_start_failed&message=' + encodeURIComponent(error.message || 'Failed to start authorization'),
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }
}
