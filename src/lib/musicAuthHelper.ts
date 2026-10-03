import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface AuthenticatedMusicUser {
  userId: string; // auth.users UUID
  email: string;
}

/**
 * Resolves the authenticated user for NIVORA Music operations.
 * NEVER trusts client-sent user_id.
 * Checks Supabase Auth session first, then falls back to NIVORA HTTP-only session cookie.
 * Ensures the user has a valid UUID in auth.users so foreign keys and RLS policies work.
 */
export async function getAuthenticatedMusicUser(): Promise<AuthenticatedMusicUser | null> {
  // 1. Check Supabase server session
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user: sbUser },
    } = await supabase.auth.getUser();

    if (sbUser && sbUser.id && sbUser.email) {
      return {
        userId: sbUser.id,
        email: sbUser.email,
      };
    }
  } catch (e) {
    // Supabase auth check error non-fatal, fallback to local session
  }

  // 2. Check local JWT session cookie (Nivora auth)
  try {
    const localUser = await getCurrentUser();
    if (localUser && localUser.email) {
      const cleanEmail = localUser.email.toLowerCase().trim();

      // Look up user's auth.users UUID
      const existing: any = await prisma.$queryRawUnsafe(
        `SELECT id FROM auth.users WHERE lower(email) = $1 LIMIT 1`,
        cleanEmail
      );

      if (existing && existing.length > 0 && existing[0]?.id) {
        return {
          userId: existing[0].id,
          email: cleanEmail,
        };
      }

      // If user does not yet exist in auth.users, register them so foreign key constraint holds
      const created: any = await prisma.$queryRawUnsafe(
        `INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
         VALUES (gen_random_uuid(), $1, '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated')
         RETURNING id`,
        cleanEmail
      );

      if (created && created.length > 0 && created[0]?.id) {
        return {
          userId: created[0].id,
          email: cleanEmail,
        };
      }
    }
  } catch (e) {
    console.error('Error resolving authenticated music user:', e);
  }

  return null;
}
