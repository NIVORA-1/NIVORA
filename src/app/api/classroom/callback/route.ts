import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { exchangeClassroomCode, syncStudentClassroom } from '@/lib/classroomService';
import { getBaseUrl, OAUTH_STATE_COOKIE, clearOAuthStateCookie } from '@/lib/oauth';
import { encryptToken } from '@/lib/tokenEncryption';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const baseUrl = getBaseUrl(request);

  // 1. Handle user denied / error from Google
  if (error) {
    console.warn('[Classroom Callback] Google returned error:', error);
    const redirectUrl = new URL(
      '/assignments?error=' + encodeURIComponent(error) + '&message=' + encodeURIComponent('Google Classroom authorization was canceled.'),
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  // 2. Validate state against CSRF cookie
  const cookieStore = cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!state || !savedState || state !== savedState) {
    console.error('[Classroom Callback] CSRF state mismatch:', { state, savedState });
    const redirectUrl = new URL(
      '/assignments?error=invalid_state&message=' + encodeURIComponent('Invalid authorization session. Please try connecting again.'),
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  if (!code) {
    const redirectUrl = new URL(
      '/assignments?error=missing_code&message=' + encodeURIComponent('Authorization code missing from Google response.'),
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  // 3. Resolve user
  const user = await getCurrentUser();
  const [stateUserId] = state.split(':');

  if (!user || user.id !== stateUserId) {
    const redirectUrl = new URL(
      '/assignments?error=unauthorized&message=' + encodeURIComponent('User session expired. Please log in to connect Google Classroom.'),
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  try {
    const redirectUri = `${baseUrl}/api/classroom/callback`;

    // 4. Exchange code for tokens
    const tokenInfo = await exchangeClassroomCode(code, redirectUri);

    const expiresAt = new Date(Date.now() + tokenInfo.expiresIn * 1000);

    // 5. Encrypt tokens and save connection
    await prisma.googleClassroomConnection.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        googleAccountId: tokenInfo.googleAccountId || null,
        accessToken: encryptToken(tokenInfo.accessToken),
        refreshToken: tokenInfo.refreshToken ? encryptToken(tokenInfo.refreshToken) : null,
        expiresAt,
        scopes: tokenInfo.scopes,
        status: 'connected',
      },
      update: {
        googleAccountId: tokenInfo.googleAccountId || undefined,
        accessToken: encryptToken(tokenInfo.accessToken),
        ...(tokenInfo.refreshToken && {
          refreshToken: encryptToken(tokenInfo.refreshToken),
        }),
        expiresAt,
        scopes: tokenInfo.scopes,
        status: 'connected',
      },
    });

    // 6. Trigger immediate initial synchronization
    try {
      await syncStudentClassroom(user.id);
    } catch (syncErr: any) {
      console.warn('[Classroom Callback] Initial sync warning:', syncErr.message);
    }

    const successUrl = new URL('/assignments?connected=true', request.url);
    const response = NextResponse.redirect(successUrl);
    clearOAuthStateCookie(response);
    return response;
  } catch (err: any) {
    console.error('[Classroom Callback] Exception:', err);
    const redirectUrl = new URL(
      '/assignments?error=exchange_failed&message=' +
        encodeURIComponent(err.message || 'Failed to complete Google Classroom authorization.'),
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }
}
