import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseConfigStatus } from '@/lib/supabase/client';
import { findOrCreateOAuthUser, getBaseUrl, setSessionCookie } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

function renderClientCallbackHtml(supabaseUrl: string, anonKey: string, baseUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authenticating with NIVORA...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      background: #0D0F12;
      color: #F3F4F6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      user-select: none;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 107, 74, 0.2);
      border-top-color: #FF6B4A;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    .text {
      font-size: 13px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 600;
      color: #9CA3AF;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div class="text">Authenticating session...</div>
  <script type="module">
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

    const supabaseUrl = ${JSON.stringify(supabaseUrl)};
    const anonKey = ${JSON.stringify(anonKey)};
    const baseUrl = ${JSON.stringify(baseUrl)};
    const supabase = createClient(supabaseUrl, anonKey);

    async function syncAndRedirect(session) {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token }),
        });
        if (res.ok) {
          const data = await res.json();
          const target = data.needsOnboarding ? '/onboarding' : '/home';
          window.location.replace(target);
          return true;
        }
      } catch (err) {
        console.error('Session sync error:', err);
      }
      window.location.replace('/home');
      return true;
    }

    async function handleAuth() {
      try {
        // 1. Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await syncAndRedirect(session);
          return;
        }

        // 2. Listen for auth change (e.g. from hash fragment #access_token=...)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            subscription.unsubscribe();
            await syncAndRedirect(session);
          }
        });

        // 3. Fallback timeout if no session can be detected
        setTimeout(async () => {
          subscription.unsubscribe();
          const { data: { session: finalCheck } } = await supabase.auth.getSession();
          if (finalCheck?.user) {
            await syncAndRedirect(finalCheck);
          } else {
            window.location.replace('/login?error=oauth_failed&message=Authentication+could+not+be+completed');
          }
        }, 3000);
      } catch (err) {
        console.error('Callback error:', err);
        window.location.replace('/login?error=auth_callback_failed');
      }
    }

    handleAuth();
  </script>
</body>
</html>`;
}

/**
 * Supabase PKCE / SSR OAuth Callback Route Handler.
 * Exchanges authorization code for a Supabase session, retrieves user details,
 * creates or links the Nivora student record, sets the Nivora JWT session cookie,
 * and routes to onboarding or the student dashboard.
 * If code is missing (e.g. implicit OAuth with hash fragment), gracefully serves
 * client-side session resolution without error.
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

  // 2. If code is absent, serve client recovery HTML to process potential hash fragment (#access_token=...)
  if (!code) {
    return new Response(renderClientCallbackHtml(supabaseUrl, anonKey, baseUrl), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

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
      console.warn('[Auth Callback] Server exchangeCodeForSession failed, serving client fallback:', exchangeError?.message);
      // Fallback: Code might have already been exchanged by client or requires client PKCE verifier
      return new Response(renderClientCallbackHtml(supabaseUrl, anonKey, baseUrl), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
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
