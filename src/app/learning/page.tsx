'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function LearningPage() {
  const { startResetSession } = useApp();

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-3xl pb-space-4xl animate-in fade-in duration-200">
      {/* Top Header Area */}
      <header className="relative pt-space-xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="space-y-space-xs max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
              <span className="font-label-mono-wide text-label-mono-wide uppercase font-semibold">
                Autumn Semester • 4 Active Tracks
              </span>
            </div>
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold">
              My Learning
            </h1>
            <p className="font-display-quote text-display-quote italic text-on-surface-variant font-normal">
              &ldquo;Everything you&apos;re learning, in one place.&rdquo;
            </p>
          </div>

          {/* Academic Telemetry Metric Bar */}
          <div className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-low shadow-sm flex-wrap border border-outline-variant/30">
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[20px]">
                local_fire_department
              </span>
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
                  14 Days
                </div>
                <div className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
                  Daily Study Streak
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-surface-variant hidden sm:block" />

            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
                  38 / 56
                </div>
                <div className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
                  Modules Verified
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-surface-variant hidden sm:block" />

            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-[20px]">schedule</span>
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
                  22.5h
                </div>
                <div className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
                  Paced This Week
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Visual Focal Anchor: Reference Image Ambient Card */}
      <div className="w-full rounded-2xl bg-surface-container-low p-space-lg relative overflow-hidden shadow-md border border-outline-variant/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          <div className="lg:col-span-8 space-y-space-sm z-10">
            <div className="inline-flex items-center gap-space-xs px-space-xs py-0.5 rounded bg-surface-container-highest text-primary font-label-tag text-label-tag uppercase font-semibold">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              Adaptive Neural Guidance
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Mid-Semester Synaptic Cohesion
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl leading-relaxed">
              Your mastery curve in tree structures and network latency shows exceptional algorithmic throughput. Focusing 25 minutes on AVL Tree Rotations today closes the performance deficit identified in module 04.
            </p>
            <div className="pt-space-xs flex flex-wrap items-center gap-space-md">
              <button
                onClick={() => startResetSession(25)}
                className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-button-text text-button-text hover:bg-primary-fixed transition-all flex items-center gap-space-xs shadow-sm font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Resume Active Focus Session
              </button>
              <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant font-medium">
                EST. VELOCITY: +3.2% THIS WEEK
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] aspect-square rounded-xl overflow-hidden shadow-xl bg-surface-container border border-outline-variant/30 flex flex-col justify-between p-4">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-tag text-xs uppercase tracking-widest text-primary font-bold">
                  Core Matrix
                </span>
                <span className="font-label-mono-wide text-xs text-on-surface-variant font-semibold">ID: 884-OCT</span>
              </div>
              <div className="space-y-2 text-center py-4">
                <span className="material-symbols-outlined text-primary text-[48px] animate-pulse">
                  schema
                </span>
                <p className="font-headline-sm text-sm text-on-surface font-bold">
                  Synthesizing Neural Tree Graph
                </p>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Continue Learning (Active Learning Paths) */}
      <section className="space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-tag text-label-tag text-primary uppercase tracking-widest font-bold">
              01 /
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Continue Learning
            </h2>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
              Sort By:
            </span>
            <button className="font-label-mono-wide text-label-mono-wide text-primary bg-surface-container-high px-space-xs py-0.5 rounded font-semibold border border-outline-variant/20">
              Highest Urgency
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* Track 1: DSA */}
          <div className="rounded-xl bg-surface-container-low border border-outline-variant/30 p-space-lg relative flex flex-col justify-between shadow-sm group hover:border-outline-variant transition-colors">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container font-label-tag text-label-tag text-secondary uppercase font-bold border border-outline-variant/20">
                    CS-302
                  </span>
                  <span className="font-label-tag text-label-tag text-on-surface-variant font-medium">
                    Track Alpha
                  </span>
                </div>
                <span className="font-label-mono-wide text-label-mono-wide text-primary font-bold">
                  68% COMPLETE
                </span>
              </div>

              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Data Structures &amp; Algorithms
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Topic: Trees &amp; Dynamic Programming
                </p>
              </div>

              {/* Progress Channel */}
              <div className="space-y-1 pt-space-xs">
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '68%' }} />
                </div>
                <div className="flex justify-between font-label-tag text-label-tag text-on-surface-variant font-medium">
                  <span>17 of 25 Modules</span>
                  <span>Streak: 6 days</span>
                </div>
              </div>

              {/* Next Sub-Module Context */}
              <div className="p-space-sm rounded-lg bg-surface-container-high flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    subdirectory_arrow_right
                  </span>
                  <div>
                    <div className="font-body-sm text-body-sm font-bold text-on-surface">
                      Next: AVL Tree Rotations
                    </div>
                    <div className="font-label-tag text-label-tag text-on-surface-variant font-medium">
                      Estimated runtime: 25m left
                    </div>
                  </div>
                </div>
                <Link
                  href="/subjects/CS-301?tab=quizzes"
                  className="p-1 text-primary hover:text-primary-fixed"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Track 2: DBMS */}
          <div className="rounded-xl bg-surface-container-low border border-outline-variant/30 p-space-lg relative flex flex-col justify-between shadow-sm group hover:border-outline-variant transition-colors">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container font-label-tag text-label-tag text-primary uppercase font-bold border border-outline-variant/20">
                    CS-301
                  </span>
                  <span className="font-label-tag text-label-tag text-on-surface-variant font-medium">
                    Track Beta
                  </span>
                </div>
                <span className="font-label-mono-wide text-label-mono-wide text-primary font-bold">
                  84% COMPLETE
                </span>
              </div>

              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Database Management Systems
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Topic: Normalization &amp; B+ Trees
                </p>
              </div>

              <div className="space-y-1 pt-space-xs">
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '84%' }} />
                </div>
                <div className="flex justify-between font-label-tag text-label-tag text-on-surface-variant font-medium">
                  <span>21 of 25 Modules</span>
                  <span>Streak: 14 days</span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-high flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    subdirectory_arrow_right
                  </span>
                  <div>
                    <div className="font-body-sm text-body-sm font-bold text-on-surface">
                      Next: B+ Tree Page Splitting &amp; WAL
                    </div>
                    <div className="font-label-tag text-label-tag text-on-surface-variant font-medium">
                      Estimated runtime: 35m left
                    </div>
                  </div>
                </div>
                <Link href="/subjects/CS-301" className="p-1 text-primary hover:text-primary-fixed">
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
