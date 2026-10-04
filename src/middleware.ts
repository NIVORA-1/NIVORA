import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const AUTH_COOKIE = 'nivora_session_token';

/**
 * Public routes that unauthenticated users can freely access.
 */
const PUBLIC_PATHS = [
  '/',
  '/tour',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/verify-code',
  '/reset-password',
  '/auth/callback',
  '/community',
  '/clubs-and-events',
  '/music',
];

/**
 * Safely decodes a Base64URL string into a Uint8Array in standard Edge runtime.
 */
function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Edge-compatible JWT verification using Web Crypto (SubtleCrypto HMAC SHA-256).
 * Validates token structure, cryptographic signature, expiration, and payload integrity.
 */
async function verifyJwtInEdge(
  token: string,
  secret: string
): Promise<{ userId: string; email?: string; name?: string; exp?: number } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature.buffer as ArrayBuffer,
      data.buffer as ArrayBuffer
    );
    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(payloadBytes));

    // Expiration check (exp is in seconds)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    if (!payload.userId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass Next.js internals, static files, auth endpoints, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/ai') ||
    pathname.startsWith('/api/music') ||
    pathname.startsWith('/api/curriculum') ||
    pathname.startsWith('/api/universities') ||
    pathname.startsWith('/api/clubs') ||
    pathname.startsWith('/api/events') ||
    pathname.startsWith('/api/connect') ||
    pathname.startsWith('/api/community') ||
    pathname.startsWith('/api/learning') ||
    pathname.startsWith('/api/attendance') ||
    pathname.startsWith('/audio') ||
    pathname.includes('.') || // static assets e.g. favicon.ico, images, fonts, mp3
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // 2. If redirected to '/' with OAuth callback parameters (?code=... or ?error=...), forward to /auth/callback
  if (pathname === '/' && (request.nextUrl.searchParams.has('code') || request.nextUrl.searchParams.has('error'))) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = '/auth/callback';
    return NextResponse.redirect(callbackUrl);
  }

  const secret = process.env.JWT_SECRET || 'nivora-student-os-super-secret-key-2026';
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const validSession = token ? await verifyJwtInEdge(token, secret) : null;

  // Check Supabase session via @supabase/ssr
  let hasSupabaseSession = false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!validSession && supabaseUrl && supabaseAnonKey) {
    const hasSbCookie = request.cookies.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token') && c.value && c.value !== 'deleted'
    );

    if (hasSbCookie) {
      try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        });
        const {
          data: { user: sbUser },
        } = await supabase.auth.getUser();
        if (sbUser) {
          hasSupabaseSession = true;
        }
      } catch {
        hasSupabaseSession = false;
      }
    }
  }

  const isAuthenticated = Boolean(validSession || hasSupabaseSession);

  // If authenticated user visits /login or /signup, redirect to /home
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // If authenticated user visits root landing page '/' (without logout flag), redirect to /home
  if (isAuthenticated && pathname === '/' && !request.nextUrl.searchParams.has('logout')) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  const isPublicPath = PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );

  // Public routes are accessible for unauthenticated users
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protected route accessed without active session -> redirect to /login
  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = '/login';

    const response = NextResponse.redirect(url);
    if (token) {
      response.cookies.set(AUTH_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    }
    return response;
  }

  // Valid session accessing protected route -> proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
