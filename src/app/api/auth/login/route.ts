import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signSessionToken, AUTH_COOKIE } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { findOrCreateOAuthUser } from '@/lib/oauth';

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe = false } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If Supabase is configured, authenticate through Supabase Auth
    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseServerClient();
        const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        // Check for unverified email attempt
        if (supaError) {
          const lowerMsg = (supaError.message || '').toLowerCase();
          if (lowerMsg.includes('email not confirmed') || lowerMsg.includes('unconfirmed')) {
            return NextResponse.json(
              {
                error: 'Please verify your university email before logging in. Check your inbox for the verification link.',
                needsVerification: true,
                email: cleanEmail,
              },
              { status: 403 }
            );
          }
        } else if (supaData?.user) {
          // Verify email confirmation status on Supabase user object
          if (!supaData.user.email_confirmed_at) {
            return NextResponse.json(
              {
                error: 'Please verify your university email before logging in. Check your inbox for the verification link.',
                needsVerification: true,
                email: cleanEmail,
              },
              { status: 403 }
            );
          }

          // User is confirmed in Supabase! Ensure Prisma profile exists
          const fullName =
            (supaData.user.user_metadata?.full_name as string) ||
            cleanEmail.split('@')[0];

          const { user, token } = await findOrCreateOAuthUser({
            email: cleanEmail,
            name: fullName,
            provider: 'email',
            providerId: supaData.user.id,
            password,
          });

          const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
          const response = NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              avatar: user.avatar,
              profile: user.profile,
            },
          });

          response.cookies.set(AUTH_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
            path: '/',
          });

          return response;
        }
      } catch (supaErr) {
        console.warn('[Login API] Supabase auth attempt notice:', supaErr);
      }
    }

    // 2. Fallback to Prisma database for existing/seed users
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      Boolean(rememberMe)
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      profile: user.profile,
    };

    const response = NextResponse.json({ success: true, user: safeUser });
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
