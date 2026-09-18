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
      <div data-orbit-heading className="space-y-3 mb-14 will-change-transform">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[#747F7B] uppercase font-bold">
          THE SINGLE INTERFACE
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-[-0.025em] text-[#F1F0E8] leading-[1.15]">
          Bring it{' '}
          <span className="font-serif italic text-[#8FC5A7] font-normal">
            together.
          </span>
        </h2>
        <p className="mt-2 font-mono text-xs sm:text-sm text-[#A6ADA9] tracking-wider uppercase font-medium">
          One architecture. Four years. One record.
        </p>
      </div>

      {/* Orbit Visualization Container */}
      <div className="relative max-w-3xl mx-auto py-8">
        {/* Subtle circular grid orbit tracks */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            data-orbit-ring
            className="w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full border border-[#29383D]/40 will-change-transform"
          />
          <div
            data-orbit-ring
            className="absolute w-[200px] sm:w-[280px] h-[200px] sm:h-[280px] rounded-full border border-dashed border-[#29383D]/30 will-change-transform"
          />
        </div>

        {/* Center NIVORA Monogram Hub */}
        <div
          data-orbit-center
          className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#172329] border-2 border-[#8FC5A7]/60 shadow-[0_0_35px_rgba(143,197,167,0.15)] flex flex-col items-center justify-center mx-auto my-8 will-change-transform"
        >
          <NivoraLogo size="medium" priority />
          <span className="text-[8px] font-mono tracking-widest text-[#8FC5A7] mt-1 font-semibold">
            CORE HUB
          </span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#8FC5A7] animate-ping" />
        </div>

        {/* Orbiting Satellite Node Buttons (Responsive Grid & Desktop Orbital Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto relative z-20 mt-6">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            return (
              <button
                key={node.id}
                data-orbit-node
                onClick={() => setSelectedNode(node.id)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer w-full will-change-transform ${
                  isSelected
                    ? 'bg-[#1C2A30] border-[#8FC5A7] shadow-[0_0_20px_rgba(143,197,167,0.15)]'
                    : 'bg-[#172329]/90 border-[#29383D]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isSelected ? 'text-[#8FC5A7]' : 'text-[#A6ADA9]'
                      }`}
                    >
                      {node.icon}
                    </span>
                    <span className="font-mono text-[11px] font-bold tracking-wider text-[#F1F0E8]">
                      {node.name}
                    </span>
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[#8FC5A7]' : 'bg-[#29383D]'
                    }`}
                  />
                </div>
                <div className="font-sans text-[11px] text-[#A6ADA9] truncate font-normal">
                  {node.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Node Inspector Drawer */}
        <div data-orbit-inspector className="mt-8 max-w-2xl mx-auto rounded-xl bg-[#172329] border border-[#29383D] p-5 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200 shadow-lg will-change-transform">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider text-[#8FC5A7] uppercase font-bold">
                ACTIVE DOMAIN: {activeNodeData.name}
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#1C2A30] text-[#A6ADA9] border border-[#29383D] font-semibold">
                {activeNodeData.stat}
              </span>
            </div>
            <p className="text-xs text-[#A6ADA9] font-sans leading-relaxed font-normal">
              {activeNodeData.details}
            </p>
          </div>

          <Link
            href={activeNodeData.route}
            className="shrink-0 px-4 py-2 rounded-lg bg-[#8FC5A7] text-[#0F171B] font-sans text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>Open {activeNodeData.name}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="mt-14 max-w-2xl mx-auto">
        <p className="font-serif italic text-base sm:text-lg text-[#F1F0E8]/90 leading-relaxed font-normal">
          &ldquo;When your learning context follows you from freshman year to placement season, nothing is lost.&rdquo;
        </p>
        <span className="block mt-2 font-mono text-[10px] tracking-[0.2em] text-[#747F7B] uppercase font-medium">
          FOUNDING PRINCIPLE, NIVORA ARCHITECTURE
        </span>
      </div>
    </section>
  );
}
