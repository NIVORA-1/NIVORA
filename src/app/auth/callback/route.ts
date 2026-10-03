import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseConfigStatus } from '@/lib/supabase/client';
import { findOrCreateOAuthUser, getBaseUrl, setSessionCookie } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

/**
 * Supabase PKCE / SSR OAuth Callback Route Handler.
 * Exchanges authorization code for a Supabase session, retrieves user details,
 * creates or links the Nivora student record, sets the Nivora JWT session cookie,
 * and routes to onboarding or the student dashboard.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = getBaseUrl(request);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // 1. Handle user cancellation or OAuth/email error returned from provider / Supabase
  if (error) {
    console.warn('[Auth Callback] Provider returned error:', error, errorDescription);
    const redirectUrl = new URL('/login', baseUrl);
    const isCancelled =
      error === 'access_denied' &&
      errorDescription &&
      errorDescription.toLowerCase().includes('cancel');

    const isExpired =
      error === 'otp_expired' ||
      (errorDescription && errorDescription.toLowerCase().includes('expired')) ||
      (errorDescription && errorDescription.toLowerCase().includes('invalid'));

    if (isExpired) {
      redirectUrl.searchParams.set('error', 'link_expired');
      redirectUrl.searchParams.set(
        'message',
        'Your email verification link has expired or has already been used. Please request a new one.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    redirectUrl.searchParams.set('error', isCancelled ? 'oauth_cancelled' : 'oauth_failed');
    if (errorDescription) {
      redirectUrl.searchParams.set('message', errorDescription);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Validate authorization code
  if (!code) {
    console.warn('[Auth Callback] Missing authorization code parameter');
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    redirectUrl.searchParams.set(
      'message',
      'Authorization code is missing from the authentication callback URL.'
    );
    return NextResponse.redirect(redirectUrl);
  }

  const config = getSupabaseConfigStatus();
  if (!config.isConfigured) {
    console.error('[Auth Callback] Supabase environment variables missing:', config.missingVariables);
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_not_configured');
    redirectUrl.searchParams.set(
      'message',
      config.errorMessage || 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured in your .env or .env.local file.'
    );
    return NextResponse.redirect(redirectUrl);
  }

  const anonKey = getSupabaseAnonKey();
  const supabaseUrl = getSupabaseUrl();

  try {
    const cookieStore = cookies();
    const tempCookies: Array<{ name: string; value: string; options?: any }> = [];

    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              tempCookies.push({ name, value, options });
            });
          } catch {
            // Server component context safety
          }
        },
      },
    });

    // Exchange authorization code for Supabase auth session (PKCE)
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data?.user) {
      console.error('[Auth Callback] exchangeCodeForSession failed:', exchangeError);
      const errorMsg = exchangeError?.message || '';
      const isExpired =
        errorMsg.toLowerCase().includes('expired') ||
        errorMsg.toLowerCase().includes('invalid') ||
        errorMsg.toLowerCase().includes('already used');

      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('error', isExpired ? 'link_expired' : 'auth_callback_failed');
      redirectUrl.searchParams.set(
        'message',
        isExpired
          ? 'Your email verification link has expired or has already been used. Please request a new verification email.'
          : errorMsg || 'Failed to exchange authorization code for Supabase session.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    const authUser = data.user;
    const email = authUser.email;

    if (!email) {
      console.error('[Auth Callback] No email returned for user:', authUser.id);
      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('error', 'auth_missing_email');
      redirectUrl.searchParams.set(
        'message',
        'Could not retrieve a verified email address from your account.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Extract profile details from Supabase auth user metadata
    const userMeta = authUser.user_metadata || {};
    const fullName =
      (userMeta.full_name as string) ||
      (userMeta.name as string) ||
      (userMeta.user_name as string) ||
      (userMeta.preferred_username as string) ||
      email.split('@')[0];

    const avatarUrl =
      (userMeta.avatar_url as string) ||
      (userMeta.picture as string) ||
      null;

    const rawProvider =
      (authUser.app_metadata?.provider as string) ||
      (userMeta.provider as string) ||
      'email';

    const isOAuth =
      rawProvider.toLowerCase().includes('git') ||
      rawProvider.toLowerCase().includes('goog');

    const provider: 'google' | 'github' | 'email' = rawProvider.toLowerCase().includes('git')
      ? 'github'
      : rawProvider.toLowerCase().includes('goog')
      ? 'google'
      : 'email';

    // Strict verification check:
    // Email/password signups MUST have email_confirmed_at populated.
    // OAuth providers (Google, GitHub) verify emails according to their provider state.
    if (!isOAuth && !authUser.email_confirmed_at) {
      console.warn('[Auth Callback] Email is not confirmed for user:', email);
      const redirectUrl = new URL('/verify-email', baseUrl);
      redirectUrl.searchParams.set('email', email);
      redirectUrl.searchParams.set('unconfirmed', 'true');
      return NextResponse.redirect(redirectUrl);
    }

    // 3. Link or create Nivora user & student profile
    // Preserves existing StudentProfile relationships and never creates duplicate accounts
    const { token, needsOnboarding } = await findOrCreateOAuthUser({
      email,
      name: fullName,
      avatar: avatarUrl,
      provider,
      providerId: authUser.id,
    });

    // 4. Send new users through onboarding, existing users to dashboard (/home)
    const targetPath = needsOnboarding ? '/onboarding' : '/home';
    const redirectUrl = new URL(targetPath, baseUrl);
    const response = NextResponse.redirect(redirectUrl);

    // 5. Transfer Supabase session cookies to redirect response
    tempCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    // 6. Set persistent 14-day Nivora session token cookie
    setSessionCookie(response, token);

    return response;
  } catch (err: any) {
    console.error('[Auth Callback] Unexpected processing error:', err);
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'auth_callback_failed');
    redirectUrl.searchParams.set(
      'message',
      err?.message || 'An unexpected error occurred during authentication.'
    );
    return NextResponse.redirect(redirectUrl);
  }
}
