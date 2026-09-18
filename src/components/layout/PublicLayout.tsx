'use client';

import React, { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#0F171B] text-[#F1F0E8] antialiased selection:bg-[#8FC5A7] selection:text-[#0F171B]">
      {children}
    </div>
  );
}
