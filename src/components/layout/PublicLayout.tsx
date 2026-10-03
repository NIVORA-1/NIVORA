'use client';

import React, { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-on-surface antialiased selection:bg-coral selection:text-white transition-colors duration-250">
      {children}
    </div>
  );
}
