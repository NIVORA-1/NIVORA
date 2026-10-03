'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import AppLayout from '@/components/layout/AppLayout';

/**
 * Determines whether the given pathname represents a public unauthenticated route.
 * Public routes do NOT render the application sidebar, top navbar, or shell controls.
 */
export function isPublicRoute(pathname: string): boolean {
  if (!pathname || pathname === '/' || pathname === '/tour') return true;
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/verify-code') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/onboarding')
  ) {
    return true;
  }
  return false;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = isPublicRoute(pathname);

  if (isPublic) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  return <AppLayout>{children}</AppLayout>;
}
