'use client';

import React from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/components/tour/useScrollReveal';

interface ModuleItem {
  num: string;
  title: string;
  name: string;
  desc: string;
  icon: string;
  link: string;
  preview: {
    eyebrow: string;
    title: string;
    description: string;
    details: string[];
    actionText: string;
  };
}

export default function ModulesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.12);
  const modules: ModuleItem[] = [
    {
      num: '01',
      title: 'MODULE 01',
      name: 'LEARNING HUB',
      desc: 'Core academic lecture notes, interactive concept maps, and video transcripts indexed by syllabus topic.',
      icon: 'local_library',
      link: '/learning',
      preview: {
        eyebrow: 'MODULE 01 • ACADEMIC ASSETS',
        title: 'Learning Hub',
        description: 'Core academic lecture notes, interactive concept maps, and video transcripts indexed by syllabus topic.',
        details: [
          'Topic-indexed study materials & slide decks',
          'Interactive semantic concept relationship maps',
          'Auto-generated revision briefs per lecture',
        ],
        actionText: 'Launch Learning Hub',
      },
    },
    {
      num: '02',
      title: 'MODULE 02',
      name: 'SYLLABUS VAULT',
      desc: 'Institutional syllabus decomposed into trackable knowledge nodes with semester completion percentages.',
      icon: 'auto_stories',
      link: '/subjects',
      preview: {
        eyebrow: 'MODULE 02 • CURRICULUM ARCHITECTURE',
        title: 'Syllabus Vault',
        description: 'Institutional syllabus decomposed into trackable knowledge nodes with semester completion percentages.',
        details: [
          'Real-time topic milestone progress tracking',
          'Credit hour & exam weightage breakdown',
          'Direct mapping to official university syllabus',
        ],
        actionText: 'Explore Syllabus Vault',
      },
    },
    {
      num: '03',
      title: 'MODULE 03',
      name: 'PROJECT WORKSHOP',
      desc: 'Artifact repository with git commit replay, architectural documentation, and live execution demos.',
      icon: 'code',
      link: '/projects',
      preview: {
        eyebrow: 'MODULE 03 • PROOF OF WORK',
        title: 'Project Workshop',
        description: 'Artifact repository with git commit replay, architectural documentation, and live execution demos.',
        details: [
          'Verifiable proof-of-work project dossiers',
          'Live deployment & architectural decision logs',
          'Cross-disciplinary portfolio showcases',
        ],
        actionText: 'Open Project Workshop',
      },
    },
    {
      num: '04',
      title: 'MODULE 04',
      name: 'REC RECRUITER',
      desc: 'Verified portfolio dossiers, merit-ranked skill proof, and direct interview pipelines for top industry employers.',
      icon: 'work_outline',
      link: '/career',
      preview: {
        eyebrow: 'MODULE 04 • CAREER & OPPORTUNITY',
        title: 'Career & Talent Pipeline',
        description: 'Verified portfolio dossiers, merit-ranked skill proof, and direct interview pipelines for top industry employers.',
        details: [
          'Direct recruiter outreach & talent pipelines',
          'Merit-ranked, peer-reviewed skill proofs',
          'Target role milestones & competency maps',
        ],
        actionText: 'Enter Talent Pipeline',
      },
    },
    {
      num: '05',
      title: 'MODULE 05',
      name: 'EXAM PREPARATION',
      desc: 'Cadence simulator, past question repositories, and AI-assisted weakness diagnostics before midterms and finals.',
      icon: 'history_edu',
      link: '/exams',
      preview: {
        eyebrow: 'MODULE 05 • ASSESSMENT CADENCE',
        title: 'Exam Preparation & Diagnostics',
        description: 'Cadence simulator, past question repositories, and AI-assisted weakness diagnostics before midterms and finals.',
        details: [
          'Timed exam simulation environment',
          'Historical question paper vault & solutions',
          'Adaptive weakness heatmap & targeted sprints',
        ],
        actionText: 'Start Exam Preparation',
      },
    },
    {
      num: '06',
      title: 'MODULE 06',
      name: 'FOCUS SUITE',
      desc: 'Integrated lo-fi acoustic ambient player, Pomodoro temporal blocks, and screen time balance guardrails.',
      icon: 'headphones',
      link: '/music',
      preview: {
        eyebrow: 'MODULE 06 • REBOOT & DEEP WORK',
        title: 'Focus Suite & Ambient Player',
        description: 'Integrated lo-fi acoustic ambient player, Pomodoro temporal blocks, and screen time balance guardrails.',
        details: [
          'Integrated procedural lo-fi audio soundscapes',
          'Distraction-free Pomodoro sprint timer',
          'Digital habit guardrails & deep focus logs',
        ],
        actionText: 'Launch Focus Suite',
      },
    },
    {
      num: '07',
      title: 'MODULE 07',
      name: 'CAMPUS COMMUNITY',
      desc: 'Campus peer exchange, verified course reviews, subject-specific forum threads, and collaborative study groups.',
      icon: 'groups',
      link: '/connect',
      preview: {
        eyebrow: 'MODULE 07 • NETWORK & COLLABORATION',
        title: 'Campus Community & Peer Lounges',
        description: 'Campus peer exchange, verified course reviews, subject-specific forum threads, and collaborative study groups.',
        details: [
          'Subject-specific peer discussion rooms',
          'Verified course insights & professor reviews',
          'Collaborative hackathon & study group teams',
        ],
        actionText: 'Join Campus Community',
      },
    },
  ];

  return (
    <section
      ref={ref}
      id="modules"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-hidden"
    >
      {/* Header Label & Heading */}
      <div
        data-module-heading
        className={`text-center space-y-3 mb-14 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold">
          FOUNDATIONAL CURRICULUM
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-normal tracking-tight text-on-surface leading-[1.08]">
          Learn. Plan. Focus. Grow. Connect.
        </h2>
        <p className="mt-4 font-sans text-xs sm:text-sm tracking-wider leading-relaxed text-on-surface-variant max-w-2xl mx-auto uppercase font-medium">
          THE 7 INTEGRATED MODULES POWERING YOUR COMPLETE ACADEMIC TRAJECTORY.
        </p>
      </div>

      {/* 7 Modules Grid */}
      <div
        data-modules-grid
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 transition-all duration-700 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {modules.map((mod, idx) => (
          <div
            key={mod.num}
            data-module-card
            style={{ transitionDelay: `${idx * 40}ms` }}
            className={`h-full ${idx === 6 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
          >
            <Link
              href={mod.link}
              className="h-full rounded-2xl bg-surface-container/90 backdrop-blur-sm border border-border p-6 flex flex-col justify-between hover:bg-surface-container-high hover:border-primary/50 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] text-primary font-bold tracking-wider uppercase">
                    {mod.title}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border/80 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      {mod.icon}
                    </span>
                  </div>
                </div>

                <h3 className="font-sans text-sm sm:text-base font-bold text-on-surface mb-2 tracking-tight">
                  {mod.name}
                </h3>

                <p className="text-xs text-on-surface-variant font-sans leading-relaxed font-normal">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-border/60 flex items-center justify-between font-sans text-[11px] text-on-surface-variant font-bold tracking-wider uppercase">
                <span>LAUNCH MODULE</span>
                <span className="material-symbols-outlined text-[14px] text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
