'use client';

import React, { useState, useEffect } from 'react';
import { HealthTab } from './HealthHeader';

interface ProgressTabProps {
  onNavigateTab: (tab: HealthTab) => void;
}

export default function ProgressTab({ onNavigateTab }: ProgressTabProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/health/progress')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (isMounted && result) {
          setData(result);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-surface-container" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  // Check if user has sufficient data
  const hasEnoughData = data?.hasEnoughData;

  if (!hasEnoughData) {
    return (
      <div className="p-8 sm:p-16 text-center rounded-3xl bg-surface-container-low border border-dashed border-outline-variant/40 space-y-4 max-w-xl mx-auto my-8 animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
          <span className="material-symbols-outlined text-[36px]">query_stats</span>
        </div>
        <h3 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
          Not enough data yet
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Nivora calculates progress strictly from your real logged sessions and logs. Complete a workout, record water intake, or log sleep to unlock personalized health trends.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateTab('gym')}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed transition-colors shadow-xs"
          >
            Start First Workout
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('water')}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors"
          >
            Log Water
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('sleep')}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors"
          >
            Log Sleep
          </button>
        </div>
      </div>
    );
  }

  const workouts = data?.workouts;
  const personalRecords = data?.personalRecords || [];
  const water = data?.water;
  const sleep = data?.sleep;
  const goals = data?.goals;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP KPI BENCHMARKS (4 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Workout Consistency */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-sm">
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
            Workout Consistency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-primary font-mono">
              {workouts?.consistencyPercent || 0}%
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              ({workouts?.countThisWeek || 0} / {workouts?.goalThisWeek || 4} wks)
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${workouts?.consistencyPercent || 0}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Water Consistency */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-sm">
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
            Hydration Goal Met
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">
              {water?.consistencyPercent || 0}%
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              ({water?.daysGoalMet || 0} / 7 days)
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-300"
              style={{ width: `${water?.consistencyPercent || 0}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Sleep Average */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-sm">
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
            Average Sleep
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-primary font-mono">
              {sleep?.averageHours ? `${sleep.averageHours}h` : '—'}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              Quality: {sleep?.averageQuality || 0}/5
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant font-mono">
            {sleep?.totalLogs || 0} cycles logged
          </p>
        </div>

        {/* KPI 4: Goal Completion */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-sm">
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
            Goal Completion
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">
              {goals?.completionRate || 0}%
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              ({goals?.completed || 0} of {goals?.total || 0})
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${goals?.completionRate || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN DETAILED TRENDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Water & Sleep Data Trends (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Water 7-Day Trend */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                Hydration Trend (Past 7 Days)
              </h4>
              <span className="text-xs text-on-surface-variant font-mono">
                {water?.daysTracked || 0} days recorded
              </span>
            </div>

            {water?.trend && water.trend.length > 0 ? (
              <div className="grid grid-cols-7 gap-2 pt-2">
                {water.trend.map((day: any, idx: number) => {
                  const label = new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                  });
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 text-center">
                      <div className="w-full h-24 bg-surface-container rounded-xl flex items-end p-1 border border-outline-variant/20">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            day.amountMl >= day.goalMl ? 'bg-secondary' : 'bg-primary'
                          }`}
                          style={{ height: `${day.percentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-on-surface-variant font-bold">
                        {label}
                      </span>
                      <span className="font-mono text-[9px] text-on-surface-variant/80">
                        {(day.amountMl / 1000).toFixed(1)}L
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">Not enough data yet.</p>
            )}
          </div>

          {/* Sleep Trend */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                Recent Sleep Recovery Cycles
              </h4>
              <span className="text-xs text-on-surface-variant font-mono">
                Avg: {sleep?.averageHours || 0}h
              </span>
            </div>

            {sleep?.trend && sleep.trend.length > 0 ? (
              <div className="space-y-2">
                {sleep.trend.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-on-surface font-semibold">{item.date}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <strong className="text-primary font-bold">{item.hours} hrs</strong>
                      <span className="text-on-surface-variant">Quality: {item.quality}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">Not enough sleep data yet.</p>
            )}
          </div>
        </div>

        {/* Right: Personal Records & Recent Workouts (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Verified PRs Table */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                Personal Records (PRs)
              </h4>
              <span className="text-xs text-primary font-mono font-bold">
                {personalRecords.length} PRs
              </span>
            </div>

            {personalRecords.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {personalRecords.map((pr: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-headline-sm text-xs font-bold text-on-surface">
                        {pr.exerciseName}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        {pr.date} • {pr.repsAtMax} reps
                      </div>
                    </div>
                    <div className="font-headline-lg text-sm font-bold text-primary font-mono">
                      {pr.maxWeightKg} kg
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-on-surface-variant">
                No personal records logged yet.
              </div>
            )}
          </div>

          {/* Recent Workouts Logged */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                Recent Completed Workouts
              </h4>
              <span className="text-xs text-on-surface-variant font-mono">
                {workouts?.totalCompleted || 0} Total
              </span>
            </div>

            {workouts?.recentSessions && workouts.recentSessions.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {workouts.recentSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-headline-sm text-xs font-bold text-on-surface">
                        {session.title}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        {new Date(session.startedAt).toLocaleDateString()} • {session.durationMinutes} mins
                      </div>
                    </div>
                    <span className="font-mono text-primary font-bold">
                      {session.totalVolumeKg} kg
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-on-surface-variant">
                No workouts recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
