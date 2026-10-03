'use client';

import React, { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MusicProvider } from '@/context/MusicContext';
import Sidebar from '@/components/shell/Sidebar';
import TopNavbar from '@/components/shell/TopNavbar';
import AudioPlayerBar from '@/components/shell/AudioPlayerBar';
import CommandPaletteModal from '@/components/shell/CommandPaletteModal';
import QuickAddModal from '@/components/shell/QuickAddModal';
import AiAssistModal from '@/components/shell/AiAssistModal';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMusicPage = pathname?.startsWith('/music');
  const { user, isLoadingUser, setIsSidebarOpen } = useApp();

  const isPublicDiscoveryRoute =
    pathname?.startsWith('/community') ||
    pathname?.startsWith('/clubs-and-events') ||
    pathname?.startsWith('/music');

  // Enforce client-side route protection
  useEffect(() => {
    if (!isLoadingUser) {
      if (!user && !isPublicDiscoveryRoute) {
        router.replace('/login');
      } else if (user && user.profile && user.profile.onboardingCompleted === false) {
        router.replace('/onboarding');
      }
    }
  }, [isLoadingUser, user, router, isPublicDiscoveryRoute]);

  // Loading state while verifying server session (except for public discovery routes)
  if (isLoadingUser && !isPublicDiscoveryRoute) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center text-on-surface selection:bg-coral selection:text-white">
        <div className="flex flex-col items-center gap-5 animate-in fade-in duration-300">
          <NivoraLogo size="large" priority />
          <div className="flex items-center gap-2 text-xs font-mono text-primary">
            <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="tracking-wider uppercase">Authenticating session...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated or onboarding incomplete (and not a public discovery route), hold render until redirect triggers
  if ((!user && !isPublicDiscoveryRoute) || (user && user.profile && user.profile.onboardingCompleted === false)) {
    return (
      <div className="min-h-screen w-full bg-background" />
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

          <main className={`w-full pt-16 flex-1 bg-surface px-4 sm:px-space-xl py-space-lg ${isMusicPage ? 'pb-24' : 'pb-24 lg:pb-8 sm:pb-12'}`}>
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation bar */}
        {!isMusicPage && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-container-low/95 backdrop-blur-xl border-t border-outline-variant/30 flex items-center justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] px-2 shadow-xl">
            <Link
              href="/home"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === '/home' || pathname === '/dashboard'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${pathname === '/home' || pathname === '/dashboard' ? 'filled text-primary' : ''}`}>dashboard</span>
              <span>Home</span>
            </Link>
            <Link
              href="/learning"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname.startsWith('/learning')
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${pathname.startsWith('/learning') ? 'filled text-primary' : ''}`}>local_library</span>
              <span>Learning</span>
            </Link>
            <Link
              href="/health"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname.startsWith('/health')
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${pathname.startsWith('/health') ? 'filled text-primary' : ''}`}>favorite</span>
              <span>Health</span>
            </Link>
            <Link
              href="/music"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname.startsWith('/music')
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${pathname.startsWith('/music') ? 'filled text-primary' : ''}`}>headphones</span>
              <span>Music</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
              <span>More</span>
            </button>
          </nav>
        )}

        {/* Omnipresent audio dock & modals */}
        <AudioPlayerBar />
        <CommandPaletteModal />
        <QuickAddModal />
        <AiAssistModal />
      </div>
    </MusicProvider>
  );
}
