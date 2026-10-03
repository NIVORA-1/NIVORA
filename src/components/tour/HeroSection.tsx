'use client';

import React from 'react';
import Link from 'next/link';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface HeroSectionProps {
  onExplore: () => void;
  onReadArchitecture: () => void;
}

export default function HeroSection({ onExplore, onReadArchitecture }: HeroSectionProps) {
  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-clip">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center text-center">
        {/* Background ambient lighting */}
        <div data-hero-bg className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-coral/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Architecture Pill Tag */}
      <div data-hero-tag className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-border mb-8 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#E85A4F]" />
        <span className="font-sans text-[11px] tracking-[0.16em] text-primary uppercase font-bold">
          ONE LOGICAL ARCHITECTURE
        </span>
      </div>

      {/* Main Headline */}
      <h1 data-hero-title className="text-4xl sm:text-6xl lg:text-[80px] font-display font-normal tracking-tight text-on-surface max-w-4xl leading-[1.0] sm:leading-[0.98] lg:leading-[0.95]">
        Your entire student journey,{' '}
        <span data-hero-connected className="relative inline-block italic text-primary">
          connected.
          {/* Subtle curved underline flourish */}
          <svg
            data-hero-flourish
            className="absolute -bottom-2 left-0 w-full h-3 text-coral/80"
            viewBox="0 0 200 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8.5C45 2.5 120 1 197 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>

      {/* Subtitle */}
      <p data-hero-subtitle className="mt-8 font-sans text-xs sm:text-sm tracking-wider leading-relaxed text-on-surface-variant max-w-2xl mx-auto uppercase font-medium">
        ONE LOGICAL ARCHITECTURE. EVERYTHING STUDENTS NEED ACROSS ACADEMICS, PROJECTS, CAREER, AND SELF-DISCOVERY. DESIGNED FOR THE HIGH-PERFORMANCE STUDENT.
      </p>

      {/* Central Graphic Box */}
      <div data-hero-core className="relative cursor-pointer mt-14 mb-12" onClick={onExplore}>
        <div className="relative w-64 sm:w-72 h-44 sm:h-48 rounded-2xl bg-surface-container border border-border p-6 shadow-2xl flex flex-col items-center justify-center">
          {/* Subtle corner crosshairs */}
          <span className="absolute top-2.5 left-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>
          <span className="absolute bottom-2.5 left-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>
          <span className="absolute bottom-2.5 right-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>

          {/* Central Official Nivora Logo Core */}
          <div className="mb-2">
            <NivoraLogo size="medium" priority />
          </div>
          <div className="font-sans text-[10px] tracking-widest text-primary mt-1 flex items-center gap-1 font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            <span>CORE NODE ACTIVE</span>
          </div>

          {/* Dimension coordinates */}
          <div data-hero-coords className="absolute bottom-2.5 inset-x-4 flex justify-between font-sans text-[9px] text-on-surface-variant/70 tracking-wider uppercase font-semibold">
            <span>SYS: 4.0.1</span>
            <span>NODES: 6</span>
            <span>LATENCY: 0ms</span>
          </div>
        </div>
      </div>

      {/* Primary and Secondary CTA Buttons */}
      <div data-hero-cta className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onExplore}
          className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary text-white hover:bg-coral transition-colors font-sans font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>EXPLORE THE SYSTEM</span>
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </button>

        <button
          onClick={onReadArchitecture}
          className="w-full sm:w-auto px-7 py-3 rounded-full bg-surface-container border border-border text-on-surface hover:bg-surface-container-high transition-colors font-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>READ THE ARCHITECTURE</span>
        </button>
      </div>

      {/* Static Downward Scroll Indicator */}
      <button
        data-hero-scroll
        onClick={onExplore}
        className="mt-14 text-on-surface-variant hover:text-primary transition-colors flex flex-col items-center gap-1 cursor-pointer"
        aria-label="Scroll down"
      >
        <span className="material-symbols-outlined text-[22px]">
          keyboard_arrow_down
        </span>
      </button>
      </div>
    </div>
  );
}
