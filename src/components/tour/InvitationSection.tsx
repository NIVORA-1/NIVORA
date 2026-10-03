'use client';

import React from 'react';
import Link from 'next/link';

interface InvitationSectionProps {
  onScrollToTop: () => void;
  onExploreArchitecture: () => void;
}

export default function InvitationSection({
  onScrollToTop,
  onExploreArchitecture,
}: InvitationSectionProps) {
  return (
    <div data-invite-section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-center relative overflow-clip">
      {/* Background subtle glow */}
      <div data-invite-glow className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] bg-coral/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Tag */}
      <div data-invite-heading>
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
      <div data-invite-cta className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/signup"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white hover:bg-coral transition-colors font-sans font-bold text-xs tracking-wider uppercase shadow-xl flex items-center justify-center gap-2"
        >
          <span>Get Started</span>
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </Link>

        <button
          onClick={onExploreArchitecture}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-surface-container border border-border text-on-surface hover:bg-surface-container-high transition-colors font-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>EXPLORE THE ARCHITECTURE</span>
        </button>
      </div>

      {/* Bullet Attributes */}
      <div data-invite-badges className="mt-8 flex items-center justify-center flex-wrap gap-2 text-xs font-sans text-on-surface-variant uppercase tracking-wider font-semibold">
        <span>Personalized to your stream.</span>
        <span>•</span>
        <span>Adaptive to your year.</span>
        <span>•</span>
        <span className="text-primary font-bold">Zero noise.</span>
      </div>

      {/* Founding Principle Blockquote */}
      <div data-invite-quote className="mt-16 pt-10 max-w-2xl mx-auto">
        <p className="font-display italic text-lg sm:text-2xl text-on-surface/90 font-normal">
          &ldquo;When deep focus meets deep context, your entire trajectory changes for good.&rdquo;
        </p>
        <span className="block mt-2 font-sans text-[10px] tracking-[0.16em] text-on-surface-variant uppercase font-semibold">
          FOUNDING PRINCIPLE, NIVORA LABS
        </span>
      </div>
    </div>
  );
}
