'use client';

import React, { useState, useEffect } from 'react';
import { ExerciseItem, EXERCISE_CATEGORIES, EXERCISE_LIBRARY, getExercises } from '@/lib/exerciseLibrary';
import ExerciseDetailModal from './ExerciseDetailModal';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface GymTabProps {
  plans: any[];
  activePlan: any;
  onOpenCreatePlan: () => void;
  onOpenEditPlan: (plan: any) => void;
  onStartWorkoutWithDay: (dayName: string, exercises: any[], planId?: string, planName?: string) => void;
  onRefreshData: () => void;
}

export default function GymTab({
  plans,
  activePlan,
  onOpenCreatePlan,
  onOpenEditPlan,
  onStartWorkoutWithDay,
  onRefreshData,
}: GymTabProps) {
  const [subTab, setSubTab] = useState<'schedule' | 'library' | 'history' | 'prs'>('schedule');

  // Workout History & PR state
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Exercise Library state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<ExerciseItem | null>(null);

  // Today's day of week
  const todayDayName = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Fetch workout sessions & PRs when switching to history or PR tabs
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHistory(true);
    fetch('/api/health/workouts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setWorkoutHistory(data.sessions || []);
          setPersonalRecords(data.personalRecords || []);
          setWorkoutStats(data.stats || null);
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

  const filteredExercises = getExercises({
    muscleGroup: selectedCategory,
    difficulty: selectedDifficulty,
    query: searchQuery,
  });

  const todayDayObj = activePlan?.days?.find(
    (d: any) => d.dayOfWeek.toLowerCase() === todayDayName.toLowerCase()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── SUB-NAVIGATION BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'schedule', label: 'Weekly Schedule', icon: 'calendar_month' },
            { id: 'library', label: 'Exercise Library', icon: 'menu_book' },
            { id: 'history', label: 'Workout History', icon: 'history' },
            { id: 'prs', label: 'Personal Records (PRs)', icon: 'military_tech' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                subTab === tab.id
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2">
          {activePlan && todayDayObj && !todayDayObj.isRestDay && (
            <button
              type="button"
              onClick={() =>
                onStartWorkoutWithDay(
                  todayDayObj.name || `${todayDayName} Workout`,
                  todayDayObj.exercises || [],
                  activePlan.id,
                  activePlan.name
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Start Today ({todayDayName.slice(0, 3)})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCreatePlan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">add</span>
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: WEEKLY WORKOUT SCHEDULE ── */}
      {subTab === 'schedule' && (
        <div className="space-y-6">
          {activePlan ? (
            <>
              {/* Active Plan Meta Card */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono text-[10px] font-bold uppercase">
                      Active Split
                    </span>
                    <span className="text-on-surface-variant text-xs font-mono">•</span>
                    <span className="text-secondary text-xs font-semibold">{activePlan.goal}</span>
                  </div>
                  <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-1">
                    {activePlan.name}
                  </h3>
                  {activePlan.description && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{activePlan.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEditPlan(activePlan)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Customize Schedule</span>
                  </button>
                </div>
              </div>

              {/* 7-Day Schedule Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                {DAYS_OF_WEEK.map((dayName) => {
                  const day = activePlan.days?.find(
                    (d: any) => d.dayOfWeek.toLowerCase() === dayName.toLowerCase()
                  );
                  const isToday = dayName.toLowerCase() === todayDayName.toLowerCase();
                  const isRest = day?.isRestDay || !day;

                  return (
                    <div
                      key={dayName}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                        isToday
                          ? 'bg-surface-container-high border-primary/50 shadow-md ring-1 ring-primary/30'
                          : isRest
                          ? 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-80'
                          : 'bg-surface-container-low border-outline-variant/30'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Day Header */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20">
                          <span
                            className={`font-headline-sm text-xs font-bold ${
                              isToday ? 'text-primary' : 'text-on-surface'
                            }`}
                          >
                            {dayName.slice(0, 3)}
                          </span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary font-mono text-[9px] font-bold uppercase">
                              Today
                            </span>
                          )}
                        </div>

                        {/* Title & Muscle Groups */}
                        <div>
                          <div className="font-headline-sm text-xs font-bold text-on-surface line-clamp-1">
                            {isRest ? 'Rest & Recovery' : day?.name || 'Workout'}
                          </div>
                          {!isRest && day?.muscleGroups && day.muscleGroups.length > 0 && (
                            <div className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">
                              {day.muscleGroups.join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Exercises Preview */}
                        {!isRest && day?.exercises && day.exercises.length > 0 ? (
                          <div className="space-y-1 pt-1">
                            {day.exercises.slice(0, 3).map((ex: any, idx: number) => (
                              <div
                                key={idx}
                                className="text-[11px] text-on-surface-variant flex items-center justify-between truncate"
                              >
                                <span className="truncate">{ex.exerciseName}</span>
                                <span className="font-mono text-[9px] text-on-surface-variant/60 ml-1 shrink-0">
                                  {ex.targetSets}×{ex.targetReps}
                                </span>
                              </div>
                            ))}
                            {day.exercises.length > 3 && (
                              <div className="text-[10px] text-primary font-medium">
                                +{day.exercises.length - 3} more
                              </div>
                            )}
                          </div>
                        ) : isRest ? (
                          <div className="py-4 text-center text-[11px] text-on-surface-variant">
                            Active Rest
                          </div>
                        ) : (
                          <div className="py-4 text-center text-[11px] text-on-surface-variant">
                            No exercises planned
                          </div>
                        )}
                      </div>

                      {/* Day Action */}
                      <div className="pt-2 mt-2 border-t border-outline-variant/20">
                        {!isRest ? (
                          <button
                            type="button"
                            onClick={() =>
                              onStartWorkoutWithDay(
                                day.name,
                                day.exercises || [],
                                activePlan.id,
                                activePlan.name
                              )
                            }
                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                              isToday
                                ? 'bg-primary text-on-primary hover:bg-primary-fixed shadow-xs'
                                : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                            <span>Start</span>
                          </button>
                        ) : (
                          <div className="text-center text-[10px] text-on-surface-variant py-1">
                            Rest Day
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* EMPTY STATE: NO WORKOUT PLAN */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-surface-container-low border border-dashed border-outline-variant/40 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[32px]">fitness_center</span>
              </div>
              <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                No workout plan yet
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                Set up your personalized weekly training schedule. Choose your workout days, exercises, sets, reps, and target weights.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenCreatePlan}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold shadow-md"
                >
                  Create Workout Plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: EXERCISE LIBRARY ── */}
      {subTab === 'library' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises by name, muscle, or equipment..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                <span className="text-[11px] font-label-tag uppercase text-on-surface-variant font-semibold">
                  Difficulty:
                </span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Muscle Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {['All', ...EXERCISE_CATEGORIES].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setActiveExerciseDetail(ex)}
                className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant mb-1 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-semibold uppercase">
                      {ex.muscleGroup}
                    </span>
                    <span>{ex.difficulty}</span>
                  </div>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    {ex.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                    {ex.instructions[0]}
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant font-mono">
                  <span>
                    {ex.defaultSets} Sets • {ex.defaultReps}
                  </span>
                  <span className="text-primary font-semibold group-hover:underline text-[11px]">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant text-xs">
              No exercises match your search query.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: WORKOUT HISTORY ── */}
      {subTab === 'history' && (
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="p-8 text-center text-xs text-on-surface-variant font-mono">
              Loading workout history...
            </div>
          ) : workoutHistory.length > 0 ? (
            <div className="space-y-3">
              {workoutHistory.map((session) => {
                const dateStr = new Date(session.startedAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                return (
                  <div
                    key={session.id}
                    className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all space-y-3 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                            Completed
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono">{dateStr}</span>
                        </div>
                        <h4 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                          {session.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant">
                        <div>
                          Duration: <strong className="text-on-surface">{session.durationMinutes} min</strong>
                        </div>
                        <div>
                          Total Volume: <strong className="text-primary">{session.totalVolumeKg} kg</strong>
                        </div>
                        <div>
                          Sets: <strong className="text-on-surface">{session.totalSets}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Exercises Summary Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {session.exercises?.map((ex: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/20 text-xs text-on-surface flex items-center gap-1.5"
                        >
                          <span className="font-semibold">{ex.exerciseName}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            ({ex.sets?.length || 0} sets)
                          </span>
                        </div>
                      ))}
                    </div>

                    {session.notes && (
                      <p className="text-xs text-on-surface-variant italic">
                        &ldquo;{session.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE: NO WORKOUT SESSIONS LOGGED */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-surface-container-low border border-dashed border-outline-variant/40 space-y-3">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                history
              </span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                No Workout History Yet
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Completed workouts will appear here with your duration, exercises, sets, and total volume.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: PERSONAL RECORDS (PRs) ── */}
      {subTab === 'prs' && (
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="p-8 text-center text-xs text-on-surface-variant font-mono">
              Loading personal records...
            </div>
          ) : personalRecords.length > 0 ? (
            <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">
                    Verified Personal Records
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Calculated automatically from your highest logged weight on each exercise.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary font-mono text-xs font-bold">
                  {personalRecords.length} PRs Logged
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {personalRecords.map((pr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-headline-sm text-xs font-bold text-on-surface">
                        {pr.exerciseName}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        {pr.date} • {pr.repsAtMax} reps
                      </div>
                    </div>
                    <div className="font-headline-lg text-headline-sm font-bold text-primary font-mono">
                      {pr.maxWeightKg} <span className="text-xs font-normal text-on-surface-variant">kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* EMPTY STATE: NO PRS YET */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-surface-container-low border border-dashed border-outline-variant/40 space-y-3">
              <span className="material-symbols-outlined text-[32px] text-primary">
                military_tech
              </span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                No Personal Records Yet
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Log weights during your workout sessions to automatically calculate and celebrate your personal records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={activeExerciseDetail}
        onClose={() => setActiveExerciseDetail(null)}
      />
    </div>
  );
}
