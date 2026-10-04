import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { findOrCreateOAuthUser, setSessionCookie } from '@/lib/oauth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Explicit session synchronization endpoint.
 * Called by client components after Supabase authentication (OAuth / magic link / session restore)
 * to guarantee that the student's Prisma record exists and the HTTP-only Nivora session token is set.
 */
export async function POST(request: Request) {
  try {
    let accessToken: string | null = null;
    try {
      const body = await request.json();
      accessToken = body.access_token || null;
    } catch {}

    const supabase = createSupabaseServerClient();
    let authUser = null;

    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data?.user) {
        authUser = data.user;
      }
    }

    if (!authUser) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        authUser = data.user;
      }
    }

    if (!authUser || !authUser.email) {
      return NextResponse.json({ error: 'No active Supabase session found' }, { status: 401 });
    }

    const cleanEmail = authUser.email.toLowerCase().trim();
    const userMeta = authUser.user_metadata || {};
    const fullName =
      (userMeta.full_name as string) ||
      (userMeta.name as string) ||
      (userMeta.user_name as string) ||
      (userMeta.preferred_username as string) ||
      cleanEmail.split('@')[0];

    const avatarUrl =
      (userMeta.avatar_url as string) ||
      (userMeta.picture as string) ||
      null;

    const rawProvider =
      (authUser.app_metadata?.provider as string) ||
      (userMeta.provider as string) ||
      'google';

    const { token, needsOnboarding } = await findOrCreateOAuthUser({
      email: cleanEmail,
      name: fullName,
      avatar: avatarUrl,
      provider: rawProvider,
      providerId: authUser.id,
    });

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true },
    });

    const response = NextResponse.json({
      success: true,
      needsOnboarding,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            profile: user.profile,
          }
        : null,
    });

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Session sync error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to synchronize authentication session' },
      { status: 500 }
    );
  }
}
