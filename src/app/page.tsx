'use client';

import React, { useState, useEffect } from 'react';
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

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState<string>('');

  // Smooth scroll handler targeting section IDs
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scrollspy active section tracking for navbar navigation indicators
  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-on-surface selection:bg-coral selection:text-white transition-colors duration-250">
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
