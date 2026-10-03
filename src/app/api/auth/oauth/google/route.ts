import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/oauth';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseConfigStatus } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    const errorUrl = new URL('/login', baseUrl);
    errorUrl.searchParams.set('error', 'oauth_not_configured');
    errorUrl.searchParams.set('provider', 'Google');
    errorUrl.searchParams.set(
      'message',
      config.errorMessage || 'Supabase authentication is pending configuration: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.'
    );
    return NextResponse.redirect(errorUrl);
  }

  const supabaseUrl = getSupabaseUrl();
  const redirectTo = `${baseUrl}/auth/callback`;
  const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authUrl.searchParams.set('provider', 'google');
  authUrl.searchParams.set('redirect_to', redirectTo);

  return NextResponse.redirect(authUrl);
}
