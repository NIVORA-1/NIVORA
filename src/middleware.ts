import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'nivora_session_token';

/**
 * Public routes that unauthenticated users can freely access.
 */
const PUBLIC_PATHS = [
  '/',
  '/tour',
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-code',
  '/reset-password',
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

  // 1. Bypass Next.js internals, static files, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/music') ||
    pathname.startsWith('/audio') ||
    pathname.includes('.') || // static assets e.g. favicon.ico, images, fonts, mp3
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  const secret = process.env.JWT_SECRET || 'nivora-student-os-super-secret-key-2026';
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const validSession = token ? await verifyJwtInEdge(token, secret) : null;

  const isPublicPath = PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );

  // 2. Public routes are always accessible and never auto-redirected
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 4. Any other route is a protected application route
  // If not authenticated or session is invalid/expired -> redirect to /login
  if (!validSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    const response = NextResponse.redirect(url);
    // If a stale or invalid token cookie was present, clear it
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

  // 5. Valid session accessing protected route -> proceed
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
