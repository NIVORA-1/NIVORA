import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // Also clear any Supabase session cookies
  try {
    const cookieStore = cookies();
    cookieStore.getAll().forEach((c) => {
      if (c.name.startsWith('sb-')) {
        response.cookies.set(c.name, '', {
          maxAge: 0,
          path: '/',
        });
      }
    });
  } catch {}

  return response;
}
