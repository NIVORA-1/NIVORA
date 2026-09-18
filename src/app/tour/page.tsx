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
    <div className="min-h-screen w-full bg-[#0F171B] text-[#F1F0E8]">
      {/* Public Navigation Bar */}
      <PublicHeader activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="relative w-full overflow-hidden">
        {/* Frame 01: Hero Section */}
        <HeroSection
          onExplore={() => handleNavigate('fragmentation')}
          onReadArchitecture={() => handleNavigate('architecture')}
        />

        {/* Frame 02: Fragmentation */}
        <FragmentationSection />

        {/* Frame 03: The Single Interface */}
        <SingleInterfaceSection />

        {/* Frame 04: One Interface. Your Context */}
        <AdaptationSection />

        {/* Frame 05: Design Philosophy */}
        <PhilosophySection />

        {/* Frame 06: Minimalist by Design */}
        <MinimalistSection />

        {/* Frame 07: Foundational Curriculum */}
        <ModulesSection />

        {/* Frame 08: The Invitation */}
        <InvitationSection
          onScrollToTop={() => handleNavigate('hero')}
          onExploreArchitecture={() => handleNavigate('architecture')}
        />
      </main>

      {/* Tour Footer */}
      <TourFooter />
    </div>
  );
}
