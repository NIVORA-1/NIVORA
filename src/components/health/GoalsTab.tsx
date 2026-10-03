'use client';

import React, { useState } from 'react';

interface GoalsTabProps {
  goalsData: any;
  onCreateGoal: (goalData: any) => Promise<void>;
  onUpdateGoalProgress: (id: string, currentProgress: number, isCompleted?: boolean) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const TEMPLATE_GOALS = [
  { title: 'Workout 4 times/week', target: 4, unit: 'sessions', frequency: 'weekly', category: 'fitness' },
  { title: 'Drink 2.5L water/day', target: 2500, unit: 'ml', frequency: 'daily', category: 'hydration' },
  { title: 'Sleep 7+ hours/night', target: 7, unit: 'hours', frequency: 'daily', category: 'sleep' },
  { title: 'Walk 8,000 steps/day', target: 8000, unit: 'steps', frequency: 'daily', category: 'activity' },
  { title: 'Complete 3 cardio sessions/week', target: 3, unit: 'sessions', frequency: 'weekly', category: 'fitness' },
];

export default function GoalsTab({
  goalsData,
  onCreateGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
  onRefresh,
}: GoalsTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('times/week');
  const [frequency, setFrequency] = useState('weekly');
  const [category, setCategory] = useState('fitness');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goals = goalsData?.goals || [];
  const activeGoals = goals.filter((g: any) => !g.isCompleted);
  const completedGoals = goals.filter((g: any) => g.isCompleted);

  const applyTemplate = (t: typeof TEMPLATE_GOALS[0]) => {
    setTitle(t.title);
    setTarget(String(t.target));
    setUnit(t.unit);
    setFrequency(t.frequency);
    setCategory(t.category);
    setIsCreating(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target) return;

    setIsSubmitting(true);
    try {
      await onCreateGoal({
        title: title.trim(),
        target: parseFloat(target),
        unit: unit.trim(),
        frequency,
        category,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      setIsCreating(false);
      setTitle('');
      setTarget('');
      setEndDate('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP HEADER / ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-primary font-semibold">
            Personal Wellness Cadence
          </span>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface">
            Health &amp; Fitness Goals
          </h3>
          <p className="text-xs text-on-surface-variant">
            Set custom milestones for training, hydration, sleep, and daily physical activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create New Goal</span>
        </button>
      </div>

      {/* ── QUICK STARTER TEMPLATES (if few active goals) ── */}
      {activeGoals.length < 3 && (
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
          <span className="text-[11px] font-label-tag uppercase text-on-surface-variant font-semibold">
            Suggested Student Wellness Goals
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TEMPLATE_GOALS.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-xs text-on-surface shrink-0 flex items-center gap-1.5 transition-colors group"
              >
                <span>{tpl.title}</span>
                <span className="material-symbols-outlined text-[14px] text-primary opacity-60 group-hover:opacity-100">
                  add
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIVE GOALS GRID ── */}
      <div className="space-y-4">
        <h4 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-2">
          <span>Active Goals</span>
          <span className="px-2 py-0.2 rounded-full bg-surface-container text-primary font-mono text-[10px]">
            {activeGoals.length}
          </span>
        </h4>

        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal: any) => {
              const pct = Math.min(100, Math.round((goal.currentProgress / goal.target) * 100));
              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-tag text-[9px] uppercase font-bold">
                        {goal.frequency} • {goal.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                        title="Delete goal"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    <h4 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                      {goal.title}
                    </h4>

                    {/* Progress Bar & Numbers */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className="font-bold text-primary">
                          {goal.currentProgress} / {goal.target} {goal.unit}
                        </span>
                        <span className="font-bold text-on-surface">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Increment / Quick Update Controls */}
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateGoalProgress(goal.id, Math.max(0, goal.currentProgress - 1))
                        }
                        className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-bold flex items-center justify-center"
                        title="-1"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateGoalProgress(goal.id, goal.currentProgress + 1)
                        }
                        className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-bold flex items-center justify-center"
                        title="+1"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpdateGoalProgress(goal.id, goal.target, true)}
                      className="px-3 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-bold hover:bg-secondary-fixed transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      <span>Mark Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE: NO GOALS */
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-surface-container-low border border-dashed border-outline-variant/40 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[28px]">flag</span>
            </div>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              No Goals Yet
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Create your first wellness goal above or choose a suggested template to track your progress.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold shadow-sm"
              >
                Create Goal Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── COMPLETED GOALS ARCHIVE ── */}
      {completedGoals.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-outline-variant/20">
          <h4 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-2">
            <span>Completed Goals</span>
            <span className="px-2 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px]">
              {completedGoals.length}
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedGoals.map((g: any) => (
              <div
                key={g.id}
                className="p-3.5 rounded-2xl bg-surface-container/50 border border-outline-variant/20 flex items-center justify-between opacity-80"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      check_circle
                    </span>
                    <span className="font-headline-sm text-xs font-bold text-on-surface line-through">
                      {g.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {g.target} {g.unit} • {g.frequency}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteGoal(g.id)}
                  className="p-1 rounded-md text-on-surface-variant hover:text-error"
                  title="Remove from archive"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CREATE GOAL MODAL ── */}
      {isCreating && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsCreating(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">flag</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Create Wellness Goal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Workout 4 times/week"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                    Target Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. times/week, ml, hours"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface"
                  >
                    <option value="weekly">Weekly Target</option>
                    <option value="daily">Daily Target</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface"
                  >
                    <option value="fitness">Fitness / Gym</option>
                    <option value="hydration">Hydration</option>
                    <option value="sleep">Sleep &amp; Rest</option>
                    <option value="activity">Daily Activity</option>
                    <option value="nutrition">Nutrition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Target End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
