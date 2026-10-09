'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NivoraLogo from '@/components/ui/NivoraLogo';
import { useScrollReveal } from '@/components/tour/useScrollReveal';

interface OrbitNode {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  route: string;
  details: string;
  stat: string;
  previewEyebrow: string;
  previewDesc: string;
  previewDetails: string[];
}

export default function SingleInterfaceSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.12);
  const [selectedNode, setSelectedNode] = useState<string>('curriculum');

  const nodes: OrbitNode[] = [
    {
      id: 'curriculum',
      name: 'CURRICULUM',
      subtitle: 'Courses, notes, labs',
      icon: 'auto_stories',
      route: '/subjects',
      details: 'All syllabi, lectures, professor notes, and lab problem sets mapped to a single unified semester tree.',
      stat: '4 Years • 32 Courses Unified',
      previewEyebrow: 'ACADEMIC REPOSITORY',
      previewDesc: 'Unified semester tree synchronizing lectures, syllabi, notes, and lab assignments.',
      previewDetails: ['Single 4-Year Academic Record', 'Context Preserved from Day 01'],
    },
    {
      id: 'projects',
      name: 'PROJECTS',
      subtitle: 'Repos, proof of work',
      icon: 'code',
      route: '/projects',
      details: 'Cryptographically verifiable commit replays, architecture whitepapers, and live containerized previews.',
      stat: 'Verified Proof-of-Work',
      previewEyebrow: 'PROOF OF WORK',
      previewDesc: 'Verifiable technical artifacts, reproducible commit timelines, and execution previews.',
      previewDetails: ['Cryptographic Authorship Proof', 'Live Interactive Previews'],
    },
    {
      id: 'portfolio',
      name: 'PORTFOLIO',
      subtitle: 'Verified skills, artifacts',
      icon: 'psychology',
      route: '/skills',
      details: 'Dynamic skill graph backed by actual lab submissions, algorithmic benchmarks, and code analysis.',
      stat: 'Continuous Competency Graph',
      previewEyebrow: 'COMPETENCY GRAPH',
      previewDesc: 'Continuous skill advancement graph driven by verified coursework and project submissions.',
      previewDetails: ['Dynamic Percentile Benchmarks', 'Zero Resume Fluff'],
    },
    {
      id: 'career',
      name: 'CAREER',
      subtitle: 'Placements, dossiers',
      icon: 'work_outline',
      route: '/career',
      details: 'Automated recruiter dossiers featuring interview replays, ATS-optimized portfolios, and verified merit rankings.',
      stat: 'Direct Recruiter Pipeline',
      previewEyebrow: 'PLACEMENT PIPELINE',
      previewDesc: 'Automated recruiter dossiers matching your verified academic proof to top employers.',
      previewDetails: ['Direct Recruiter Pipelines', 'ATS-Optimized Portfolios'],
    },
    {
      id: 'exams',
      name: 'EXAMS',
      subtitle: 'Syllabus, past papers',
      icon: 'history_edu',
      route: '/exams',
      details: 'Targeted weakness diagnostics, question vaults, and AI-predicted revision blocks before midterms.',
      stat: 'Predictive Assessment Cadence',
      previewEyebrow: 'ASSESSMENT SUITE',
      previewDesc: 'Intelligent diagnostic assessments, past examinations, and predictive revision scheduling.',
      previewDetails: ['Spaced Repetition Algorithm', 'Weakness Diagnostic Telemetry'],
    },
    {
      id: 'community',
      name: 'COMMUNITY',
      subtitle: 'Peer networks, study groups',
      icon: 'forum',
      route: '/connect',
      details: 'Focus lounges, collaborative study rooms, course-specific discussion channels, and hackathon teams.',
      stat: 'Zero-Distraction Peer Spaces',
      previewEyebrow: 'CAMPUS NETWORK',
      previewDesc: 'Zero-distraction collaborative lounges, campus study groups, and team formation channels.',
      previewDetails: ['Verified Peer Lounges', 'Hackathon Team Sourcing'],
    },
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <section
      ref={ref}
      id="architecture"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center relative overflow-hidden"
    >
      {/* Background Subtle Ambient Glow */}
      <div
        data-orbit-ambient
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[400px] bg-coral/10 blur-[130px] rounded-full pointer-events-none transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Header Label & Heading */}
      <div
        data-orbit-heading
        className={`space-y-3 mb-14 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold">
          THE SINGLE INTERFACE
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-normal tracking-tight text-on-surface leading-[1.08]">
          Bring it{' '}
          <span className="italic text-primary">
            together.
          </span>
        </h2>
        <p className="mt-2 font-sans text-sm sm:text-base text-on-surface-variant font-normal">
          One architecture. Four years. One record.
        </p>
      </div>

      {/* Orbit Visualization Container */}
      <div
        className={`relative max-w-3xl mx-auto py-8 transition-all duration-700 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Subtle circular grid orbit tracks */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div
            data-orbit-ring
            className="w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full border border-border/40 animate-[spin_60s_linear_infinite]"
          />
          <div
            data-orbit-ring
            className="absolute w-[220px] sm:w-[300px] h-[220px] sm:h-[300px] rounded-full border border-dashed border-border/30 animate-[spin_40s_linear_infinite_reverse]"
          />
        </div>

        {/* Center NIVORA Monogram Hub */}
        <div
          data-orbit-center
          className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-surface-container/95 backdrop-blur-md border-2 border-border shadow-[0_0_35px_rgba(232,90,79,0.15)] flex flex-col items-center justify-center mx-auto my-8 hover:scale-105 transition-transform duration-300"
        >
          <NivoraLogo size="medium" priority />
          <span className="text-[9px] font-sans tracking-widest text-primary mt-1 font-bold uppercase">
            CORE HUB
          </span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-coral animate-ping" />
        </div>

        {/* Orbiting Satellite Node Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto relative z-20 mt-6">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            return (
              <button
                key={node.id}
                data-orbit-node
                onClick={() => setSelectedNode(node.id)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer w-full group ${
                  isSelected
                    ? 'bg-secondary-container border-primary shadow-[0_0_24px_rgba(232,90,79,0.18)] scale-[1.02]'
                    : 'bg-surface-container/90 border-border hover:bg-surface-container-high hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] transition-colors ${
                        isSelected ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                      }`}
                    >
                      {node.icon}
                    </span>
                    <span className="font-sans text-xs sm:text-sm font-bold tracking-wide text-on-surface">
                      {node.name}
                    </span>
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isSelected ? 'bg-primary ring-2 ring-primary/30' : 'bg-border'
                    }`}
                  />
                </div>
                <div className="font-sans text-[11px] text-on-surface-variant truncate font-normal">
                  {node.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Node Inspector Drawer */}
        <div
          data-orbit-inspector
          className="mt-8 max-w-2xl mx-auto rounded-2xl bg-surface-container border border-border p-6 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl transition-all duration-300"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-sans text-[10px] tracking-wider text-primary uppercase font-bold">
                ACTIVE DOMAIN: {activeNodeData.name}
              </span>
              <span className="font-sans text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-border font-semibold">
                {activeNodeData.stat}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans leading-relaxed font-normal">
              {activeNodeData.details}
            </p>
          </div>

          <Link
            href={activeNodeData.route}
            className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-coral active:scale-95 transition-all font-sans text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <span>Open {activeNodeData.name}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="mt-16 max-w-2xl mx-auto border-t border-border/50 pt-8">
        <p className="font-display italic text-lg sm:text-2xl text-on-surface/90 leading-relaxed font-normal">
          &ldquo;When your learning context follows you from freshman year to placement season, nothing is lost.&rdquo;
        </p>
        <span className="block mt-2.5 font-sans text-[10px] tracking-[0.16em] text-on-surface-variant uppercase font-semibold">
          FOUNDING PRINCIPLE, NIVORA ARCHITECTURE
        </span>
      </div>
    </section>
  );
}
