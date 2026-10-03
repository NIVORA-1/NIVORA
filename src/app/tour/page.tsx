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

export default function TourPage() {
  const [activeSection, setActiveSection] = useState<string>('');

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const philEl = document.getElementById('philosophy');
      const modulesEl = document.getElementById('modules');
      const connectEl = document.getElementById('connect');

      if (connectEl && scrollY >= connectEl.offsetTop - 250) {
        setActiveSection('connect');
      } else if (modulesEl && scrollY >= modulesEl.offsetTop - 250) {
        setActiveSection('curriculum');
      } else if (philEl && scrollY >= philEl.offsetTop - 250) {
        setActiveSection('features');
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-on-surface transition-colors duration-250">
      {/* Public Navigation Bar */}
      <PublicHeader activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="w-full">
        {/* Frame 01: Hero Section */}
        <section id="hero" className="w-full">
          <HeroSection
            onExplore={() => handleNavigate('fragmentation')}
            onReadArchitecture={() => handleNavigate('architecture')}
          />
        </section>

        {/* Frame 02: Fragmentation */}
        <section id="fragmentation" className="w-full py-12 sm:py-20">
          <FragmentationSection />
        </section>

        {/* Frame 03: The Single Interface */}
        <section id="architecture" className="w-full py-12 sm:py-20">
          <SingleInterfaceSection />
        </section>

        {/* Frame 04: One Interface. Your Context */}
        <section id="adaptation" className="w-full py-12 sm:py-20">
          <AdaptationSection />
        </section>

        {/* Frame 05: Design Philosophy */}
        <section id="philosophy" className="w-full py-12 sm:py-20">
          <PhilosophySection />
        </section>

        {/* Frame 06: Minimalist by Design */}
        <section id="minimalist" className="w-full py-12 sm:py-20">
          <MinimalistSection />
        </section>

        {/* Frame 07: Foundational Curriculum */}
        <section id="modules" className="w-full py-12 sm:py-20">
          <ModulesSection />
        </section>

        {/* Frame 08: The Invitation */}
        <section id="connect" className="w-full py-12 sm:py-20">
          <InvitationSection
            onScrollToTop={() => handleNavigate('hero')}
            onExploreArchitecture={() => handleNavigate('architecture')}
          />
        </section>
      </main>

      {/* Tour Footer */}
      <TourFooter />
    </div>
  );
}
