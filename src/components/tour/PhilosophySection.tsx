'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/tour/useScrollReveal';

interface PhilosophyPillar {
  id: string;
  name: string;
  tag: string;
  icon: string;
  desc: string;
  detail: string;
  link: string;
  previewEyebrow: string;
  previewTitle: string;
  previewDetails: string[];
}

export default function PhilosophySection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.12);
  const [activePillar, setActivePillar] = useState<string | null>(null);

  const pillars: PhilosophyPillar[] = [
    {
      id: 'learn',
      name: 'LEARN',
      tag: 'ACADEMIC REPOSITORY',
      icon: 'local_library',
      desc: 'Coursework, intelligent notes, lecture capture synced directly to syllabus milestones and assessment schedules.',
      detail: 'Eliminates fractured note-taking apps by anchoring every insight directly to examination question banks and prerequisite concepts.',
      link: '/learning',
      previewEyebrow: 'ACADEMIC REPOSITORY',
      previewTitle: 'LEARN — Intelligent Capture',
      previewDetails: ['Anchored to Question Banks', 'Eliminates Scattered Note Apps'],
    },
    {
      id: 'plan',
      name: 'PLAN',
      tag: 'TEMPORAL ARCHITECTURE',
      icon: 'calendar_today',
      desc: 'Dynamic temporal architecture that adjusts daily priority queue to exam dates, assignment deadlines, and lab submissions.',
      detail: 'Intelligently spaces out assignments and revision blocks according to spaced repetition algorithms so cramming becomes obsolete.',
      link: '/planner',
      previewEyebrow: 'TEMPORAL ARCHITECTURE',
      previewTitle: 'PLAN — Dynamic Priority Queue',
      previewDetails: ['Spaced Repetition Spacing', 'Eliminates Last-Minute Cramming'],
    },
    {
      id: 'prove',
      name: 'PROVE',
      tag: 'CRYPTOGRAPHIC MERIT',
      icon: 'verified',
      desc: 'Cryptographically verifiable project artifacts, git commit replays, and peer review dossiers for top recruiters.',
      detail: 'Proves authentic authorship with deterministic commit timelines, eliminating inflated resume claims with audited execution proof.',
      link: '/projects',
      previewEyebrow: 'CRYPTOGRAPHIC MERIT',
      previewTitle: 'PROVE — Verifiable Proof-of-Work',
      previewDetails: ['Audited Execution Demos', 'Direct Recruiter Dossiers'],
    },
    {
      id: 'grow',
      name: 'GROW',
      tag: 'SKILL GRAPH',
      icon: 'psychology',
      desc: 'Adaptive skill graph that advances automatically as you complete coursework, lab exercises, and capstone projects.',
      detail: 'Maps your competencies across industry benchmarks (e.g. Distributed Systems, ML Infra, Financial Modeling) with realtime percentiles.',
      link: '/skills',
      previewEyebrow: 'COMPETENCY GRAPH',
      previewTitle: 'GROW — Adaptive Skill Graph',
      previewDetails: ['Industry Percentile Benchmarks', 'Automated Skill Verification'],
    },
    {
      id: 'reflect',
      name: 'REFLECT',
      tag: 'WELLBEING PROTOCOL',
      icon: 'self_improvement',
      desc: 'Cognitive load telemetry, deep work tracking, and Reboot balance protocol to eliminate digital burnout.',
      detail: 'Monitors screen-time deficits, short-form doomscrolling triggers, and provides binaural alpha wave reset sessions.',
      link: '/reboot',
      previewEyebrow: 'WELLBEING PROTOCOL',
      previewTitle: 'REFLECT — Reboot Protocol',
      previewDetails: ['Screen-Time Deficit Monitoring', 'Binaural Reset Blocks'],
    },
    {
      id: 'connect',
      name: 'CONNECT',
      tag: 'CAMPUS NETWORK',
      icon: 'forum',
      desc: 'Verified campus peer lounges, collaborative study channels, and direct dossiers to verified technical recruiters.',
      detail: 'Allows you to form verified hackathon squads, share high-scoring lecture notes, and be discovered by engineering hiring managers.',
      link: '/connect',
      previewEyebrow: 'CAMPUS NETWORK',
      previewTitle: 'CONNECT — Peer Lounges',
      previewDetails: ['Zero-Distraction Peer Spaces', 'Engineering Hiring Pipelines'],
    },
  ];

  return (
    <section
      ref={ref}
      id="philosophy"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-hidden"
    >
      {/* Header Label & Heading */}
      <div
        data-philo-heading
        className={`text-center space-y-3 mb-14 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold">
          DESIGN PHILOSOPHY
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-normal tracking-tight text-on-surface leading-[1.08]">
          More than{' '}
          <span className="italic text-primary">
            a planner.
          </span>
        </h2>
        <p className="mt-4 font-sans text-xs sm:text-sm tracking-wider leading-relaxed text-on-surface-variant max-w-2xl mx-auto uppercase font-medium">
          A SYSTEM DESIGNED TO MINIMIZE COGNITIVE OVERHEAD WHILE MAXIMIZING CONTEXT RETENTION.
        </p>
      </div>

      {/* 6 Grid Cards */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-700 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {pillars.map((pillar, idx) => {
          const isExpanded = activePillar === pillar.id;
          return (
            <div
              key={pillar.id}
              data-philo-card
              style={{ transitionDelay: `${idx * 40}ms` }}
              onClick={() => setActivePillar(isExpanded ? null : pillar.id)}
              className={`group rounded-2xl border p-6 sm:p-7 flex flex-col justify-between cursor-pointer h-full text-left transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl ${
                isExpanded
                  ? 'border-primary bg-secondary-container/90 ring-1 ring-primary/20 shadow-[0_0_25px_rgba(232,90,79,0.14)]'
                  : 'bg-surface-container/90 backdrop-blur-sm border-border hover:border-primary/40 hover:bg-surface-container-high'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">
                      {pillar.icon}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container-high border border-border text-on-surface-variant uppercase tracking-wider font-bold">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="font-sans text-base sm:text-lg font-bold tracking-tight text-on-surface mb-2">
                  {pillar.name}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                  {pillar.desc}
                </p>

                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-border/80 text-xs text-primary font-sans leading-relaxed font-normal animate-in fade-in slide-in-from-top-1 duration-200">
                    {pillar.detail}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="font-sans text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">
                  {isExpanded ? 'TAP TO COLLAPSE' : 'TAP FOR DETAIL'}
                </span>
                <Link
                  href={pillar.link}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 font-sans text-xs font-bold text-primary hover:text-coral transition-colors"
                >
                  <span>Explore</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
