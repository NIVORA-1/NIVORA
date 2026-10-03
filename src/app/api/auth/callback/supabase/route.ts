import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { findOrCreateOAuthUser, getBaseUrl, setSessionCookie } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = getBaseUrl(request);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // 1. Handle user cancellation or OAuth error returned from provider / Supabase
  if (error) {
    console.warn('Supabase OAuth callback returned error:', error, errorDescription);
    const redirectUrl = new URL('/login', baseUrl);
    const isCancelled =
      error === 'access_denied' ||
      (errorDescription && errorDescription.toLowerCase().includes('cancel'));

    redirectUrl.searchParams.set('error', isCancelled ? 'oauth_cancelled' : 'oauth_failed');
    if (errorDescription) {
      redirectUrl.searchParams.set('message', errorDescription);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Validate authorization code
  if (!code) {
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    redirectUrl.searchParams.set('message', 'Authorization code missing');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data?.user) {
      console.error('Failed to exchange authorization code for session:', exchangeError);
      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('error', 'oauth_callback_failed');
      redirectUrl.searchParams.set(
        'message',
        exchangeError?.message || 'Failed to exchange authorization code'
      );
      return NextResponse.redirect(redirectUrl);
    }

    const authUser = data.user;
    const email = authUser.email;

    if (!email) {
      const redirectUrl = new URL('/login', baseUrl);
      redirectUrl.searchParams.set('error', 'oauth_missing_email');
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
      'oauth';

    const provider: 'google' | 'github' = rawProvider.toLowerCase().includes('git')
      ? 'github'
      : 'google';

    // 3. Link or create Nivora user & student profile (preserves existing student data and avoids duplicates)
    const { token, needsOnboarding } = await findOrCreateOAuthUser({
      email,
      name: fullName,
      avatar: avatarUrl,
      provider,
      providerId: authUser.id,
    });

    // 4. Determine redirect path (Do NOT bypass onboarding for new / un-onboarded students)
    const targetPath = needsOnboarding ? '/onboarding' : '/home';
    const redirectUrl = new URL(targetPath, baseUrl);

    const response = NextResponse.redirect(redirectUrl);

    // 5. Set persistent Nivora session cookie (14-day persistent JWT)
    setSessionCookie(response, token);

    return response;
  } catch (err: any) {
    console.error('Supabase OAuth callback processing error:', err);
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_callback_failed');
    if (err?.message) {
      redirectUrl.searchParams.set('message', err.message);
    }
    return NextResponse.redirect(redirectUrl);
  }
}
