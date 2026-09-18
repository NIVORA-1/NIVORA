'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
    <section id="philosophy" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Header Label */}
      <div data-philo-heading className="text-center space-y-3 mb-14 will-change-transform">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[#747F7B] uppercase font-bold">
          DESIGN PHILOSOPHY
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-[-0.025em] text-[#F1F0E8] leading-[1.15]">
          More than{' '}
          <span className="font-serif italic text-[#8FC5A7] font-normal">
            a planner.
          </span>
        </h2>
        <p className="mt-4 font-mono text-[11px] sm:text-xs tracking-[0.18em] leading-relaxed text-[#747F7B] max-w-2xl mx-auto uppercase font-normal">
          A SYSTEM DESIGNED TO MINIMIZE COGNITIVE OVERHEAD WHILE MAXIMIZING CONTEXT RETENTION.
        </p>
      </div>

      {/* 6 Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transform scale-[0.88] sm:scale-[0.92] lg:scale-100 origin-top">
        {pillars.map((pillar) => {
          const isExpanded = activePillar === pillar.id;
          return (
            <div
              key={pillar.id}
              data-philo-card
              onClick={() => setActivePillar(isExpanded ? null : pillar.id)}
              className={`rounded-xl bg-[#172329] border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer h-full text-left will-change-transform ${
                isExpanded
                  ? 'border-[#8FC5A7] bg-[#1C2A30] shadow-[0_0_25px_rgba(143,197,167,0.12)]'
                  : 'border-[#29383D]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#0F171B] border border-[#29383D] flex items-center justify-center text-[#8FC5A7]">
                    <span className="material-symbols-outlined text-[20px]">
                      {pillar.icon}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#1C2A30] border border-[#29383D] text-[#747F7B] uppercase tracking-wider font-semibold">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="font-mono text-base font-bold tracking-wider text-[#F1F0E8] mb-2">
                  {pillar.name}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#A6ADA9] leading-relaxed font-normal">
                  {pillar.desc}
                </p>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#29383D] text-xs text-[#8FC5A7] font-sans leading-relaxed animate-in fade-in duration-200 font-normal">
                    {pillar.detail}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#29383D]/60 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#747F7B] font-medium">
                  {isExpanded ? 'TAP TO COLLAPSE' : 'TAP FOR DETAIL'}
                </span>
                <Link
                  href={pillar.link}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#8FC5A7]"
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
