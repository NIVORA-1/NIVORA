import { createBrowserClient } from '@supabase/ssr';

/**
 * Resolves the Supabase project URL from environment variables.
 * Do NOT hardcode the Supabase URL in source code.
 */
export function getSupabaseUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (supabaseUrl || '').trim();
}

/**
 * Resolves the Supabase anonymous key from environment variables.
 * Variable name MUST be EXACTLY: NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function getSupabaseAnonKey(): string {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (supabaseAnonKey || '').trim();
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  missingVariables: string[];
  errorMessage: string | null;
}

/**
 * Validates Supabase configuration status safely without throwing or exposing secrets.
 */
export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const missing: string[] = [];

  if (!supabaseUrl) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('your-supabase-anon-key')) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    return {
      isConfigured: false,
      missingVariables: missing,
      errorMessage: `Supabase authentication is pending configuration: ${missing.join(' and ')} ${missing.length === 1 ? 'is' : 'are'} required in your .env file.`,
    };
  }

  return {
    isConfigured: true,
    missingVariables: [],
    errorMessage: null,
  };
}

/**
 * Checks whether Supabase is configured with valid environment variables.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigStatus().isConfigured;
}

// Client-side singleton cache to prevent duplicate client initialization in browser
let cachedBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Creates or retrieves a client-side Supabase browser instance using @supabase/ssr.
 * Reads environment variables strictly from process.env without hardcoding.
 * Cookies are stored in document.cookie so that Next.js Server Components and route
 * handlers can seamlessly access authentication sessions.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    const status = getSupabaseConfigStatus();
    throw new Error(status.errorMessage || 'Supabase authentication is not configured.');
  }

  // In browser runtime, maintain a single client instance
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (!cachedBrowserClient) {
      cachedBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return cachedBrowserClient;
  }

  // In non-browser / SSR pre-rendering context, provide safe in-memory cookie handlers
  const memoryCookies = new Map<string, string>();
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return Array.from(memoryCookies.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          memoryCookies.set(name, value);
        });
      },
    },
  });
}
