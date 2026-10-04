import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import prisma from './prisma';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment.');
  }
  return secret || 'nivora-student-os-super-secret-key-2026';
}

const AUTH_COOKIE = 'nivora_session_token';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
}

export interface PasswordResetTokenPayload {
  userId: string;
  email: string;
  resetId: string;
  purpose: 'password-reset';
}

/**
 * Signs an authenticated session token.
 * Default expiration is 7 days, or 30 days if rememberMe is true.
 */
export function signSessionToken(payload: UserSessionPayload, rememberMe = false): string {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

/**
 * Verifies an authenticated session token.
 */
export function verifySessionToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as UserSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Signs a short-lived authorization token for the password reset step.
 * Valid for 15 minutes.
 */
export function signResetToken(payload: Omit<PasswordResetTokenPayload, 'purpose'>): string {
  return jwt.sign({ ...payload, purpose: 'password-reset' }, getJwtSecret(), { expiresIn: '15m' });
}

/**
 * Verifies a password reset token.
 */
export function verifyResetToken(token: string): PasswordResetTokenPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as PasswordResetTokenPayload;
    if (payload.purpose !== 'password-reset' || !payload.userId || !payload.resetId) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 */
export function generateVerificationCode(): string {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Hashes a 6-digit verification code using SHA-256 with a salt derived from JWT_SECRET.
 */
export function hashCode(code: string): string {
  const salt = getJwtSecret();
  return crypto.createHmac('sha256', salt).update(code.trim()).digest('hex');
}

/**
 * Resolves the currently authenticated user from the HTTP-only cookie.
 * STRICT: Returns null if no token, invalid signature, or user does not exist in DB.
 * NEVER falls back to demo or seeded users.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.userId) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: { profile: true },
        });

        if (user) {
          return user;
        }
      }
    }

    // Fallback: Check if authenticated through Supabase session cookie directly
    try {
      const { createSupabaseServerClient } = await import('@/lib/supabase/server');
      const supabase = createSupabaseServerClient();
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser();

      if (sbUser?.email) {
        const cleanEmail = sbUser.email.toLowerCase().trim();
        let user = await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: { profile: true },
        });

        if (!user) {
          // If authenticated through Supabase (Google/GitHub/email) but not yet in DB,
          // ensure the Nivora user and student profile exist
          const { findOrCreateOAuthUser } = await import('@/lib/oauth');
          const userMeta = sbUser.user_metadata || {};
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
            (sbUser.app_metadata?.provider as string) ||
            (userMeta.provider as string) ||
            'google';

          await findOrCreateOAuthUser({
            email: cleanEmail,
            name: fullName,
            avatar: avatarUrl,
            provider: rawProvider,
            providerId: sbUser.id,
          });

          user = await prisma.user.findUnique({
            where: { email: cleanEmail },
            include: { profile: true },
          });
        }

        if (user) {
          return user;
        }
      }
    } catch {
      // Supabase session fallback non-fatal
    }

    return null;
  } catch (error) {
    console.error('getCurrentUser authentication error:', error);
    return null;
  }
}

export { AUTH_COOKIE };

