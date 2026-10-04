import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser, signSessionToken, AUTH_COOKIE } from '@/lib/auth';
import { setSessionCookie } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
      },
    });

    // If session cookie is missing (e.g. user authenticated via Supabase OAuth), set it!
    const cookieStore = cookies();
    if (!cookieStore.get(AUTH_COOKIE)?.value) {
      const token = signSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      setSessionCookie(response, token);
    }

    return response;
  } catch (error) {
    console.error('Auth ME API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
