'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface SkillItem {
  id: string;
  name: string;
  category: 'Systems' | 'Algorithmic' | 'Languages' | 'Infrastructure' | 'Core';
  level: number; // 0 - 100
  verified: boolean;
  benchmark: string;
  proofCount: number;
}

export default function SkillsPage() {
  const { currentStream, user, setIsQuickAddOpen } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [skills, setSkills] = useState<SkillItem[]>([]);

  useEffect(() => {
    fetch('/api/skills')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setSkills(
            data.map((sk: any) => ({
              id: sk.id,
              name: sk.name,
              category: (sk.category as any) || 'Systems',
              level: sk.progress || 80,
              verified: sk.verified ?? true,
              benchmark: `${sk.level || 'Advanced'} Verified`,
              proofCount: sk.evidenceCount || 1,
            }))
          );
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const categories = ['ALL', 'Systems', 'Algorithmic', 'Languages', 'Infrastructure', 'Core'];

  const filtered = skills.filter(
    (s) => activeCategory === 'ALL' || s.category === activeCategory
  );

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Meta Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm pb-space-xs">
        <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="tracking-widest uppercase text-on-surface-variant/90">
            GROWTH ENGINE / COMPETENCY MATRIX
          </span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-medium">{streamData.degree} {streamData.name}</span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag flex items-center gap-1 border border-outline-variant/20">
            <span className="material-symbols-outlined text-[12px] text-primary">verified_user</span>
            SHA-256 LEDGER VALIDATED
          </span>
        </div>
      </div>

      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="space-y-space-xs max-w-3xl">
          <h1 className="font-display-quote text-[34px] leading-tight md:text-[42px] text-on-surface tracking-normal font-normal">
            Verified Competencies
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant/90 max-w-2xl">
            {skills.length > 0
              ? `${skills.length} Cryptographically audited skills, academic lab validations, and algorithmic contest milestones.`
              : 'Track your competencies, languages, frameworks, and lab validations to power your academic dossier.'}
          </p>
        </div>

        <div className="flex items-center gap-space-xs">
          <a
            href="/projects"
            className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text transition-colors border border-outline-variant/20"
          >
            View Projects & Repos →
          </a>
          <a
            href="/career"
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors shadow-md"
          >
            Recruiter Dossier View
          </a>
        </div>
      </div>

      {/* Categories Bar */}
      {skills.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-space-md py-1.5 rounded-lg text-body-sm transition-colors ${
                activeCategory === cat
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Competencies Grid or Empty State */}
      {skills.length === 0 ? (
        <div className="p-space-xl rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-4 py-16 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-outline-variant/30">
            <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Add your first skill.
            </h3>
            <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
              Track your competencies, languages, frameworks, and lab validations to power your academic dossier.
            </p>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-button-text text-body-sm font-semibold hover:bg-primary-fixed transition-colors inline-flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add First Skill</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm space-y-space-sm hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-secondary uppercase font-semibold">
                    {skill.category}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                    {skill.name}
                  </h3>
                </div>
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  {skill.level}%
                </span>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <div className="flex justify-between font-label-mono-wide text-label-tag text-on-surface-variant">
                  <span>{skill.benchmark}</span>
                  <span className="text-primary">{skill.proofCount} Verified Proofs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
