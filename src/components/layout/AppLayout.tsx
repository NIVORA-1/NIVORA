'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MusicProvider } from '@/context/MusicContext';
import Sidebar from '@/components/shell/Sidebar';
import TopNavbar from '@/components/shell/TopNavbar';
import AudioPlayerBar from '@/components/shell/AudioPlayerBar';
import CommandPaletteModal from '@/components/shell/CommandPaletteModal';
import QuickAddModal from '@/components/shell/QuickAddModal';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMusicPage = pathname?.startsWith('/music');
  const { user, isLoadingUser } = useApp();

  // Enforce client-side route protection
  useEffect(() => {
    if (!isLoadingUser) {
      if (!user) {
        router.replace('/login');
      } else if (user.profile && user.profile.onboardingCompleted === false) {
        router.replace('/onboarding');
      }
    }
  }, [isLoadingUser, user, router]);

  // Loading state while verifying server session
  if (isLoadingUser) {
    return (
      <div className="min-h-screen w-full bg-[#0F171B] flex flex-col items-center justify-center text-[#F1F0E8] selection:bg-[#8FC5A7] selection:text-[#0F171B]">
        <div className="flex flex-col items-center gap-5 animate-in fade-in duration-300">
          <NivoraLogo size="large" priority />
          <div className="flex items-center gap-2 text-xs font-mono text-[#8FC5A7]">
            <svg className="animate-spin h-3.5 w-3.5 text-[#8FC5A7]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="tracking-wider uppercase">Authenticating session...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated or onboarding incomplete, hold render until redirect triggers
  if (!user || (user.profile && user.profile.onboardingCompleted === false)) {
    return (
      <div className="min-h-screen w-full bg-[#0F171B]" />
    );
  }

  return (
    <MusicProvider>
      <div className="min-h-screen bg-surface text-on-surface flex flex-col antialiased">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Main content container shifted by sidebar width on desktop */}
        <div className="lg:pl-[260px] min-h-screen flex flex-col flex-1">
          <TopNavbar />

          <main className={`w-full pt-16 flex-1 bg-surface px-4 sm:px-space-xl py-space-lg ${isMusicPage ? 'pb-24' : 'pb-8 sm:pb-12'}`}>
            {children}
          </main>
        </div>

        {/* Omnipresent audio dock & modals */}
        <AudioPlayerBar />
        <CommandPaletteModal />
        <QuickAddModal />
      </div>
    </MusicProvider>
  );
}
