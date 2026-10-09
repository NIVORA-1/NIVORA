'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/layout/PublicHeader';
import HeroSection from '@/components/tour/HeroSection';
import FragmentationSection from '@/components/tour/FragmentationSection';
import SingleInterfaceSection from '@/components/tour/SingleInterfaceSection';
import AdaptationSection from '@/components/tour/AdaptationSection';
import PhilosophySection from '@/components/tour/PhilosophySection';
import MinimalistSection from '@/components/tour/MinimalistSection';
import ModulesSection from '@/components/tour/ModulesSection';
import InvitationSection from '@/components/tour/InvitationSection';
import TourFooter from '@/components/tour/TourFooter';
import NivoraLogo from '@/components/ui/NivoraLogo';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LandingPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      return (
        search.includes('code=') ||
        search.includes('error=') ||
        hash.includes('access_token=')
      );
    }
    return false;
  });

  // Check authenticated session on initial mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuthentication() {
      // 1. If URL has OAuth callback params (?code=... or ?error=...), forward to /auth/callback immediately
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('code') || searchParams.has('error')) {
          window.location.replace(`/auth/callback${window.location.search}`);
          return;
        }

        // If explicitly logging out via query parameter, stay on landing page
        if (searchParams.get('logout') === 'true') {
          if (isMounted) setIsCheckingSession(false);
          return;
        }
      }

      // 2. Check Supabase session via getSession and onAuthStateChange
      try {
        if (isSupabaseConfigured()) {
          const supabase = createSupabaseBrowserClient();
          const hasAuthHash = typeof window !== 'undefined' && window.location.hash.includes('access_token');

          // Check if existing session is already in memory or cookies
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            try {
              await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: session.access_token }),
              });
            } catch {}
            router.replace('/home');
            return;
          }

          // If returning with hash fragment (#access_token=...), wait for Supabase client to parse
          if (hasAuthHash) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, authSession: any) => {
              if (authSession?.user && isMounted) {
                try {
                  await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: authSession.access_token }),
                  });
                } catch {}
                router.replace('/home');
              }
            });

            // Set safety timeout for hash fragment resolution
            setTimeout(async () => {
              subscription.unsubscribe();
              if (isMounted) {
                const { data: { session: retrySession } } = await supabase.auth.getSession();
                if (retrySession?.user) {
                  router.replace('/home');
                } else {
                  setIsCheckingSession(false);
                }
              }
            }, 2500);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase session detection error:', err);
      }

      // 3. Check Nivora server session via /api/auth/me
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data?.user) {
            if (data.user.profile && data.user.profile.onboardingCompleted === false) {
              router.replace('/onboarding');
            } else {
              router.replace('/home');
            }
            return;
          }
        }
      } catch (err) {
        // Network or unauthenticated
      }

      // 4. No session found -> user is unauthenticated -> reveal landing page
      if (isMounted) {
        setIsCheckingSession(false);
      }
    }

    checkAuthentication();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Smooth scroll handler targeting section IDs
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scrollspy active section tracking for navbar navigation indicators
  useEffect(() => {
    if (isCheckingSession) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const philEl = document.getElementById('philosophy');
      const modulesEl = document.getElementById('modules');
      const connectEl = document.getElementById('connect');

      if (connectEl && scrollY >= connectEl.offsetTop - 300) {
        setActiveSection('connect');
      } else if (modulesEl && scrollY >= modulesEl.offsetTop - 300) {
        setActiveSection('curriculum');
      } else if (philEl && scrollY >= philEl.offsetTop - 300) {
        setActiveSection('features');
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCheckingSession]);

  // Initial loading state while verifying authentication session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center text-on-surface selection:bg-coral selection:text-white">
        <div className="flex flex-col items-center gap-5 animate-in fade-in duration-300">
          <NivoraLogo size="large" priority />
          <div className="flex items-center gap-2 text-xs font-mono text-primary">
            <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="tracking-wider uppercase">Loading Nivora...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-on-surface selection:bg-coral selection:text-white transition-colors duration-250 overflow-x-clip">
      {/* Public Floating Header */}
      <PublicHeader activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content: Completely Static, Natural Document Flow */}
      <main className="w-full">
        {/* FRAME 01 — HERO */}
        <section id="hero" className="w-full">
          <HeroSection
            onExplore={() => handleNavigate('fragmentation')}
            onReadArchitecture={() => handleNavigate('architecture')}
          />
        </section>

        {/* FRAME 02 — "College life is fragmented." */}
        <section id="fragmentation" className="w-full py-12 sm:py-20">
          <FragmentationSection />
        </section>

        {/* FRAME 03 — "Bring it together." */}
        <section id="architecture" className="w-full py-12 sm:py-20">
          <SingleInterfaceSection />
        </section>

        {/* FRAME 04 — STREAM ADAPTATION */}
        <section id="adaptation" className="w-full py-12 sm:py-20">
          <AdaptationSection />
        </section>

        {/* FRAME 05 — "More than a planner." */}
        <section id="philosophy" className="w-full py-12 sm:py-20">
          <PhilosophySection />
        </section>

        {/* FRAME 06 — "Only what matters. When it matters." */}
        <section id="minimalist" className="w-full py-12 sm:py-20">
          <MinimalistSection />
        </section>

        {/* FRAME 07 — "Learn. Plan. Focus. Grow. Connect." */}
        <section id="modules" className="w-full py-12 sm:py-20">
          <ModulesSection />
        </section>

        {/* FRAME 08 — FINAL INVITATION */}
        <section id="connect" className="w-full py-12 sm:py-20">
          <InvitationSection
            onScrollToTop={() => handleNavigate('hero')}
            onExploreArchitecture={() => handleNavigate('architecture')}
          />
        </section>
      </main>

      {/* Public Footer */}
      <TourFooter />
    </div>
  );
}
