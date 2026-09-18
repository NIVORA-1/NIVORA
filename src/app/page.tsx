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
import CinematicScrollExperience from '@/components/tour/CinematicScrollExperience';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState<string>('');

  // Smooth scroll handler targeting scene containers or inner IDs
  const handleNavigate = (sectionId: string) => {
    const el =
      document.getElementById(`scene-${sectionId}`) ||
      document.getElementById(sectionId) ||
      document.getElementById(`frame-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scrollspy active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const philEl = document.getElementById('scene-philosophy');
      const modulesEl = document.getElementById('scene-modules');
      const connectEl = document.getElementById('scene-connect');

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
    <div className="min-h-screen w-full bg-[#0F171B] text-[#F1F0E8] selection:bg-[#8FC5A7] selection:text-[#0F171B]">
      {/* Public Floating Header */}
      <PublicHeader activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="relative w-full">
        <CinematicScrollExperience>
          {/* FRAME 01 — HERO (scroll space: 200vh) */}
          <section id="scene-hero" className="cinematic-scene relative w-full h-[200vh]">
            <div
              id="frame-hero"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <HeroSection
                onExplore={() => handleNavigate('fragmentation')}
                onReadArchitecture={() => handleNavigate('architecture')}
              />
            </div>
          </section>

          {/* FRAME 02 — "College life is fragmented." (scroll space: 180vh) */}
          <section id="scene-fragmentation" className="cinematic-scene relative w-full h-[180vh]">
            <div
              id="frame-fragmentation"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <FragmentationSection />
            </div>
          </section>

          {/* FRAME 03 — "Bring it together." (scroll space: 220vh) */}
          <section id="scene-architecture" className="cinematic-scene relative w-full h-[220vh]">
            <div
              id="frame-architecture"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <SingleInterfaceSection />
            </div>
          </section>

          {/* FRAME 04 — STREAM ADAPTATION (scroll space: 180vh) */}
          <section id="scene-adaptation" className="cinematic-scene relative w-full h-[180vh]">
            <div
              id="frame-adaptation"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <AdaptationSection />
            </div>
          </section>

          {/* FRAME 05 — "More than a planner." (scroll space: 180vh) */}
          <section id="scene-philosophy" className="cinematic-scene relative w-full h-[180vh]">
            <div
              id="frame-philosophy"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <PhilosophySection />
            </div>
          </section>

          {/* FRAME 06 — "Only what matters. When it matters." (scroll space: 160vh) */}
          <section id="scene-minimalist" className="cinematic-scene relative w-full h-[160vh]">
            <div
              id="frame-minimalist"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <MinimalistSection />
            </div>
          </section>

          {/* FRAME 07 — "Learn. Plan. Focus. Grow. Connect." (scroll space: 160vh) */}
          <section id="scene-modules" className="cinematic-scene relative w-full h-[160vh]">
            <div
              id="frame-modules"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <ModulesSection />
            </div>
          </section>

          {/* FRAME 08 — FINAL INVITATION (scroll space: 140vh) */}
          <section id="scene-connect" className="cinematic-scene relative w-full h-[140vh]">
            <div
              id="frame-connect"
              className="sticky top-0 min-h-screen w-full flex flex-col justify-center items-center pt-14 pb-8"
            >
              <InvitationSection
                onScrollToTop={() => handleNavigate('hero')}
                onExploreArchitecture={() => handleNavigate('architecture')}
              />
            </div>
          </section>
        </CinematicScrollExperience>
      </main>

      {/* Public Footer */}
      <TourFooter />
    </div>
  );
}
