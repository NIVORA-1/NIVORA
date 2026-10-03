import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  exchangeClassroomCode,
  fetchClassroomCourses,
  syncStudentClassroom,
  getClassroomOAuthCredentials,
} from '@/lib/classroomService';
import {
  getBaseUrl,
  OAUTH_STATE_COOKIE,
  clearOAuthStateCookie,
} from '@/lib/oauth';
import { encryptToken } from '@/lib/tokenEncryption';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  console.log('[Classroom Callback] Received OAuth callback:', {
    hasCode: !!code,
    hasState: !!state,
    error,
    errorDescription,
  });

  const redirectWithError = (errCode: string, userMessage: string) => {
    console.error(`[Classroom Callback Error] ${errCode}: ${userMessage}`);
    const redirectUrl = new URL(
      '/assignments?error=' +
        encodeURIComponent(errCode) +
        '&message=' +
        encodeURIComponent(userMessage),
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  };

  // 1. Handle error responses returned by Google OAuth consent screen
  if (error) {
    if (error === 'access_denied') {
      return redirectWithError(
        'access_denied',
        'Google Classroom authorization was canceled. Please grant read-only access to import assignments.'
      );
    }
    if (error === 'redirect_uri_mismatch') {
      return redirectWithError(
        'redirect_uri_mismatch',
        'The redirect URI does not match the Authorized Redirect URI configured in Google Cloud Console.'
      );
    }
    if (error === 'invalid_client') {
      return redirectWithError(
        'invalid_client',
        'The Google OAuth Client ID or Client Secret is invalid.'
      );
    }
    return redirectWithError(
      error,
      errorDescription || `Google OAuth returned an error: ${error}`
    );
  }

  // 2. Validate cryptographic state for CSRF protection
  const cookieStore = cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!state || !savedState || state !== savedState) {
    return redirectWithError(
      'state_mismatch',
      'Invalid or expired authorization session (state mismatch). Please try connecting again.'
    );
  }

  // 3. Ensure authorization code is present
  if (!code) {
    return redirectWithError(
      'missing_code',
      'Authorization code is missing from the Google response.'
    );
  }

  // 4. Validate current user session and state owner
  const user = await getCurrentUser();
  const [stateUserId] = state.split(':');

  if (!user || user.id !== stateUserId) {
    return redirectWithError(
      'unauthorized',
      'User session expired or mismatched. Please log into NIVORA and try again.'
    );
  }

  // 5. Verify server environment variables
  const { clientId, clientSecret, configuredRedirect } = getClassroomOAuthCredentials();
  if (!clientId || !clientSecret) {
    return redirectWithError(
      'missing_env_vars',
      'Google Classroom OAuth credentials (GOOGLE_CLASSROOM_CLIENT_ID / GOOGLE_CLASSROOM_CLIENT_SECRET) are missing on the server.'
    );
  }

  const baseUrl = getBaseUrl(request);
  const redirectUri =
    configuredRedirect || `${baseUrl}/api/integrations/google-classroom/callback`;

  try {
    // 6. Exchange code for access & refresh tokens
    console.log('[Classroom Callback] Exchanging authorization code for tokens...');
    const tokenInfo = await exchangeClassroomCode(code, redirectUri);

    // 7. Verify Classroom API immediately (Requirement 9)
    // Do NOT show "Connected" until the API request succeeds.
    console.log('[Classroom Callback] Verifying Classroom API access with courses.list...');
    try {
      await fetchClassroomCourses(tokenInfo.accessToken);
    } catch (apiErr: any) {
      console.error('[Classroom Callback] Classroom API verification failed:', apiErr);
      return redirectWithError(
        'api_test_failed',
        `Google Classroom API test failed: ${apiErr.message || 'API call failed'}. Please verify that the Google Classroom API is enabled in your Google Cloud Console.`
      );
    }

    const expiresAt = new Date(Date.now() + tokenInfo.expiresIn * 1000);

    // 8. Securely store tokens encrypted at rest via AES-256-GCM
    console.log('[Classroom Callback] Storing connection for user:', user.id, 'email:', tokenInfo.email);
    await prisma.googleClassroomConnection.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        googleAccountId: tokenInfo.googleAccountId || null,
        googleEmail: tokenInfo.email || null,
        accessToken: encryptToken(tokenInfo.accessToken),
        refreshToken: tokenInfo.refreshToken ? encryptToken(tokenInfo.refreshToken) : null,
        expiresAt,
        scopes: tokenInfo.scopes,
        status: 'connected',
        connectedAt: new Date(),
      },
      update: {
        googleAccountId: tokenInfo.googleAccountId || undefined,
        googleEmail: tokenInfo.email || undefined,
        accessToken: encryptToken(tokenInfo.accessToken),
        ...(tokenInfo.refreshToken && {
          refreshToken: encryptToken(tokenInfo.refreshToken),
        }),
        expiresAt,
        scopes: tokenInfo.scopes,
        status: 'connected',
      },
    });

    // 9. Fetch coursework for user's enrolled courses immediately
    try {
      console.log('[Classroom Callback] Performing initial coursework synchronization...');
      await syncStudentClassroom(user.id);
    } catch (syncErr: any) {
      console.warn('[Classroom Callback] Initial sync warning:', syncErr.message);
    }

    console.log('[Classroom Callback] Google Classroom connected successfully!');
    const successUrl = new URL('/assignments?connected=true', request.url);
    const response = NextResponse.redirect(successUrl);
    clearOAuthStateCookie(response);
    return response;
  } catch (err: any) {
    console.error('[Classroom Callback] Exception during token exchange or setup:', err);
    return redirectWithError(
      'token_exchange_failed',
      err.message || 'Failed to complete Google Classroom authorization.'
    );
  }
}
