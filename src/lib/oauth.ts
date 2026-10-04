import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signSessionToken, AUTH_COOKIE } from '@/lib/auth';
import { getStreamConfig } from '@/lib/personalization';
import { NextResponse } from 'next/server';

export const OAUTH_STATE_COOKIE = 'nivora_oauth_state';

/**
 * Resolves the application base URL for OAuth callbacks.
 * Prioritizes incoming request origin (including x-forwarded-host on Vercel),
 * ensuring callbacks never misroute between localhost and production domains.
 */
export function getBaseUrl(request?: Request): string {
  if (request) {
    try {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
      if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
      }
      const host = request.headers.get('host');
      if (host) {
        const proto = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
        return `${proto}://${host}`;
      }
      const url = new URL(request.url);
      return url.origin;
    } catch {}
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

/**
 * Generates a cryptographically random state token for CSRF protection.
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Sets the OAuth CSRF state cookie on the response.
 */
export function setOAuthStateCookie(response: NextResponse, state: string) {
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
}

/**
 * Clears the OAuth state cookie from the response.
 */
export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Attaches the authenticated user session cookie to the response.
 */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 14, // 14 days
    path: '/',
  });
}

export interface OAuthUserProfile {
  email: string;
  name: string;
  avatar?: string | null;
  provider: 'google' | 'github' | 'email' | string;
  providerId: string;
  password?: string;
}

/**
 * Exchanges Google OAuth code for user profile.
 */
export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<OAuthUserProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('CONFIG_MISSING');
  }

  // 1. Exchange authorization code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error('Google token exchange error:', errorText);
    throw new Error('TOKEN_EXCHANGE_FAILED');
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error('TOKEN_MISSING');
  }

  // 2. Fetch user profile
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    throw new Error('USER_FETCH_FAILED');
  }

  const userData = await userRes.json();
  if (!userData.email) {
    throw new Error('EMAIL_MISSING');
  }

  return {
    email: userData.email,
    name: userData.name || userData.given_name || userData.email.split('@')[0],
    avatar: userData.picture || null,
    provider: 'google',
    providerId: userData.sub,
  };
}

/**
 * Exchanges GitHub OAuth code for user profile (with private email fallback).
 */
export async function exchangeGitHubCode(code: string, redirectUri: string): Promise<OAuthUserProfile> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('CONFIG_MISSING');
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error('GitHub token exchange error:', errorText);
    throw new Error('TOKEN_EXCHANGE_FAILED');
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error(tokenData.error || 'TOKEN_MISSING');
  }

  // 2. Fetch user profile
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Nivora-Student-OS',
    },
  });

  if (!userRes.ok) {
    throw new Error('USER_FETCH_FAILED');
  }

  const userData = await userRes.json();
  let email = userData.email;

  // 3. If primary email is private on GitHub profile, fetch from emails endpoint
  if (!email) {
    try {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Nivora-Student-OS',
        },
      });

      if (emailsRes.ok) {
        const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsRes.json();
        const primaryVerified = emails.find((e) => e.primary && e.verified);
        const anyVerified = emails.find((e) => e.verified);
        email = primaryVerified?.email || anyVerified?.email || emails[0]?.email;
      }
    } catch (e) {
      console.error('GitHub email fetch fallback error:', e);
    }
  }

  if (!email) {
    throw new Error('EMAIL_MISSING');
  }

  return {
    email,
    name: userData.name || userData.login || email.split('@')[0],
    avatar: userData.avatar_url || null,
    provider: 'github',
    providerId: String(userData.id),
  };
}

/**
 * Finds an existing user by email or creates a new one following Nivora's
 * exact student profile defaults. Never duplicates accounts for the same email.
 */
export async function findOrCreateOAuthUser(profile: OAuthUserProfile) {
  const cleanEmail = profile.email.toLowerCase().trim();
  const cleanName = profile.name.trim();

  // 1. Look for existing user with this email
  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { profile: true },
  });

  if (user) {
    // Existing user found -> Link/Update profile avatar if none exists
    if (!user.avatar && profile.avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: profile.avatar },
        include: { profile: true },
      });
    }

    const needsOnboarding = !user.profile || user.profile.onboardingCompleted === false;

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user,
      token,
      isNewUser: false,
      needsOnboarding,
    };
  }

  // 2. New user -> Create user and initial StudentProfile with onboardingCompleted: false
  const streamConfig = getStreamConfig('CSE');
  const passwordHash = profile.password
    ? await bcrypt.hash(profile.password, 10)
    : await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  const avatar =
    profile.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=172329&textColor=8fc5a7`;

  user = await prisma.user.create({
    data: {
      email: cleanEmail,
      name: cleanName,
      passwordHash,
      avatar,
      profile: {
        create: {
          college: 'University Campus',
          degree: streamConfig.degree,
          stream: streamConfig.name,
          streamCode: streamConfig.code,
          specialization: streamConfig.specializations[0] || 'General Studies',
          year: 1,
          semester: 1,
          cgpa: 0.0,
          streakDays: 0,
          modulesVerified: 0,
          totalModules: 0,
          hoursPacedWeek: 0.0,
          focusScore: 0,
          reelsToday: 0,
          reelThreshold: 30,
          doomscrollMins: 0,
          doomscrollCap: 30,
          careerGoal: streamConfig.careerRoadmap.role,
          bio: '',
          onboardingCompleted: false,
          onboardingStep: 0,
          academicGoals: [],
          interests: [],
        },
      },
    },
    include: { profile: true },
  });

  const token = signSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    user,
    token,
    isNewUser: true,
    needsOnboarding: true,
  };
}
