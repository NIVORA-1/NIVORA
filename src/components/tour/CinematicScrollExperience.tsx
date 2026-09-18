'use client';

import React, { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface CinematicScrollExperienceProps {
  children: React.ReactNode;
}

export default function CinematicScrollExperience({ children }: CinematicScrollExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Expose gsap and ScrollTrigger globally for DevTools inspection & testing
    (window as any).gsap = gsap;
    (window as any).ScrollTrigger = ScrollTrigger;

    const ctx = gsap.context(() => {
      // Global Scroll Timeline Playhead Tracker (0% to 100%)
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2,
          },
        });
      }

      // -----------------------------------------------------------------------
      // FRAME 01: HERO SCENE (0% -> 15%)
      // -----------------------------------------------------------------------
      const sceneHero = containerRef.current?.querySelector<HTMLElement>('#scene-hero');
      if (sceneHero) {
        const heroTitle = sceneHero.querySelector('[data-hero-title]');
        const heroConnected = sceneHero.querySelector('[data-hero-connected]');
        const heroSubtitle = sceneHero.querySelector('[data-hero-subtitle]');
        const heroCore = sceneHero.querySelector('[data-hero-core]');
        const heroCoords = sceneHero.querySelector('[data-hero-coords]');
        const heroFlourish = sceneHero.querySelector('[data-hero-flourish]');
        const heroCta = sceneHero.querySelector('[data-hero-cta]');
        const heroBg = sceneHero.querySelector('[data-hero-bg]');
        const heroTag = sceneHero.querySelector('[data-hero-tag]');
        const heroScroll = sceneHero.querySelector('[data-hero-scroll]');

        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneHero,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        // Initial state
        if (heroCoords) gsap.set(heroCoords, { opacity: 0, scale: 0.85 });
        if (heroFlourish) gsap.set(heroFlourish, { opacity: 0 });

        // Step 1: Headline scales 1 -> 0.75, moves upward. "connected." moves opposite.
        if (heroTitle) {
          heroTl.to(heroTitle, { y: -120, scale: 0.75, transformOrigin: 'center top', duration: 0.5, ease: 'power1.out' }, 0);
        }
        if (heroConnected) {
          heroTl.to(heroConnected, { y: 35, x: 20, scale: 1.15, duration: 0.5, ease: 'power1.out' }, 0);
        }
        if (heroTag) {
          heroTl.to(heroTag, { y: -40, opacity: 0, duration: 0.3 }, 0);
        }
        if (heroSubtitle) {
          heroTl.to(heroSubtitle, { y: 50, opacity: 0, duration: 0.35 }, 0);
        }
        if (heroCta) {
          heroTl.to(heroCta, { y: 60, opacity: 0, duration: 0.35 }, 0);
        }
        if (heroScroll) {
          heroTl.to(heroScroll, { opacity: 0, duration: 0.2 }, 0);
        }

        // Core node moves toward center and scales up significantly (scale: 1 -> 1.45)
        if (heroCore) {
          heroTl.to(heroCore, { y: -30, scale: 1.45, transformOrigin: 'center center', duration: 0.5, ease: 'power2.out' }, 0.05);
        }
        // Decorative system elements appear around core node
        if (heroCoords) {
          heroTl.to(heroCoords, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 0.2);
        }
        if (heroFlourish) {
          heroTl.to(heroFlourish, { opacity: 1, duration: 0.3 }, 0.15);
        }
        if (heroBg) {
          heroTl.to(heroBg, { scale: 1.4, opacity: 0.9, y: 50, duration: 0.5 }, 0);
        }

        // Step 2: Transition into system — core node expands into camera, title clears
        if (heroTitle) {
          heroTl.to(heroTitle, { opacity: 0, y: -180, duration: 0.3 }, 0.6);
        }
        if (heroCore) {
          heroTl.to(heroCore, { scale: 2.3, opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.65);
        }
      }

      // -----------------------------------------------------------------------
      // FRAME 02: FRAGMENTATION SCENE (15% -> 30%)
      // -----------------------------------------------------------------------
      const sceneFrag = containerRef.current?.querySelector<HTMLElement>('#scene-fragmentation');
      if (sceneFrag) {
        const fragHeading = sceneFrag.querySelector('[data-frag-heading]');
        const fragCards = sceneFrag.querySelectorAll<HTMLElement>('[data-frag-card]');
        const fragFilaments = sceneFrag.querySelector('[data-frag-filaments]');
        const fragQuote = sceneFrag.querySelector('[data-frag-quote]');

        const fragTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneFrag,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        // Problem heading rises into view
        if (fragHeading) {
          fragTl.fromTo(fragHeading, { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }, 0);
        }

        // 5 Cards enter from different directions with rotation (SCATTERED -> ORGANIZED)
        const entries = [
          { x: -400, y: -40, rotate: -12, scale: 0.8 },
          { x: 400, y: -40, rotate: 12, scale: 0.8 },
          { x: -320, y: 180, rotate: -8, scale: 0.8 },
          { x: 320, y: 180, rotate: 8, scale: 0.8 },
          { x: 0, y: 260, rotate: 0, scale: 0.8 },
        ];

        fragCards.forEach((card, i) => {
          const entry = entries[i % entries.length];
          fragTl.fromTo(
            card,
            { x: entry.x, y: entry.y, rotation: entry.rotate, scale: entry.scale, opacity: 0 },
            { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'power2.out' },
            0.1 + i * 0.06
          );
        });

        // Filaments and quote reveal
        if (fragFilaments) {
          fragTl.fromTo(fragFilaments, { opacity: 0 }, { opacity: 0.7, duration: 0.3 }, 0.35);
        }
        if (fragQuote) {
          fragTl.fromTo(fragQuote, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.4);
        }

        // Visually collapse cards toward central node at end of scene (0.75 -> 1.0)
        fragTl.to(
          fragCards,
          {
            scale: 0.65,
            opacity: 0.2,
            y: (i) => (i < 2 ? 60 : -60),
            x: (i) => (i % 2 === 0 ? 50 : -50),
            duration: 0.25,
            ease: 'power2.in',
          },
          0.75
        );
        if (fragHeading) {
          fragTl.to(fragHeading, { opacity: 0, y: -40, duration: 0.2 }, 0.8);
        }
        if (fragQuote) {
          fragTl.to(fragQuote, { opacity: 0, duration: 0.2 }, 0.8);
        }
      }

      // -----------------------------------------------------------------------
      // FRAME 03: BRING IT TOGETHER (ECOSYSTEM) (30% -> 45%)
      // -----------------------------------------------------------------------
      const sceneArch = containerRef.current?.querySelector<HTMLElement>('#scene-architecture');
      if (sceneArch) {
        const orbitHeading = sceneArch.querySelector('[data-orbit-heading]');
        const orbitCenter = sceneArch.querySelector('[data-orbit-center]');
        const orbitRings = sceneArch.querySelectorAll('[data-orbit-ring]');
        const orbitNodes = sceneArch.querySelectorAll<HTMLElement>('[data-orbit-node]');
        const orbitInspector = sceneArch.querySelector('[data-orbit-inspector]');

        const archTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneArch,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        if (orbitHeading) {
          archTl.fromTo(orbitHeading, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0);
        }

        // Central Nivora node emerges from collapse point and scales up
        if (orbitCenter) {
          archTl.fromTo(
            orbitCenter,
            { scale: 0.25, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' },
            0.05
          );
        }

        // Orbit rings expand and rotate
        if (orbitRings.length) {
          archTl.fromTo(
            orbitRings,
            { scale: 0.2, opacity: 0, rotation: -40 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: 'power2.out' },
            0.15
          );
        }

        // 6 Satellite nodes appear around it in sequential clockwise illumination
        orbitNodes.forEach((node, i) => {
          archTl.fromTo(
            node,
            { scale: 0.2, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' },
            0.25 + i * 0.08
          );
        });

        // Telemetry drawer slides up
        if (orbitInspector) {
          archTl.fromTo(orbitInspector, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.65);
        }
      }

      // -----------------------------------------------------------------------
      // FRAME 04: STREAM ADAPTATION (45% -> 60%)
      // -----------------------------------------------------------------------
      const sceneAdapt = containerRef.current?.querySelector<HTMLElement>('#scene-adaptation');
      if (sceneAdapt) {
        const streamHeading = sceneAdapt.querySelector('[data-stream-heading]');
        const streamPills = sceneAdapt.querySelectorAll<HTMLElement>('[data-stream-pill]');
        const streamDashboard = sceneAdapt.querySelector('[data-stream-dashboard]');

        const adaptTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneAdapt,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        if (streamHeading) {
          adaptTl.fromTo(streamHeading, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0);
        }

        // Stream pills cascade horizontally
        if (streamPills.length) {
          adaptTl.fromTo(
            streamPills,
            { x: -140, opacity: 0, scale: 0.9 },
            { x: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.35, ease: 'power2.out' },
            0.1
          );
        }

        // Interface preview scales 0.94 -> 1 and tilts into clarity
        if (streamDashboard) {
          adaptTl.fromTo(
            streamDashboard,
            { scale: 0.92, rotateX: 10, y: 70, opacity: 0, filter: 'blur(8px)' },
            { scale: 1, rotateX: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' },
            0.2
          );
        }
      }

      // -----------------------------------------------------------------------
      // FRAME 05: PHILOSOPHY ("MORE THAN A PLANNER") (60% -> 72%)
      // -----------------------------------------------------------------------
      const scenePhilo = containerRef.current?.querySelector<HTMLElement>('#scene-philosophy');
      if (scenePhilo) {
        const philoHeading = scenePhilo.querySelector('[data-philo-heading]');
        const philoCards = scenePhilo.querySelectorAll<HTMLElement>('[data-philo-card]');

        const philoTl = gsap.timeline({
          scrollTrigger: {
            trigger: scenePhilo,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        if (philoHeading) {
          philoTl.fromTo(philoHeading, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0);
        }

        // LEARN, PLAN, PROVE, GROW, REFLECT, CONNECT enter progressively in 3D cascade
        philoCards.forEach((card, i) => {
          const rot = i % 2 === 0 ? -6 : 6;
          const xOffset = i % 2 === 0 ? -60 : 60;
          philoTl.fromTo(
            card,
            { y: 80, x: xOffset, rotateY: rot, scale: 0.9, opacity: 0 },
            { y: 0, x: 0, rotateY: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' },
            0.15 + i * 0.08
          );
        });
      }

      // -----------------------------------------------------------------------
      // FRAME 06: MINIMALIST ("ONLY WHAT MATTERS") (72% -> 84%)
      // -----------------------------------------------------------------------
      const sceneMini = containerRef.current?.querySelector<HTMLElement>('#scene-minimalist');
      if (sceneMini) {
        const miniHeading = sceneMini.querySelector('[data-mini-heading]');
        const miniLeft = sceneMini.querySelector('[data-mini-left]');
        const miniItems = sceneMini.querySelectorAll('[data-mini-item]');
        const miniTelemetry = sceneMini.querySelector('[data-mini-telemetry]');

        const miniTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneMini,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        if (miniHeading) {
          miniTl.fromTo(miniHeading, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0);
        }
        if (miniLeft) {
          miniTl.fromTo(miniLeft, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.1);
        }
        if (miniItems.length) {
          miniTl.fromTo(miniItems, { y: 25, opacity: 0.2 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.35 }, 0.2);
        }
        if (miniTelemetry) {
          miniTl.fromTo(miniTelemetry, { x: 80, opacity: 0, scale: 0.95 }, { x: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0.25);
        }
      }

      // -----------------------------------------------------------------------
      // FRAME 07: MODULES (84% -> 94%)
      // -----------------------------------------------------------------------
      const sceneModules = containerRef.current?.querySelector<HTMLElement>('#scene-modules');
      if (sceneModules) {
        const modHeading = sceneModules.querySelector('[data-module-heading]');
        const modCards = sceneModules.querySelectorAll<HTMLElement>('[data-module-card]');

        const modTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneModules,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        if (modHeading) {
          modTl.fromTo(modHeading, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0);
        }
        if (modCards.length) {
          modTl.fromTo(
            modCards,
            { y: 90, scale: 0.92, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, stagger: 0.08, duration: 0.45, ease: 'power2.out' },
            0.15
          );
        }
      }

      // -----------------------------------------------------------------------
      // FRAME 08: FINAL INVITATION (94% -> 100%)
      // -----------------------------------------------------------------------
      const sceneConnect = containerRef.current?.querySelector<HTMLElement>('#scene-connect');
      if (sceneConnect) {
        const inviteGlow = sceneConnect.querySelector('[data-invite-glow]');
        const inviteHeading = sceneConnect.querySelector('[data-invite-heading]');
        const inviteCta = sceneConnect.querySelector('[data-invite-cta]');
        const inviteBadges = sceneConnect.querySelector('[data-invite-badges]');
        const inviteQuote = sceneConnect.querySelector('[data-invite-quote]');

        const connectTl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneConnect,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        if (inviteGlow) {
          connectTl.fromTo(inviteGlow, { scale: 0.5, opacity: 0.1 }, { scale: 1.6, opacity: 0.8, duration: 0.6 }, 0);
        }
        if (inviteHeading) {
          connectTl.fromTo(inviteHeading, { y: 50, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1);
        }
        if (inviteCta) {
          connectTl.fromTo(inviteCta, { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, 0.3);
        }
        if (inviteBadges) {
          connectTl.fromTo(inviteBadges, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3 }, 0.4);
        }
        if (inviteQuote) {
          connectTl.fromTo(inviteQuote, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 0.5);
        }
      }
    }, containerRef);

    // Refresh ScrollTrigger calculations after initial layout
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Discrete agency-grade timeline playhead progress bar at top */}
      <div
        ref={progressBarRef}
        className="fixed top-[57px] left-0 h-[2.5px] w-full bg-gradient-to-r from-[#8FC5A7]/30 via-[#8FC5A7] to-[#aae1c2] z-40 pointer-events-none origin-left scale-x-0 will-change-transform shadow-[0_0_10px_rgba(143,197,167,0.5)]"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
