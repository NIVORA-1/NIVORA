'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function RebootPage() {
  const {
    reelsToday,
    setReelsToday,
    doomscrollMins,
    setDoomscrollMins,
    focusScore,
    setFocusScore,
    isResetTimerActive,
    resetTimerSeconds,
    startResetSession,
    stopResetSession,
  } = useApp();

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const simulateImpulse = () => {
    setReelsToday((prev) => prev + 1);
    setDoomscrollMins((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-xl pb-space-4xl animate-in fade-in duration-200">
      {/* Top Editorial Header & Command Ribbon */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pt-space-xs">
        <div className="flex flex-col space-y-space-2xs max-w-2xl">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high font-label-tag text-label-tag uppercase tracking-widest text-primary">
              Telemetry • Cycle 14
            </span>
            <span className="text-outline-variant font-label-tag text-label-tag">/</span>
            <span className="font-label-tag text-label-tag uppercase tracking-widest text-on-surface-variant">
              Cognitive Protocol
            </span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-semibold">
            Reboot
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Break the habit. Reclaim your focus and cognitive bandwidth through disciplined screen telemetry.
          </p>
        </div>

        {/* Live Intervention Banner & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-md p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm">
          <div className="flex items-start gap-space-xs">
            <div className="w-2.5 h-2.5 mt-1 rounded-full bg-tertiary shadow-[0_0_8px_rgba(239,210,142,0.4)] animate-pulse" />
            <div className="flex flex-col">
              <span className="font-label-mono-wide text-label-mono-wide uppercase text-tertiary">
                Today&apos;s Reset Delta
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                You are <strong className="text-on-surface font-medium">12 minutes above</strong> your digital balance limit.
              </span>
            </div>
          </div>

          {isResetTimerActive ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-mono text-sm font-bold">
                {formatTimer(resetTimerSeconds)}
              </div>
              <button
                onClick={stopResetSession}
                className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-button-text text-xs"
              >
                End Session
              </button>
            </div>
          ) : (
            <button
              onClick={() => startResetSession(25)}
              className="flex items-center justify-center gap-space-2xs px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary transition-all duration-200 font-button-text text-button-text shadow-sm hover:shadow-md cursor-pointer shrink-0 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">timelapse</span>
              <span>Start 25m Reset</span>
            </button>
          )}
        </div>
      </section>

      {/* Active Focus Session Banner if timer running */}
      {isResetTimerActive && (
        <div className="p-space-lg rounded-2xl bg-secondary-container/40 border border-primary/40 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px] animate-spin">
                self_improvement
              </span>
              <h3 className="font-headline-sm text-on-surface font-semibold">
                Guarded Deep Work / Reset In Progress
              </h3>
            </div>
            <span className="font-mono text-xl text-primary font-bold">
              {formatTimer(resetTimerSeconds)}
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            40Hz Gamma Focus frequency stream engaged. Distracting app notifications are held in quarantine buffer.
          </p>
        </div>
      )}

      {/* Section 1: KPI Telemetry Bento (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* KPI 1: Reels / Shorts Count */}
        <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container transition-colors shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-mono-wide text-label-mono-wide uppercase tracking-wider">
              Short-Form Load
            </span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">motion_photos_off</span>
          </div>
          <div className="my-space-md flex items-baseline gap-2">
            <span className="font-headline-lg text-display-hero text-on-surface tracking-tight font-bold">
              {reelsToday}
            </span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant">
              reels today
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-label-tag text-label-tag text-on-surface-variant">
              <span>Threshold 30 / day</span>
              <span className="text-tertiary">+{reelsToday - 30} over run</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (reelsToday / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Doomscroll Duration */}
        <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container transition-colors shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-mono-wide text-label-mono-wide uppercase tracking-wider">
              Passive Drift
            </span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">hourglass_bottom</span>
          </div>
          <div className="my-space-md flex items-baseline gap-2">
            <span className="font-headline-lg text-display-hero text-on-surface tracking-tight font-bold">
              {doomscrollMins}
            </span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant">
              min doomscroll
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-label-tag text-label-tag text-on-surface-variant">
              <span>Cap: 30m</span>
              <span className="text-tertiary font-medium">+{doomscrollMins - 30}m overflow</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (doomscrollMins / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Daily Focus Score */}
        <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container transition-colors shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-mono-wide text-label-mono-wide uppercase tracking-wider">
              Cognitive Index
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
          </div>
          <div className="my-space-md flex items-baseline gap-2">
            <span className="font-headline-lg text-display-hero text-primary tracking-tight font-bold">
              {focusScore}
            </span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant">
              / 100
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-label-tag text-label-tag text-on-surface-variant">
              <span>7-Day Base: 76</span>
              <span className="text-primary font-medium">Optimal Band</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${focusScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Deep Work Logged */}
        <div className="relative overflow-hidden p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container transition-colors shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-mono-wide text-label-mono-wide uppercase tracking-wider">
              Guarded Deep Work
            </span>
            <span className="material-symbols-outlined text-[20px] text-secondary">timer</span>
          </div>
          <div className="my-space-md flex items-baseline gap-2">
            <span className="font-headline-lg text-display-hero text-on-surface tracking-tight font-bold">
              3.8
            </span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant">
              hours logged
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-label-tag text-label-tag text-on-surface-variant">
              <span>Target: 4.0h</span>
              <span className="text-secondary font-medium">95% of goal</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '95%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Distraction Vectors & Active Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: Distraction Vectors (7 Cols) */}
        <div className="lg:col-span-7 space-y-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Distraction Vectors &amp; Drift Sources
            </h2>
            <button
              onClick={simulateImpulse}
              className="text-xs text-primary font-button-text hover:underline"
            >
              + Log Sample Impulse
            </button>
          </div>

          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-sm">
            {[
              { app: 'Instagram Reels (Endless Loop)', time: '24m 12s', share: 62, count: 29 },
              { app: 'YouTube Shorts (Passive Autoplay)', time: '10m 18s', share: 26, count: 12 },
              { app: 'Reddit Feed & Thread Scrape', time: '3m 30s', share: 12, count: 6 },
            ].map((vec, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-medium text-on-surface">{vec.app}</span>
                  <span className="font-label-mono-wide text-xs text-on-surface-variant">
                    {vec.time} ({vec.count} reels)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full bg-tertiary rounded-full"
                    style={{ width: `${vec.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Today's Diverted Impulses Log */}
          <div className="space-y-space-xs">
            <h3 className="font-headline-sm text-body-md text-on-surface font-semibold">
              Today&apos;s Diverted Impulses &amp; Interventions
            </h3>
            <div className="space-y-2">
              {[
                { time: '14:22', notice: 'Diverted Instagram launch attempt during CS-301 study block.' },
                { time: '11:15', notice: 'Intercepted 12m scroll impulse; redirected to 5m eye rest.' },
                { time: '09:05', notice: 'Replaced morning doomscroll with 15m Algorithm review.' },
              ].map((imp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">shield</span>
                    <span className="text-on-surface">{imp.notice}</span>
                  </div>
                  <span className="font-label-mono-wide text-on-surface-variant">{imp.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Interventions & Guardrails (5 Cols) */}
        <div className="lg:col-span-5 space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Active Guardrails
          </h2>

          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[22px]">lock_clock</span>
              <div>
                <h4 className="font-headline-sm text-body-md text-on-surface font-semibold">
                  Strict Study Block Lockdown
                </h4>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Automatically limits browser feed elements during scheduled deep work sessions in Planner.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-[22px]">notification_important</span>
              <div>
                <h4 className="font-headline-sm text-body-md text-on-surface font-semibold">
                  30-Minute Soft Intervention
                </h4>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Surfaces the top banner on the Home Command Center once short-form video watch time exceeds 30 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[22px]">spatial_audio</span>
              <div>
                <h4 className="font-headline-sm text-body-md text-on-surface font-semibold">
                  Binaural Reset Flow
                </h4>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Launches 40Hz Gamma wave audio immediately when clicking &ldquo;Take Control&rdquo;.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
