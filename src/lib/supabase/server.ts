import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseConfigStatus } from './client';

/**
 * Creates a server-side Supabase client for Next.js App Router route handlers and Server Components.
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from process.env.
 * Reads and writes cookies using next/headers.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    const status = getSupabaseConfigStatus();
    throw new Error(status.errorMessage || 'Supabase authentication is not configured on server.');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Can be called from Server Component where cookies cannot be directly set.
          // In Route Handlers, cookieStore.set works properly.
        }
      },
    },
  });
}
