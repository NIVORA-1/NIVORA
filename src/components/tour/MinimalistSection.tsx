'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/tour/useScrollReveal';

export default function MinimalistSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.12);
  const [openAccordion, setOpenAccordion] = useState<number>(0);
  const [showWhyInsight, setShowWhyInsight] = useState<boolean>(false);

  const accordionItems = [
    {
      title: 'Intentional Task Prioritization',
      desc: 'Surfaces a maximum of three priority queue items at any given moment. Protects cognitive bandwidth from endless paralyzing to-do lists.',
      metric: '3 ITEMS MAX QUEUE',
      preview: {
        eyebrow: 'WORKFLOW DESIGN',
        title: 'Cognitive Load Limiter',
        description: 'Constrains your primary sprint queue to a maximum of three actionable items at once.',
        details: [
          'Prevents paralysis from 40+ item backlogs',
          'Dynamically re-ranks by syllabus exam weightage',
          'Integrated focus mode with auto-advancement',
        ],
        actionText: 'Click accordion to toggle details',
      },
    },
    {
      title: 'Zero Redundant Notifications',
      desc: 'Batches all academic reminders, campus updates, and peer activities into two calm daily digests at 08:00 AM and 08:00 PM.',
      metric: 'CALM TIMEGUARD',
      preview: {
        eyebrow: 'ATTENTION GUARD',
        title: 'Calm Batching Engine',
        description: 'Silences noisy institutional pings and batches updates into predictable daily briefings.',
        details: [
          '08:00 AM daily briefing for scheduled classes',
          '08:00 PM evening review & tomorrow prep',
          'Zero ad-hoc ping disruptions during study hours',
        ],
        actionText: 'Click accordion to toggle details',
      },
    },
    {
      title: 'Syllabus-Linked Context',
      desc: 'Every lecture note, lab submission, and quiz score is automatically indexed to its corresponding semester syllabus milestone.',
      metric: 'CONTEXT PRESERVED',
      preview: {
        eyebrow: 'ACADEMIC ARCHITECTURE',
        title: 'Deterministic Knowledge Linking',
        description: 'Associates every slide, note, and quiz with its exact semester syllabus milestone and exam weight.',
        details: [
          'Direct mapping to official course topics',
          'Zero disconnected orphan study notes',
          'Instant exam revision maps per subject',
        ],
        actionText: 'Click accordion to toggle details',
      },
    },
  ];

  return (
    <section
      ref={ref}
      id="minimalist"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-hidden"
    >
      {/* Header Label & Heading */}
      <div
        data-mini-heading
        className={`text-center space-y-3 mb-14 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold">
          MINIMALIST BY DESIGN
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-normal tracking-tight text-on-surface leading-[1.08]">
          Only what matters.{' '}
          <span className="italic text-primary">
            When it matters.
          </span>
        </h2>
        <p className="mt-4 font-sans text-xs sm:text-sm tracking-wider leading-relaxed text-on-surface-variant max-w-2xl mx-auto uppercase font-medium">
          NIVORA REDUCES THE NOISE OF TRADITIONAL LMS TOOLS. REPLACING DISTRACTION WITH INTENTIONAL FLOW.
        </p>
      </div>

      {/* Side-by-Side Showcase */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-700 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Left Column: Interactive Clean Workflow Accordion (7 cols) */}
        <div data-mini-left className="lg:col-span-7 rounded-2xl bg-surface-container/90 backdrop-blur-sm border border-border/80 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <span className="font-sans text-xs text-on-surface font-bold tracking-wider uppercase">
              Intentional Interaction Model
            </span>
            <span className="font-sans text-[10px] text-primary font-bold uppercase tracking-wider">
              ZERO NOISE PRINCIPLE
            </span>
          </div>

          <div className="space-y-3">
            {accordionItems.map((item, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={item.title}
                  data-mini-item
                  className={`rounded-xl border transition-all duration-200 overflow-clip ${
                    isOpen
                      ? 'bg-surface-container-high border-primary/50 shadow-sm'
                      : 'bg-surface-container-low border-border hover:border-border/80'
                  }`}
                >
                  <button
                    onClick={() => setOpenAccordion(isOpen ? -1 : idx)}
                    className="w-full p-4.5 flex items-center justify-between text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs text-primary font-bold">
                        0{idx + 1}
                      </span>
                      <span className="font-sans text-sm font-bold text-on-surface">
                        {item.title}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200">
                      {isOpen ? 'remove' : 'add'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-border/60 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                        {item.desc}
                      </p>
                      <div className="mt-3 font-sans text-[10px] text-primary uppercase tracking-wider font-bold">
                        {item.metric}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: NIVORA Insight Telemetry Card (5 cols) */}
        <div data-mini-telemetry className="lg:col-span-5 rounded-2xl bg-surface-container border border-border/90 p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-border/80">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary animate-pulse">
                psychology
              </span>
              <span className="font-sans text-xs tracking-wider text-primary uppercase font-bold">
                NIVORA INSIGHT
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
          </div>

          <div className="space-y-2.5">
            <p className="font-sans text-sm text-on-surface font-semibold leading-snug">
              &ldquo;Your recent quiz results show that Core Analytical Derivations and Unit 03 Concepts are currently your weakest topics.&rdquo;
            </p>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed font-normal">
              Spend 40 minutes reviewing key derivations and foundational practice sets before tomorrow&apos;s lecture.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/learning"
              className="px-4.5 py-2 rounded-full bg-primary text-white hover:bg-coral active:scale-95 transition-all font-sans text-xs font-bold flex items-center gap-1 shadow-md shadow-primary/20"
            >
              <span>Start Revision</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>

            <button
              onClick={() => setShowWhyInsight(!showWhyInsight)}
              className="font-sans text-xs text-on-surface-variant hover:text-on-surface underline underline-offset-4 cursor-pointer transition-colors"
            >
              {showWhyInsight ? 'Hide reasoning' : 'Why this?'}
            </button>
          </div>

          {showWhyInsight && (
            <div className="p-3.5 rounded-xl bg-surface-container-high border border-border text-[11px] text-on-surface-variant space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div>
                <strong className="text-on-surface">Deficit Vector:</strong> Unit 03 Milestone Quiz score was 54%, below your 85% mastery target.
              </div>
              <div>
                <strong className="text-on-surface">Impact:</strong> Major mid-term examination in 18 days allocates 30% weightage to these concepts.
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border/60 text-center">
            <span className="font-display italic text-lg sm:text-xl text-primary font-normal">
              &ldquo;Less information, higher clarity.&rdquo;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
