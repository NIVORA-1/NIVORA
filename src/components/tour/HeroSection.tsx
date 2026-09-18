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
    <section id="hero" className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center text-center">
      {/* Background ambient lighting */}
      <div data-hero-bg className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#8FC5A7]/5 blur-[120px] rounded-full pointer-events-none transition-transform will-change-transform" />

      {/* Top Architecture Pill Tag */}
      <div data-hero-tag className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172329] border border-[#29383D] mb-8 will-change-transform">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8FC5A7] shadow-[0_0_8px_#8FC5A7]" />
        <span className="font-mono text-[11px] tracking-[0.2em] text-[#8FC5A7] uppercase font-semibold">
          ONE LOGICAL ARCHITECTURE
        </span>
      </div>

      {/* Main Headline */}
      <h1 data-hero-title className="text-4xl sm:text-6xl lg:text-[76px] font-display font-extrabold tracking-[-0.035em] sm:tracking-[-0.045em] text-[#F1F0E8] max-w-4xl leading-[1.04] sm:leading-[1.0] lg:leading-[0.98] will-change-transform">
        Your entire student journey,{' '}
        <span data-hero-connected className="relative inline-block font-serif italic text-[#8FC5A7] font-normal will-change-transform">
          connected.
          {/* Subtle curved underline flourish matching Stitch design */}
          <svg
            data-hero-flourish
            className="absolute -bottom-2 left-0 w-full h-3 text-[#8FC5A7]/70 will-change-transform"
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

      {/* Mono Subtitle */}
      <p data-hero-subtitle className="mt-8 font-mono text-[11px] sm:text-xs tracking-[0.16em] leading-relaxed text-[#747F7B] max-w-2xl mx-auto uppercase font-normal will-change-transform">
        ONE LOGICAL ARCHITECTURE. EVERYTHING STUDENTS NEED ACROSS ACADEMICS, PROJECTS, CAREER, AND SELF-DISCOVERY. DESIGNED FOR THE HIGH-PERFORMANCE STUDENT.
      </p>

      {/* Central 3D Perspective Graphic Box */}
      <div data-hero-core className="relative cursor-pointer will-change-transform mt-14 mb-12" onClick={onExplore}>
        <div className="relative w-64 sm:w-72 h-44 sm:h-48 rounded-2xl bg-gradient-to-b from-[#1C2A30] to-[#172329] border border-[#29383D] p-6 shadow-2xl flex flex-col items-center justify-center">
          {/* Subtle corner crosshairs */}
          <span className="absolute top-2.5 left-2.5 font-mono text-[9px] text-[#747F7B]/50">+</span>
          <span className="absolute top-2.5 right-2.5 font-mono text-[9px] text-[#747F7B]/50">+</span>
          <span className="absolute bottom-2.5 left-2.5 font-mono text-[9px] text-[#747F7B]/50">+</span>
          <span className="absolute bottom-2.5 right-2.5 font-mono text-[9px] text-[#747F7B]/50">+</span>

          {/* Central Official Nivora Logo Core */}
          <div className="mb-2">
            <NivoraLogo size="medium" priority />
          </div>
          <div className="font-mono text-[9px] tracking-widest text-[#8FC5A7] mt-1 flex items-center gap-1 font-semibold">
            <span className="w-1 h-1 rounded-full bg-[#8FC5A7] animate-ping" />
            <span>CORE NODE ACTIVE</span>
          </div>

          {/* Dimension coordinates */}
          <div data-hero-coords className="absolute bottom-2 inset-x-4 flex justify-between font-mono text-[8px] text-[#747F7B]/60 tracking-wider">
            <span>SYS: 4.0.1</span>
            <span>NODES: 6</span>
            <span>LATENCY: 0ms</span>
          </div>
        </div>
      </div>

      {/* Primary and Secondary CTA Buttons */}
      <div data-hero-cta className="flex flex-col sm:flex-row items-center gap-4 will-change-transform">
        <button
          onClick={onExplore}
          className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#8FC5A7] text-[#0F171B] font-sans font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>EXPLORE THE SYSTEM</span>
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </button>

        <button
          onClick={onReadArchitecture}
          className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#172329] border border-[#29383D] text-[#F1F0E8] font-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>READ THE ARCHITECTURE</span>
        </button>
      </div>

      {/* Downward Bobbing Scroll Indicator */}
      <button
        data-hero-scroll
        onClick={onExplore}
        className="mt-14 text-[#747F7B] flex flex-col items-center gap-1 cursor-pointer"
        aria-label="Scroll down"
      >
        <span className="material-symbols-outlined text-[22px] animate-bounce">
          keyboard_arrow_down
        </span>
      </button>
    </section>
  );
}
