'use client';

import React from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/tour/useScrollReveal';

interface InvitationSectionProps {
  onScrollToTop: () => void;
  onExploreArchitecture: () => void;
}

export default function InvitationSection({
  onScrollToTop,
  onExploreArchitecture,
}: InvitationSectionProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.15);

  return (
    <div
      ref={ref}
      data-invite-section
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center relative overflow-hidden"
    >
      {/* Background subtle cinematic glow */}
      <div
        data-invite-glow
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[380px] bg-coral/15 blur-[120px] rounded-full pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Header Tag & Headline */}
      <div
        data-invite-heading
        className={`relative z-10 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold mb-4">
          THE INVITATION
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-normal tracking-tight text-on-surface leading-[1.08] max-w-3xl mx-auto">
          Your student life.{' '}
          <span className="italic text-primary block sm:inline">
            One connected ecosystem.
          </span>
        </h2>

        {/* Subtext */}
        <p className="mt-6 font-sans text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed font-normal">
          Step into the platform that treats your education as an integrated journey — deliberately crafted for who you are.
        </p>
      </div>

      {/* Action Buttons */}
      <div
        data-invite-cta
        className={`relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <Link
          href="/signup"
          className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-primary text-white hover:bg-coral active:scale-95 transition-all font-sans font-bold text-xs tracking-wider uppercase shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Get Started</span>
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </Link>

        <button
          onClick={onExploreArchitecture}
          className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-surface-container/90 backdrop-blur-md border border-border text-on-surface hover:bg-surface-container-high active:scale-95 transition-all font-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span>EXPLORE THE ARCHITECTURE</span>
        </button>
      </div>

      {/* Bullet Attributes */}
      <div
        data-invite-badges
        className="relative z-10 mt-8 flex items-center justify-center flex-wrap gap-2 text-xs font-sans text-on-surface-variant uppercase tracking-wider font-semibold"
      >
        <span>Personalized to your stream.</span>
        <span>•</span>
        <span>Adaptive to your year.</span>
        <span>•</span>
        <span className="text-primary font-bold">Zero noise.</span>
      </div>

      {/* Founding Principle Blockquote */}
      <div
        data-invite-quote
        className="relative z-10 mt-16 pt-10 border-t border-border/50 max-w-2xl mx-auto"
      >
        <p className="font-display italic text-lg sm:text-2xl text-on-surface/90 font-normal leading-relaxed">
          &ldquo;When deep focus meets deep context, your entire trajectory changes for good.&rdquo;
        </p>
        <span className="block mt-2.5 font-sans text-[10px] tracking-[0.16em] text-on-surface-variant uppercase font-semibold">
          FOUNDING PRINCIPLE, NIVORA LABS
        </span>
      </div>
    </div>
  );
}
