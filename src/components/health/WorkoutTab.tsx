'use client';

import React, { useState, useEffect } from 'react';

interface WorkoutTabProps {
  plans: any[];
  activePlan: any;
  onStartWorkout: () => void;
  onStartWorkoutWithDay: (dayName: string, exercises: any[], planId?: string, planName?: string) => void;
  onOpenCreatePlan: () => void;
  onNavigateTab: (tab: any) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutTab({
  plans,
  activePlan,
  onStartWorkout,
  onStartWorkoutWithDay,
  onOpenCreatePlan,
  onNavigateTab,
}: WorkoutTabProps) {
  // Today's day name
  const todayDayName = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Workout History state
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Standalone Rest Timer state
  const [restPreset, setRestPreset] = useState<number>(60);
  const [restSeconds, setRestSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, restSeconds]);

  // Fetch past workouts
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHistory(true);
    fetch('/api/health/workouts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setHistory(data.sessions || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectPreset = (seconds: number) => {
    setRestPreset(seconds);
    setRestSeconds(seconds);
    setIsTimerRunning(false);
  };

  const handleToggleTimer = () => {
    if (restSeconds === 0) {
      setRestSeconds(restPreset);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setRestSeconds(restPreset);
  };

  // Find today's workout in active plan
  const todayDay = activePlan?.days?.find(
    (d: any) => d.dayOfWeek.toLowerCase() === todayDayName.toLowerCase()
  );

  const formatRestTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP SECTION: TODAY'S WORKOUT & REST TIMER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Workout / Plan Status */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider">
                <span>{todayDayName}</span>
                <span>•</span>
                <span>Today&apos;s Workout</span>
              </div>
              <h2 className="font-headline-lg text-headline-md sm:text-headline-lg text-on-surface font-bold tracking-tight mt-0.5">
                {todayDay
                  ? todayDay.isRestDay
                    ? 'Scheduled Rest Day'
                    : todayDay.name || 'Scheduled Workout'
                  : activePlan
                  ? 'Open Workout Day'
                  : 'No workout plan yet'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (todayDay && !todayDay.isRestDay) {
                    onStartWorkoutWithDay(
                      todayDay.name,
                      todayDay.exercises || [],
                      activePlan?.id,
                      activePlan?.name
                    );
                  } else {
                    onStartWorkout();
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text font-bold text-xs hover:bg-primary-fixed transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Start Workout</span>
              </button>
            </div>
          </div>

          {/* Today's Exercises or Empty State */}
          {todayDay && !todayDay.isRestDay && todayDay.exercises && todayDay.exercises.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                <span>Planned Exercises ({todayDay.exercises.length})</span>
                <span className="font-mono text-primary">~{todayDay.estimatedDuration || 45} mins</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todayDay.exercises.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
                        {ex.exerciseName}
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        {ex.muscleGroup || 'Full Body'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-primary">
                        {ex.targetSets || 3} sets × {ex.targetReps || 10} reps
                      </div>
                      {ex.targetWeightKg > 0 && (
                        <div className="text-[10px] font-mono text-on-surface-variant">
                          {ex.targetWeightKg} kg
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : todayDay?.isRestDay ? (
            <div className="py-6 text-center space-y-2">
              <span className="material-symbols-outlined text-[36px] text-primary">self_improvement</span>
              <p className="text-sm font-semibold text-on-surface">Scheduled Active Rest Day</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Take time to stretch, hydrate, and recover energy for upcoming sessions. You can still log an unscheduled workout below if desired.
              </p>
            </div>
          ) : !activePlan ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[28px]">fitness_center</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                  No workout plan yet
                </h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Build your custom workout schedule or launch a freestyle session now.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onOpenCreatePlan}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed transition-colors shadow-sm"
                >
                  Create Workout Plan
                </button>
                <button
                  type="button"
                  onClick={onStartWorkout}
                  className="px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors"
                >
                  Quick Start Workout
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm text-on-surface font-medium">No exercises assigned to today.</p>
              <button
                type="button"
                onClick={() => onNavigateTab('gym')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Edit Weekly Split in Gym Tab →
              </button>
            </div>
          )}

          {/* Bottom Plan Link */}
          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">
              Active Plan: <strong className="text-on-surface">{activePlan?.name || 'None'}</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('gym')}
              className="text-primary hover:underline font-semibold"
            >
              Manage Plans &amp; Library →
            </button>
          </div>
        </div>

        {/* Right Col: Standalone Rest Timer */}
        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">timer</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wider">
                  Rest Timer
                </h3>
                <p className="text-[10px] text-on-surface-variant">Between-sets recovery</p>
              </div>
            </div>
            {isTimerRunning && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold animate-pulse">
                Active
              </span>
            )}
          </div>

          {/* Timer Clock Display */}
          <div className="py-4 text-center space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-black text-primary tracking-tight">
              {formatRestTime(restSeconds)}
            </div>
            <p className="text-[11px] text-on-surface-variant">
              {restSeconds === 0 ? 'Rest complete! Ready for next set.' : `${restPreset}s interval preset`}
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[30, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleSelectPreset(sec)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  restPreset === sec && !isTimerRunning
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                isTimerRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-primary text-on-primary hover:bg-primary-fixed'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isTimerRunning ? 'pause' : 'play_arrow'}
              </span>
              <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetTimer}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-colors"
              title="Reset Timer"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: WORKOUT HISTORY ── */}
      <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">history</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                Workout History
              </h3>
              <p className="text-xs text-on-surface-variant">
                Logged sessions, volume lifted, reps, and exercises completed
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <span className="text-xs font-mono font-bold text-primary">
              {history.length} {history.length === 1 ? 'session' : 'sessions'}
            </span>
          )}
        </div>

        {/* History Table or Empty State */}
        {isLoadingHistory ? (
          <div className="py-10 text-center text-xs text-on-surface-variant font-mono">
            Loading workout history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant/40">
              <span className="material-symbols-outlined text-[28px]">fitness_center</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">No workout history yet</p>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Your completed training sessions with reps, weights, and sets will appear here once recorded.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onStartWorkout}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed transition-colors shadow-sm"
              >
                Log Your First Workout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-xs sm:text-sm font-bold text-on-surface">
                      {session.dayName || 'Workout Session'}
                    </span>
                    {session.planName && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-mono">
                        {session.planName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                    <span>{new Date(session.sessionDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    <span>•</span>
                    <span>{session.durationMinutes || 0} mins</span>
                    <span>•</span>
                    <span className="font-mono text-primary font-semibold">
                      Total Volume: {Math.round(session.totalVolumeKg || 0)} kg
                    </span>
                  </div>
                </div>

                {/* Exercises in Session */}
                {session.exercises && session.exercises.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {session.exercises.map((se: any, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high text-[11px] font-medium text-on-surface flex items-center gap-1"
                      >
                        <span>{se.exerciseName}</span>
                        <span className="text-primary font-mono text-[10px]">
                          ({se.sets?.length || 0} sets)
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
