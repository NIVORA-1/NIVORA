'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface HeroSectionProps {
  onExplore: () => void;
  onReadArchitecture: () => void;
}

// 11 Exact Milestones mapping scroll progress 0%–100% to 0.0s–8.0s continuously
const SCROLL_MILESTONES = [
  { p: 0.0, time: '0.0s', name: 'CORE NEXUS' },
  { p: 0.1, time: '0.8s', name: 'ORBITAL EXPANSION' },
  { p: 0.2, time: '1.6s', name: 'DEPTH LATTICE' },
  { p: 0.3, time: '2.4s', name: 'DATA CHANNELS' },
  { p: 0.4, time: '3.2s', name: 'FOCUS DYNAMICS' },
  { p: 0.5, time: '4.0s', name: 'CENTRAL HARMONY' },
  { p: 0.6, time: '4.8s', name: 'DOMAIN ALIGNMENT' },
  { p: 0.7, time: '5.6s', name: 'TELEMETRY STREAM' },
  { p: 0.8, time: '6.4s', name: 'ATMOSPHERIC FIELD' },
  { p: 0.9, time: '7.2s', name: 'SYNCHRONIZATION' },
  { p: 1.0, time: '8.0s', name: 'UNIFIED ECOSYSTEM' },
];

export default function HeroSection({ onExplore, onReadArchitecture }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // High performance DOM refs (prevents 60fps React state re-rendering)
  const progressBarRef = useRef<HTMLDivElement>(null);
  const timeHudRef = useRef<HTMLSpanElement>(null);
  const percentHudRef = useRef<HTMLSpanElement>(null);
  const milestoneNameRef = useRef<HTMLSpanElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const promptTextRef = useRef<HTMLSpanElement>(null);

  // Scroll physics & scrubbing state refs
  const isMountedRef = useRef<boolean>(true);
  const scrollProgressRef = useRef<number>(0);
  const targetTimeRef = useRef<number>(0);
  const currentLerpTimeRef = useRef<number>(0);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const videoLoadedRef = useRef<boolean>(false);
  const activeMilestoneIdxRef = useRef<number>(0);

  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState<number>(0);

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Native scroll progress calculation (no wheel hijacking, 100% native document scroll)
  const calculateScrollProgress = useCallback(() => {
    if (!isMountedRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalDistance = rect.height - window.innerHeight;
    if (totalDistance <= 0) return;

    // Progress from 0.0 at top of hero container to 1.0 when sticky pinned track completes
    const rawProgress = -rect.top / totalDistance;
    const clamped = Math.min(Math.max(rawProgress, 0), 1);
    scrollProgressRef.current = clamped;
    targetTimeRef.current = clamped * 8.0; // Exact 0.0s - 8.0s timeline
  }, []);

  // High-performance seek dispatcher
  const seekVideo = useCallback((time: number) => {
    if (!isMountedRef.current) return;
    const video = videoRef.current;
    if (!video || !videoLoadedRef.current) return;
    const clampedTime = Math.min(Math.max(time, 0), 8.0);

    if (!video.seeking) {
      if (Math.abs(video.currentTime - clampedTime) > 0.015) {
        try {
          if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
            (video as any).fastSeek(clampedTime);
          } else {
            video.currentTime = clampedTime;
          }
        } catch {
          video.currentTime = clampedTime;
        }
      }
    } else {
      pendingSeekTimeRef.current = clampedTime;
    }
  }, []);

  // Handle seeked event to drain queued seek target without skipping
  const handleSeeked = useCallback(() => {
    if (!isMountedRef.current) return;
    if (pendingSeekTimeRef.current !== null && videoRef.current && videoLoadedRef.current) {
      const nextTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
      if (Math.abs(videoRef.current.currentTime - nextTime) > 0.015) {
        try {
          videoRef.current.currentTime = nextTime;
        } catch {}
      }
    }
  }, []);

  // High-performance requestAnimationFrame scrubbing loop with continuous interpolation (lerp)
  useEffect(() => {
    isMountedRef.current = true;
    if (prefersReducedMotion) return;

    let animationFrameId: number;

    const tick = () => {
      if (!isMountedRef.current) return;

      const targetP = scrollProgressRef.current;
      const targetTime = targetTimeRef.current;
      const diff = targetTime - currentLerpTimeRef.current;

      // Silky responsive lerp factor (0.22 provides immediate tracking with zero jitter)
      if (Math.abs(diff) > 0.001) {
        currentLerpTimeRef.current += diff * 0.22;
      } else {
        currentLerpTimeRef.current = targetTime;
      }

      const lerpedTime = currentLerpTimeRef.current;
      const lerpedP = lerpedTime / 8.0;

      // Scrub the video
      if (videoLoadedRef.current) {
        seekVideo(lerpedTime);
      }

      // Direct DOM updates for 60/120fps HUD responsiveness
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.min(Math.max(lerpedP * 100, 0), 100)}%`;
      }
      if (timeHudRef.current) {
        timeHudRef.current.textContent = `${lerpedTime.toFixed(1)}s / 8.0s`;
      }
      if (percentHudRef.current) {
        percentHudRef.current.textContent = `(${Math.round(lerpedP * 100)}%)`;
      }

      // Calculate active milestone index
      const milestoneIdx = Math.min(Math.max(Math.floor(lerpedP * 10 + 0.5), 0), 10);
      if (milestoneNameRef.current && SCROLL_MILESTONES[milestoneIdx]) {
        milestoneNameRef.current.textContent = SCROLL_MILESTONES[milestoneIdx].name;
      }
      if (activeMilestoneIdxRef.current !== milestoneIdx) {
        activeMilestoneIdxRef.current = milestoneIdx;
        if (isMountedRef.current) {
          setActiveMilestoneIdx(milestoneIdx);
        }
      }

      // Hero foreground content subtle transform
      if (heroContentRef.current) {
        const ty = -lerpedP * 24;
        const sc = 1 - lerpedP * 0.025;
        const op = Math.max(1 - lerpedP * 0.35, 0.65);
        heroContentRef.current.style.transform = `translate3d(0, ${ty}px, 0) scale(${sc})`;
        heroContentRef.current.style.opacity = `${op}`;
      }

      // Ambient radial glow dynamic scaling
      if (ambientGlowRef.current) {
        const glowScale = 1 + lerpedP * 0.18;
        const glowOp = 0.82 - lerpedP * 0.22;
        ambientGlowRef.current.style.transform = `translate(-50%, -50%) scale(${glowScale})`;
        ambientGlowRef.current.style.opacity = `${glowOp}`;
      }

      // Bottom prompt label update
      if (promptTextRef.current) {
        promptTextRef.current.textContent =
          lerpedP >= 0.95 ? 'RELEASE TO FRAGMENTATION' : 'SCROLL TO SCRUB';
      }

      if (isMountedRef.current) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    window.addEventListener('scroll', calculateScrollProgress, { passive: true });
    window.addEventListener('resize', calculateScrollProgress, { passive: true });
    calculateScrollProgress();

    return () => {
      isMountedRef.current = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', calculateScrollProgress);
      window.removeEventListener('resize', calculateScrollProgress);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
      }
      videoLoadedRef.current = false;
    };
  }, [seekVideo, prefersReducedMotion, calculateScrollProgress]);

  // Video metadata loaded handler: ensure video strictly does NOT autoplay
  const handleVideoLoaded = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      videoLoadedRef.current = true;
      setVideoLoaded(true);
    }
  };

  const handleVideoError = () => {
    videoLoadedRef.current = false;
    setVideoError(true);
  };

  // Clickable milestone dot jumping: smoothly scrolls to milestone's exact timeline position
  const handleJumpToMilestone = (milestoneProgress: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const totalDistance = rect.height - window.innerHeight;
    const targetScrollY = containerTop + milestoneProgress * totalDistance;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${prefersReducedMotion ? 'min-h-screen' : 'h-[260vh]'} select-none`}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
    >
      {/* Sticky Viewport Container (pins for ~260vh, scrubs video, then naturally continues into Frame 02) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* =========================================================
            CINEMATIC BACKGROUND VISUAL LAYER
            1. Fallback Poster (WebP / JPG)
            2. Scroll-Controlled Frame Video (Scrub Only, No Autoplay)
            3. Multilayered Architectural Vignette & Contrast Mask
            ========================================================= */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#141312]">
          {/* Fallback Poster (Always visible until video loads; remains visible on error or reduced motion) */}
          <picture>
            <source srcSet="/assets/nivora-hero-poster.webp" type="image/webp" />
            <img
              src="/assets/nivora-hero-poster.jpg"
              alt="Nivora System Architecture"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                videoLoaded && !videoError && !prefersReducedMotion ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </picture>

          {/* Scroll-Controlled Scrubbing Video (No Autoplay, Muted, Frame-by-Frame Scrubbing) */}
          {!prefersReducedMotion && (
            <video
              ref={videoRef}
              playsInline
              muted
              preload="auto"
              tabIndex={-1}
              aria-hidden="true"
              onLoadedMetadata={handleVideoLoaded}
              onError={handleVideoError}
              onSeeked={handleSeeked}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src="/assets/nivora-hero-scrub.webm" type="video/webm" />
              <source src="/assets/nivora-hero-scrub.mp4" type="video/mp4" />
            </video>
          )}

          {/* Layered Architectural Vignette & Contrast Overlays */}
          {/* Top header protection fade */}
          <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-background/95 via-background/60 to-transparent pointer-events-none" />

          {/* Central radial contrast vignette ensuring hero typography has razor-sharp contrast */}
          <div className="absolute inset-0 bg-radial-gradient from-background/75 via-background/45 to-background/85 pointer-events-none" />

          {/* Subtle dark mode contrast floor */}
          <div className="absolute inset-0 bg-background/25 pointer-events-none" />

          {/* Bottom gradient fade transitioning seamlessly into Frame 02 (#fragmentation) */}
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

          {/* Ambient subtle glow pulse behind central core */}
          <div
            ref={ambientGlowRef}
            data-hero-bg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[420px] bg-coral/15 blur-[140px] rounded-full pointer-events-none transition-transform duration-300"
          />

          {/* Subtle architectural grid pattern */}
          <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055] pointer-events-none bg-[radial-gradient(#E85A4F_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        {/* =========================================================
            HERO FOREGROUND CONTENT LAYER
            Preserves 100% of existing content, headings, and CTAs
            Subtly transforms during scrubbing while maintaining readability
            ========================================================= */}
        <div
          ref={heroContentRef}
          className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-4 flex flex-col items-center text-center my-auto transition-transform duration-100 will-change-transform"
        >
          {/* Top Architecture Pill Tag */}
          <div
            data-hero-tag
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container/90 backdrop-blur-md border border-border/80 mb-6 sm:mb-8 shadow-sm transition-transform duration-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#E85A4F] animate-pulse" />
            <span className="font-sans text-[11px] tracking-[0.16em] text-primary uppercase font-bold">
              ONE LOGICAL ARCHITECTURE
            </span>
          </div>

          {/* Main Headline */}
          <h1
            data-hero-title
            className="text-4xl sm:text-6xl lg:text-[76px] font-display font-normal tracking-tight text-on-surface max-w-4xl leading-[1.0] sm:leading-[0.98] lg:leading-[0.95] drop-shadow-sm transition-transform duration-300"
          >
            Your entire student journey,{' '}
            <span data-hero-connected className="relative inline-block italic text-primary">
              connected.
              {/* Subtle curved underline flourish */}
              <svg
                data-hero-flourish
                className="absolute -bottom-2 left-0 w-full h-3 text-coral/80 pointer-events-none"
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
          <p
            data-hero-subtitle
            className="mt-6 sm:mt-8 font-sans text-xs sm:text-sm tracking-wider leading-relaxed text-on-surface-variant max-w-2xl mx-auto uppercase font-medium transition-transform duration-300"
          >
            ONE LOGICAL ARCHITECTURE. EVERYTHING STUDENTS NEED ACROSS ACADEMICS, PROJECTS, CAREER, AND SELF-DISCOVERY. DESIGNED FOR THE HIGH-PERFORMANCE STUDENT.
          </p>

          {/* Central Graphic Box */}
          <div
            data-hero-core
            className="relative cursor-pointer mt-8 sm:mt-12 mb-8 sm:mb-10 group"
            onClick={onExplore}
            title="Click to explore the Nivora Architecture"
          >
            <div className="relative w-64 sm:w-72 h-40 sm:h-44 rounded-2xl bg-surface-container/95 backdrop-blur-xl border border-border/90 p-5 shadow-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(232,90,79,0.2)]">
              {/* Subtle corner crosshairs */}
              <span className="absolute top-2.5 left-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>
              <span className="absolute top-2.5 right-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>
              <span className="absolute bottom-2.5 left-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>
              <span className="absolute bottom-2.5 right-2.5 font-sans text-[10px] text-on-surface-variant/50 font-bold">+</span>

              {/* Central Official Nivora Logo Core */}
              <div className="mb-2 transition-transform duration-300 group-hover:scale-105">
                <NivoraLogo size="medium" priority />
              </div>

              <div className="font-sans text-[10px] tracking-widest text-primary mt-1 flex items-center gap-1.5 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />
                <span>CORE NODE ACTIVE</span>
              </div>

              {/* Dimension coordinates */}
              <div
                data-hero-coords
                className="absolute bottom-2.5 inset-x-4 flex justify-between font-sans text-[9px] text-on-surface-variant/70 tracking-wider uppercase font-semibold"
              >
                <span>SYS: 4.0.1</span>
                <span>NODES: 6</span>
                <span>LATENCY: 0ms</span>
              </div>
            </div>
          </div>

          {/* Primary and Secondary CTA Buttons */}
          <div
            data-hero-cta
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 transition-transform duration-300"
          >
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary text-white hover:bg-coral active:scale-95 transition-all font-sans font-bold text-xs tracking-wider uppercase shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>EXPLORE THE SYSTEM</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>

            <button
              onClick={onReadArchitecture}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-surface-container/90 backdrop-blur-md border border-border text-on-surface hover:bg-surface-container-high active:scale-95 transition-all font-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>READ THE ARCHITECTURE</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            CINEMATIC SCROLL MILESTONE TELEMETRY HUD (BOTTOM BAR)
            Ties user's scroll directly to 0.0s - 8.0s milestones
            Interactive scrub bar with clickable milestone markers
            ========================================================= */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6 flex flex-col items-center gap-2.5">
          {/* Milestone Status Pill */}
          <div className="flex items-center justify-between w-full max-w-md px-4 py-1.5 rounded-full bg-surface-container/85 backdrop-blur-md border border-border/70 text-[10px] font-sans tracking-wider text-on-surface-variant uppercase font-semibold shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#E85A4F]" />
              <span ref={milestoneNameRef} className="text-on-surface font-bold">
                {SCROLL_MILESTONES[activeMilestoneIdx]?.name || 'CORE NEXUS'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span ref={timeHudRef} className="font-mono text-primary font-bold">
                0.0s / 8.0s
              </span>
              <span ref={percentHudRef} className="text-on-surface-variant/60 font-mono">
                (0%)
              </span>
            </div>
          </div>

          {/* Visual Scrubbing Progress Bar with Interactive Milestone Dots */}
          <div className="relative w-full max-w-md h-1.5 rounded-full bg-surface-container-high overflow-visible">
            {/* Filled scrub indicator */}
            <div
              ref={progressBarRef}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-secondary via-coral to-primary rounded-full transition-all duration-75"
              style={{ width: '0%' }}
            />

            {/* 11 Interactive Milestone dots along timeline */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-auto px-0.5">
              {SCROLL_MILESTONES.map((m, idx) => (
                <button
                  key={m.name}
                  onClick={() => handleJumpToMilestone(m.p)}
                  title={`${m.name} (${m.time}) - Click to navigate`}
                  aria-label={`Jump to milestone ${m.name} at ${m.time}`}
                  className={`w-2 h-2 rounded-full -translate-y-0.25 transition-all duration-200 cursor-pointer ${
                    activeMilestoneIdx === idx
                      ? 'bg-primary ring-2 ring-primary/40 scale-125'
                      : 'bg-border/80 hover:bg-primary/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Downward Scroll Indicator (Clickable to jump to next section) */}
          <button
            data-hero-scroll
            onClick={onExplore}
            className="text-on-surface-variant hover:text-primary transition-colors flex flex-col items-center gap-0.5 cursor-pointer pt-0.5"
            aria-label="Scroll down to explore"
          >
            <span
              ref={promptTextRef}
              className="text-[9px] font-sans tracking-widest text-on-surface-variant/70 uppercase font-semibold"
            >
              SCROLL TO SCRUB
            </span>
            <span className="material-symbols-outlined text-[18px] animate-bounce">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
