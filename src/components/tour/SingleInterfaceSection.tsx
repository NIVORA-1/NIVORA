'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NivoraLogo from '@/components/ui/NivoraLogo';

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
    <section id="architecture" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center">
      {/* Header Label */}
      <div data-orbit-heading className="space-y-3 mb-14">
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold">
          THE SINGLE INTERFACE
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-normal tracking-tight text-on-surface leading-[1.1]">
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
      <div className="relative max-w-3xl mx-auto py-8">
        {/* Subtle circular grid orbit tracks */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            data-orbit-ring
            className="w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full border border-border/40"
          />
          <div
            data-orbit-ring
            className="absolute w-[200px] sm:w-[280px] h-[200px] sm:h-[280px] rounded-full border border-dashed border-border/30"
          />
        </div>

        {/* Center NIVORA Monogram Hub */}
        <div
          data-orbit-center
          className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-surface-container border-2 border-border shadow-[0_0_35px_rgba(232,90,79,0.12)] flex flex-col items-center justify-center mx-auto my-8"
        >
          <NivoraLogo size="medium" priority />
          <span className="text-[9px] font-sans tracking-widest text-primary mt-1 font-bold uppercase">
            CORE HUB
          </span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-coral" />
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
                className={`text-left p-3.5 rounded-xl border transition-colors duration-200 cursor-pointer w-full ${
                  isSelected
                    ? 'bg-secondary-container border-primary shadow-[0_0_20px_rgba(232,90,79,0.15)]'
                    : 'bg-surface-container/90 border-border hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isSelected ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {node.icon}
                    </span>
                    <span className="font-sans text-xs sm:text-sm font-bold tracking-wide text-on-surface">
                      {node.name}
                    </span>
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-primary' : 'bg-border'
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
        <div data-orbit-inspector className="mt-8 max-w-2xl mx-auto rounded-xl bg-surface-container border border-border p-5 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] tracking-wider text-primary uppercase font-bold">
                ACTIVE DOMAIN: {activeNodeData.name}
              </span>
              <span className="font-sans text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-border font-semibold">
                {activeNodeData.stat}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans leading-relaxed font-normal">
              {activeNodeData.details}
            </p>
          </div>

          <Link
            href={activeNodeData.route}
            className="shrink-0 px-4 py-2 rounded-lg bg-primary text-white hover:bg-coral transition-colors font-sans text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>Open {activeNodeData.name}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="mt-14 max-w-2xl mx-auto">
        <p className="font-display italic text-lg sm:text-2xl text-on-surface/90 leading-relaxed font-normal">
          &ldquo;When your learning context follows you from freshman year to placement season, nothing is lost.&rdquo;
        </p>
        <span className="block mt-2 font-sans text-[10px] tracking-[0.16em] text-on-surface-variant uppercase font-semibold">
          FOUNDING PRINCIPLE, NIVORA ARCHITECTURE
        </span>
      </div>
    </section>
  );
}
