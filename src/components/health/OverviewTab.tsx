'use client';

import React from 'react';
import { HealthTab } from './HealthHeader';
import { useApp } from '@/context/AppContext';

interface OverviewTabProps {
  data: any;
  isLoading: boolean;
  onNavigateTab: (tab: HealthTab) => void;
  onStartWorkout: () => void;
  onQuickAddWater: (amountMl: number) => void;
  onOpenWaterModal: () => void;
  onOpenSleepModal: () => void;
  onOpenMealModal: () => void;
  onOpenGoalModal: () => void;
  onOpenCheckIn: () => void;
}

export default function OverviewTab({
  data,
  isLoading,
  onNavigateTab,
  onStartWorkout,
  onQuickAddWater,
  onOpenWaterModal,
  onOpenSleepModal,
  onOpenMealModal,
  onOpenGoalModal,
  onOpenCheckIn,
}: OverviewTabProps) {
  const { openAiWithContext } = useApp();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-surface-container" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  const workout = data?.workout;
  const water = data?.water;
  const sleep = data?.sleep;
  const nutrition = data?.nutrition;
  const goals = data?.goals;
  const checkIn = data?.checkIn;
  const profile = data?.profile;

  const waterCurrentLiters = (water?.currentMl ? water.currentMl / 1000 : 0).toFixed(1);
  const waterGoalLiters = (water?.goalMl ? water.goalMl / 1000 : 2.5).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP HERO BANNER: TODAY'S WELLNESS OVERVIEW & DATE ── */}
      <div className="relative overflow-clip p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider">
            <span>{data?.today?.dayOfWeek || 'Today'}</span>
            <span>•</span>
            <span>{data?.today?.date || new Date().toISOString().split('T')[0]}</span>
            <span>•</span>
            <span className="text-secondary font-medium">Goal: {profile?.fitnessGoal || 'General Vitality'}</span>
          </div>
          <h2 className="font-headline-lg text-headline-md sm:text-headline-lg text-on-surface font-bold tracking-tight">
            Today&apos;s Health Overview
          </h2>
          <p className="text-body-sm text-on-surface-variant max-w-xl">
            {checkIn
              ? `Check-in recorded with Energy Level ${checkIn.energyLevel}/5 ${checkIn.mood ? `• Mood: ${checkIn.mood}` : ''}. Keep hydrated and stay consistent!`
              : 'Take a moment to record your morning status or jump directly into your daily routine.'}
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onStartWorkout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-button-text hover:bg-primary-fixed transition-all shadow-md font-semibold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            <span>Start Workout</span>
          </button>

          <button
            type="button"
            onClick={() => onQuickAddWater(250)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors font-button-text text-xs"
            title="Quick Log +250 ml Water"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">water_drop</span>
            <span>+250 ml</span>
          </button>

          <button
            type="button"
            onClick={() =>
              openAiWithContext({
                subject: 'Health & Wellness',
                topic: 'Student Workout & Recovery Routine',
              })
            }
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors font-button-text text-xs"
            title="Ask Nivora AI about fitness or nutrition"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">smart_toy</span>
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* ── CORE 5 HEALTH MANAGER HOME CARDS (Real Stored Data) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: WORKOUT */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px]">fitness_center</span>
              </div>
              <div>
                <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
                  Workout / Gym
                </span>
                <h3 className="font-headline-sm text-body-lg text-on-surface font-bold leading-tight">
                  {workout?.isCompletedToday
                    ? 'Workout Finished'
                    : workout?.todayDay?.isRestDay
                    ? 'Scheduled Rest Day'
                    : workout?.todayDay?.name || 'No workout planned'}
                </h3>
              </div>
            </div>
            {workout?.isCompletedToday && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-[10px] font-bold">
                Done
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {workout?.todayDay?.exercises && workout.todayDay.exercises.length > 0 ? (
              <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">format_list_bulleted</span>
                <span>
                  {workout.todayDay.exercises.length} exercises • ~{workout.todayDay.estimatedDuration || 45} mins
                </span>
              </div>
            ) : workout?.todayDay?.isRestDay ? (
              <p className="text-xs text-on-surface-variant">Focus on active recovery, mobility, and hydration.</p>
            ) : (
              <p className="text-xs text-on-surface-variant">
                {workout?.activePlan ? 'Customize or start a session for today.' : 'Set up your weekly schedule.'}
              </p>
            )}

            <div className="pt-1 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>This Week: {workout?.workoutsThisWeek || 0} of {workout?.weeklyGoal || 4} done</span>
              <span className="font-mono text-primary font-semibold">
                {Math.round(((workout?.workoutsThisWeek || 0) / (workout?.weeklyGoal || 4)) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, ((workout?.workoutsThisWeek || 0) / (workout?.weeklyGoal || 4)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onStartWorkout}
              className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-colors font-semibold text-center"
            >
              {workout?.isCompletedToday ? 'Log Another Workout' : 'Start Workout'}
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('gym')}
              className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs font-medium"
            >
              View Gym
            </button>
          </div>
        </div>

        {/* CARD 2: WATER INTAKE */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px]">water_drop</span>
              </div>
              <div>
                <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
                  Water Intake
                </span>
                <h3 className="font-headline-sm text-body-lg text-on-surface font-bold leading-tight">
                  {!water?.currentMl || water.currentMl === 0 ? '0 ml logged' : `${waterCurrentLiters}L / ${waterGoalLiters}L`}
                </h3>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-primary">
              {water?.percentage || 0}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${water?.percentage || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>
                {!water?.logsCount || water.logsCount === 0 ? '0 ml logged' : `${water.logsCount} logs recorded today`}
              </span>
              <span>Target: {water?.goalMl || 2500} ml</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => onQuickAddWater(250)}
              className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors"
            >
              +250 ml
            </button>
            <button
              type="button"
              onClick={() => onQuickAddWater(500)}
              className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors"
            >
              +500 ml
            </button>
            <button
              type="button"
              onClick={onOpenWaterModal}
              className="p-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-colors"
              title="Add Custom Water"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>

        {/* CARD 3: SLEEP */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px]">bedtime</span>
              </div>
              <div>
                <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
                  Sleep &amp; Recovery
                </span>
                <h3 className="font-headline-sm text-body-lg text-on-surface font-bold leading-tight">
                  {sleep?.latest ? sleep.latest.durationFormatted : 'No sleep logged'}
                </h3>
              </div>
            </div>
            {sleep?.latest && (
              <span className="flex items-center text-primary text-xs font-bold">
                {'★'.repeat(sleep.latest.quality)}
              </span>
            )}
          </div>

          <div className="space-y-1">
            {sleep?.latest ? (
              <div className="text-xs text-on-surface-variant space-y-0.5">
                <p>
                  Logged for {sleep.latest.date} • Quality: {sleep.latest.quality}/5
                </p>
                <p className="text-[11px] text-on-surface-variant/80">
                  Target: {sleep.goalHours || 8}h per night
                </p>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Log last night&apos;s bedtime and wake time to track recovery.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onOpenSleepModal}
              className="flex-1 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-button-text text-xs font-semibold text-center transition-colors"
            >
              {sleep?.latest ? 'Log New Sleep' : 'Log Sleep'}
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('sleep')}
              className="px-3 py-2 rounded-xl text-primary hover:underline text-xs font-medium"
            >
              View Sleep →
            </button>
          </div>
        </div>

        {/* CARD 4: NUTRITION */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px]">restaurant</span>
              </div>
              <div>
                <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
                  Nutrition
                </span>
                <h3 className="font-headline-sm text-body-lg text-on-surface font-bold leading-tight">
                  {nutrition?.mealsCount ? `${nutrition.mealsCount} meals logged` : 'No Meals Logged'}
                </h3>
              </div>
            </div>
            {nutrition?.calories > 0 && (
              <span className="font-mono text-xs font-bold text-primary">
                {nutrition.calories} kcal
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {nutrition?.calories > 0 ? (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-surface-container">
                  <div className="font-bold text-on-surface">{nutrition.proteinGrams || 0}g</div>
                  <div className="text-[10px] text-on-surface-variant">Protein</div>
                </div>
                <div className="p-1.5 rounded-lg bg-surface-container">
                  <div className="font-bold text-on-surface">{nutrition.carbsGrams || 0}g</div>
                  <div className="text-[10px] text-on-surface-variant">Carbs</div>
                </div>
                <div className="p-1.5 rounded-lg bg-surface-container">
                  <div className="font-bold text-on-surface">{nutrition.fatGrams || 0}g</div>
                  <div className="text-[10px] text-on-surface-variant">Fat</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Track breakfast, lunch, dinner, or study snacks to support focus.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onOpenMealModal}
              className="flex-1 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-button-text text-xs font-semibold text-center transition-colors"
            >
              + Log Meal
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('nutrition')}
              className="px-3 py-2 rounded-xl text-primary hover:underline text-xs font-medium"
            >
              View Nutrition →
            </button>
          </div>
        </div>

        {/* CARD 5: HEALTH GOALS */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px]">flag</span>
              </div>
              <div>
                <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
                  Personal Goals
                </span>
                <h3 className="font-headline-sm text-body-lg text-on-surface font-bold leading-tight">
                  {goals?.activeCount ? `${goals.activeCount} active goals` : 'No goals yet'}
                </h3>
              </div>
            </div>
            {goals?.completedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-tag text-[10px]">
                {goals.completedCount} Completed
              </span>
            )}
          </div>

          <div className="space-y-2">
            {goals?.active && goals.active.length > 0 ? (
              goals.active.slice(0, 2).map((g: any) => {
                const pct = Math.min(100, Math.round((g.currentProgress / g.target) * 100));
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface font-medium truncate max-w-[170px]">{g.title}</span>
                      <span className="font-mono text-primary font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-on-surface-variant">
                Create personal wellness goals (e.g. 4 workouts/wk, 2.5L water/day).
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onOpenGoalModal}
              className="flex-1 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-button-text text-xs font-semibold text-center transition-colors"
            >
              + Create Goal
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('goals')}
              className="px-3 py-2 rounded-xl text-primary hover:underline text-xs font-medium"
            >
              View Goals →
            </button>
          </div>
        </div>

        {/* CARD 6: QUICK DAILY CHECK-IN CALLOUT */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px]">self_improvement</span>
              </div>
              <div>
                <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
                  Daily Check-In
                </span>
                <h3 className="font-headline-sm text-body-lg text-on-surface font-bold leading-tight">
                  {checkIn ? 'Check-In Completed' : 'Pending Check-In'}
                </h3>
              </div>
            </div>
            {checkIn && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-[10px] font-bold">
                Energy: {checkIn.energyLevel}/5
              </span>
            )}
          </div>

          <p className="text-xs text-on-surface-variant">
            {checkIn?.notes
              ? `Note: “${checkIn.notes}”`
              : 'A 30-second check-in on energy, workout, hydration, and general wellness to track long-term trends.'}
          </p>

          <div className="pt-1 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onOpenCheckIn}
              className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-button-text text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                {checkIn ? 'edit' : 'add_task'}
              </span>
              <span>{checkIn ? 'Update Today\'s Check-In' : 'Submit Check-In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
