import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getBaseUrl,
  OAUTH_STATE_COOKIE,
  clearOAuthStateCookie,
  setSessionCookie,
  exchangeGoogleCode,
  findOrCreateOAuthUser,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = getBaseUrl(request);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const cookieStore = cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  // 1. Handle user cancellation or provider error
  if (error) {
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', error === 'access_denied' ? 'oauth_cancelled' : 'oauth_failed');
    redirectUrl.searchParams.set('provider', 'Google');
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  // 2. Validate state token to protect against CSRF attacks
  if (!state || !savedState || state !== savedState) {
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_state_mismatch');
    redirectUrl.searchParams.set('provider', 'Google');
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  // 3. Ensure authorization code is present
  if (!code) {
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    redirectUrl.searchParams.set('provider', 'Google');
    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    const profile = await exchangeGoogleCode(code, redirectUri);

    // 4. Link existing user or create new student account
    const { token, needsOnboarding } = await findOrCreateOAuthUser(profile);

    // 5. Route to onboarding questionnaire if incomplete, otherwise to dashboard
    const targetPath = needsOnboarding ? '/onboarding' : '/home';
    const redirectUrl = new URL(targetPath, baseUrl);

    const response = NextResponse.redirect(redirectUrl);
    setSessionCookie(response, token);
    clearOAuthStateCookie(response);
    return response;
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    const redirectUrl = new URL('/login', baseUrl);
    const errorCode =
      err.message === 'CONFIG_MISSING'
        ? 'oauth_not_configured'
        : err.message === 'EMAIL_MISSING'
        ? 'oauth_missing_email'
        : 'oauth_callback_failed';

    redirectUrl.searchParams.set('error', errorCode);
    redirectUrl.searchParams.set('provider', 'Google');

    const response = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(response);
    return response;
  }
}
