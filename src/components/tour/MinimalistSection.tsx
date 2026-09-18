'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MinimalistSection() {
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
    <section id="minimalist" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Header Label */}
      <div data-mini-heading className="text-center space-y-3 mb-14">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[#747F7B] uppercase font-bold">
          MINIMALIST BY DESIGN
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-[-0.025em] text-[#F1F0E8] leading-[1.15]">
          Only what matters.{' '}
          <span className="font-serif italic text-[#8FC5A7] font-normal">
            When it matters.
          </span>
        </h2>
        <p className="mt-4 font-mono text-[11px] sm:text-xs tracking-[0.18em] leading-relaxed text-[#747F7B] max-w-2xl mx-auto uppercase font-normal">
          NIVORA REDUCES THE NOISE OF TRADITIONAL LMS TOOLS. REPLACING DISTRACTION WITH INTENTIONAL FLOW.
        </p>
      </div>

      {/* Side-by-Side Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Clean Workflow Accordion (7 cols) */}
        <div data-mini-left className="lg:col-span-7 rounded-2xl bg-[#172329] border border-[#29383D] p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#29383D]">
            <span className="font-mono text-xs text-[#F1F0E8] font-bold tracking-wider uppercase">
              Intentional Interaction Model
            </span>
            <span className="font-mono text-[10px] text-[#8FC5A7] font-semibold">ZERO NOISE PRINCIPLE</span>
          </div>

          <div className="space-y-3">
            {accordionItems.map((item, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={item.title}
                  data-mini-item
                  className="rounded-xl bg-[#1C2A30] border border-[#29383D] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenAccordion(isOpen ? -1 : idx)}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[#8FC5A7] font-bold">
                        0{idx + 1}
                      </span>
                      <span className="font-sans text-sm font-bold text-[#F1F0E8]">
                        {item.title}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#A6ADA9] transition-transform duration-200">
                      {isOpen ? 'remove' : 'add'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#29383D]/60 animate-in fade-in duration-150">
                      <p className="font-sans text-xs text-[#A6ADA9] leading-relaxed font-normal">
                        {item.desc}
                      </p>
                      <div className="mt-2.5 font-mono text-[9px] text-[#8FC5A7] uppercase tracking-wider font-semibold">
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
        <div data-mini-telemetry className="lg:col-span-5 rounded-2xl bg-[#172329] border border-[#29383D] p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#29383D]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#8FC5A7]">
                psychology
              </span>
              <span className="font-mono text-[11px] tracking-wider text-[#8FC5A7] uppercase font-bold">
                NIVORA INSIGHT
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#8FC5A7] animate-pulse" />
          </div>

          <div className="space-y-2">
            <p className="font-sans text-sm text-[#F1F0E8] font-semibold leading-snug">
              &ldquo;Your recent quiz results show that Core Analytical Derivations and Unit 03 Concepts are currently your weakest topics.&rdquo;
            </p>
            <p className="font-sans text-xs text-[#A6ADA9] leading-relaxed font-normal">
              Spend 40 minutes reviewing key derivations and foundational practice sets before tomorrow&apos;s lecture.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/learning"
              className="px-4 py-2 rounded-lg bg-[#8FC5A7] text-[#0F171B] font-sans text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <span>Start Revision</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>

            <button
              onClick={() => setShowWhyInsight(!showWhyInsight)}
              className="font-sans text-xs text-[#A6ADA9] underline underline-offset-4 cursor-pointer"
            >
              Why this?
            </button>
          </div>

          {showWhyInsight && (
            <div className="p-3 rounded-lg bg-[#1C2A30] border border-[#29383D] text-[11px] text-[#A6ADA9] space-y-1.5 animate-in fade-in duration-200">
              <div>
                <strong className="text-[#F1F0E8]">Deficit Vector:</strong> Unit 03 Milestone Quiz score was 54%, below your 85% mastery target.
              </div>
              <div>
                <strong className="text-[#F1F0E8]">Impact:</strong> Major mid-term examination in 18 days allocates 30% weightage to these concepts.
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#29383D]/60 text-center">
            <span className="font-serif italic text-sm text-[#8FC5A7]">
              &ldquo;Less information, higher clarity.&rdquo;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
