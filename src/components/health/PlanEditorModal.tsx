'use client';

import React, { useState } from 'react';
import { ExerciseItem, EXERCISE_LIBRARY } from '@/lib/exerciseLibrary';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface PlanDayData {
  dayOfWeek: string;
  name: string;
  muscleGroups: string[];
  isRestDay: boolean;
  estimatedDuration: number;
  exercises: {
    exerciseName: string;
    muscleGroup: string;
    targetSets: number;
    targetReps: string;
    targetWeightKg: number;
    restSeconds: number;
    notes?: string;
  }[];
}

interface PlanEditorModalProps {
  planToEdit?: any;
  onClose: () => void;
  onSavePlan: (planData: any) => Promise<void>;
}

export default function PlanEditorModal({
  planToEdit,
  onClose,
  onSavePlan,
}: PlanEditorModalProps) {
  const [name, setName] = useState(planToEdit?.name || 'My Weekly Training Split');
  const [description, setDescription] = useState(planToEdit?.description || '');
  const [goal, setGoal] = useState(planToEdit?.goal || 'Hypertrophy & Strength');
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // Initialize 7 days
  const [days, setDays] = useState<PlanDayData[]>(() => {
    if (planToEdit?.days && planToEdit.days.length > 0) {
      return DAYS_OF_WEEK.map((dow) => {
        const found = planToEdit.days.find(
          (d: any) => d.dayOfWeek.toLowerCase() === dow.toLowerCase()
        );
        if (found) {
          return {
            dayOfWeek: dow,
            name: found.name || `${dow} Focus`,
            muscleGroups: found.muscleGroups || [],
            isRestDay: !!found.isRestDay,
            estimatedDuration: found.estimatedDuration || 45,
            exercises: (found.exercises || []).map((ex: any) => ({
              exerciseName: ex.exerciseName,
              muscleGroup: ex.muscleGroup,
              targetSets: ex.targetSets || 3,
              targetReps: ex.targetReps || '8-12',
              targetWeightKg: ex.targetWeightKg || 0,
              restSeconds: ex.restSeconds || 90,
              notes: ex.notes || '',
            })),
          };
        }
        return {
          dayOfWeek: dow,
          name: dow === 'Sunday' || dow === 'Wednesday' ? 'Rest & Recovery' : `${dow} Training`,
          muscleGroups: [],
          isRestDay: dow === 'Sunday' || dow === 'Wednesday',
          estimatedDuration: 45,
          exercises: [],
        };
      });
    }

    // Default clean template if starting from scratch
    return [
      {
        dayOfWeek: 'Monday',
        name: 'Chest & Triceps Focus',
        muscleGroups: ['Chest', 'Triceps'],
        isRestDay: false,
        estimatedDuration: 50,
        exercises: [
          { exerciseName: 'Barbell Flat Bench Press', muscleGroup: 'Chest', targetSets: 4, targetReps: '8-10', targetWeightKg: 50, restSeconds: 90 },
          { exerciseName: 'Incline Dumbbell Press', muscleGroup: 'Chest', targetSets: 3, targetReps: '10-12', targetWeightKg: 18, restSeconds: 75 },
          { exerciseName: 'Cable Rope Tricep Pushdown', muscleGroup: 'Triceps', targetSets: 3, targetReps: '12-15', targetWeightKg: 20, restSeconds: 60 },
        ],
      },
      {
        dayOfWeek: 'Tuesday',
        name: 'Back & Biceps Focus',
        muscleGroups: ['Back', 'Biceps'],
        isRestDay: false,
        estimatedDuration: 50,
        exercises: [
          { exerciseName: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', targetSets: 4, targetReps: '10-12', targetWeightKg: 45, restSeconds: 75 },
          { exerciseName: 'Barbell Bent-Over Row', muscleGroup: 'Back', targetSets: 3, targetReps: '8-10', targetWeightKg: 40, restSeconds: 90 },
          { exerciseName: 'Barbell Biceps Curl', muscleGroup: 'Biceps', targetSets: 3, targetReps: '10-12', targetWeightKg: 20, restSeconds: 60 },
        ],
      },
      {
        dayOfWeek: 'Wednesday',
        name: 'Rest & Mobility',
        muscleGroups: [],
        isRestDay: true,
        estimatedDuration: 20,
        exercises: [],
      },
      {
        dayOfWeek: 'Thursday',
        name: 'Legs & Core',
        muscleGroups: ['Legs', 'Core'],
        isRestDay: false,
        estimatedDuration: 55,
        exercises: [
          { exerciseName: 'Barbell Back Squat', muscleGroup: 'Legs', targetSets: 4, targetReps: '6-8', targetWeightKg: 60, restSeconds: 120 },
          { exerciseName: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', targetSets: 3, targetReps: '8-10', targetWeightKg: 50, restSeconds: 90 },
          { exerciseName: 'Forearm Plank', muscleGroup: 'Core', targetSets: 3, targetReps: '45-60s hold', targetWeightKg: 0, restSeconds: 60 },
        ],
      },
      {
        dayOfWeek: 'Friday',
        name: 'Shoulders & Arms',
        muscleGroups: ['Shoulders', 'Biceps', 'Triceps'],
        isRestDay: false,
        estimatedDuration: 45,
        exercises: [
          { exerciseName: 'Standing Barbell Overhead Press', muscleGroup: 'Shoulders', targetSets: 4, targetReps: '6-8', targetWeightKg: 30, restSeconds: 90 },
          { exerciseName: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', targetSets: 4, targetReps: '12-15', targetWeightKg: 8, restSeconds: 60 },
          { exerciseName: 'Dumbbell Hammer Curls', muscleGroup: 'Biceps', targetSets: 3, targetReps: '12-15', targetWeightKg: 12, restSeconds: 60 },
        ],
      },
      {
        dayOfWeek: 'Saturday',
        name: 'Full Body Conditioning',
        muscleGroups: ['Full Body', 'Cardio'],
        isRestDay: false,
        estimatedDuration: 40,
        exercises: [
          { exerciseName: 'Russian Kettlebell Swing', muscleGroup: 'Full Body', targetSets: 4, targetReps: '15-20', targetWeightKg: 16, restSeconds: 60 },
          { exerciseName: 'Standard Push-Ups', muscleGroup: 'Chest', targetSets: 3, targetReps: '15-20', targetWeightKg: 0, restSeconds: 60 },
        ],
      },
      {
        dayOfWeek: 'Sunday',
        name: 'Active Rest & Recovery',
        muscleGroups: [],
        isRestDay: true,
        estimatedDuration: 20,
        exercises: [],
      },
    ];
  });

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDay = days[activeDayIdx];

  const updateCurrentDay = (field: keyof PlanDayData, value: any) => {
    setDays((prev) => {
      const next = [...prev];
      next[activeDayIdx] = {
        ...next[activeDayIdx],
        [field]: value,
      };
      return next;
    });
  };

  const removeExerciseFromDay = (exIdx: number) => {
    setDays((prev) => {
      const next = [...prev];
      next[activeDayIdx].exercises.splice(exIdx, 1);
      return next;
    });
  };

  const updateExerciseInDay = (
    exIdx: number,
    field: string,
    value: any
  ) => {
    setDays((prev) => {
      const next = [...prev];
      next[activeDayIdx].exercises[exIdx] = {
        ...next[activeDayIdx].exercises[exIdx],
        [field]: value,
      };
      return next;
    });
  };

  const handleAddExerciseFromLibrary = (item: ExerciseItem) => {
    setDays((prev) => {
      const next = [...prev];
      next[activeDayIdx].exercises.push({
        exerciseName: item.name,
        muscleGroup: item.muscleGroup,
        targetSets: item.defaultSets,
        targetReps: item.defaultReps,
        targetWeightKg: 0,
        restSeconds: item.defaultRestSeconds,
      });
      // Add muscle group to day if not present
      if (!next[activeDayIdx].muscleGroups.includes(item.muscleGroup)) {
        next[activeDayIdx].muscleGroups.push(item.muscleGroup);
      }
      return next;
    });
    setIsAddingExercise(false);
    setExerciseSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSavePlan({
        id: planToEdit?.id,
        name: name.trim(),
        description: description.trim(),
        goal,
        isActive: true,
        days,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save workout plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExercises = EXERCISE_LIBRARY.filter(
    (ex) =>
      !exerciseSearch.trim() ||
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:px-6 sm:py-4 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
            <div>
              <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                {planToEdit ? 'Edit Workout Plan' : 'Create Weekly Workout Plan'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Customize your training split, days, exercises, sets, reps, and target weights.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Plan Settings Row */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:px-6 bg-surface-container-low border-b border-outline-variant/20 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Plan Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 4-Day Push/Pull Split"
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-semibold text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-medium text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="Hypertrophy & Strength">Hypertrophy &amp; Strength</option>
                <option value="Fat Loss & Conditioning">Fat Loss &amp; Conditioning</option>
                <option value="Athletic Performance">Athletic Performance</option>
                <option value="General Health & Mobility">General Health &amp; Mobility</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Designed around class schedule"
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Days Tabs (Monday - Sunday) */}
          <div className="px-4 sm:px-6 pt-3 pb-1 border-b border-outline-variant/20 bg-surface-container-low shrink-0 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max">
              {days.map((day, idx) => {
                const isActive = activeDayIdx === idx;
                return (
                  <button
                    key={day.dayOfWeek}
                    type="button"
                    onClick={() => setActiveDayIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-xs font-bold'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span>{day.dayOfWeek.slice(0, 3)}</span>
                    {day.isRestDay ? (
                      <span className="text-[10px] opacity-75">(Rest)</span>
                    ) : (
                      <span className="text-[10px] opacity-75">
                        ({day.exercises.length} ex)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Day Detail Panel (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-on-surface">{currentDay.dayOfWeek} Schedule</span>
                  <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={currentDay.isRestDay}
                      onChange={(e) => updateCurrentDay('isRestDay', e.target.checked)}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-xs text-on-surface-variant font-medium">Mark as Rest Day</span>
                  </label>
                </div>

                {!currentDay.isRestDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-[10px] font-label-tag text-on-surface-variant uppercase mb-0.5">
                        Focus Title
                      </label>
                      <input
                        type="text"
                        value={currentDay.name}
                        onChange={(e) => updateCurrentDay('name', e.target.value)}
                        placeholder="e.g. Chest & Triceps"
                        className="w-full px-2.5 py-1 rounded-lg bg-surface border border-outline-variant/30 text-xs font-medium text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-label-tag text-on-surface-variant uppercase mb-0.5">
                        Est. Duration (mins)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="180"
                        value={currentDay.estimatedDuration}
                        onChange={(e) =>
                          updateCurrentDay('estimatedDuration', parseInt(e.target.value) || 45)
                        }
                        className="w-full px-2.5 py-1 rounded-lg bg-surface border border-outline-variant/30 text-xs font-mono text-on-surface"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {currentDay.isRestDay ? (
              <div className="p-8 text-center rounded-2xl bg-surface-container/40 border border-dashed border-outline-variant/30 space-y-1">
                <span className="material-symbols-outlined text-[32px] text-secondary">
                  self_improvement
                </span>
                <p className="text-sm font-bold text-on-surface">Scheduled Rest &amp; Recovery Day</p>
                <p className="text-xs text-on-surface-variant">
                  No intense lifting scheduled. Ideal for light walking, mobility stretches, or deep study.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wider">
                    Planned Exercises ({currentDay.exercises.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingExercise(true)}
                    className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Exercise</span>
                  </button>
                </div>

                {currentDay.exercises.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container/30">
                    <p className="text-xs text-on-surface-variant mb-2">No exercises added for {currentDay.dayOfWeek} yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingExercise(true)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold"
                    >
                      + Add First Exercise
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentDay.exercises.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-mono text-[10px] text-on-surface-variant font-bold">
                            {exIdx + 1}
                          </span>
                          <div>
                            <div className="font-headline-sm text-xs font-bold text-on-surface">
                              {ex.exerciseName}
                            </div>
                            <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-label-tag text-[9px] uppercase">
                              {ex.muscleGroup}
                            </span>
                          </div>
                        </div>

                        {/* Controls: Sets, Reps, Weight, Rest */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-on-surface-variant text-[11px]">Sets:</span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={ex.targetSets}
                              onChange={(e) =>
                                updateExerciseInDay(exIdx, 'targetSets', parseInt(e.target.value) || 3)
                              }
                              className="w-12 px-1.5 py-0.5 rounded bg-surface border border-outline-variant/30 font-mono text-xs text-center text-on-surface"
                            />
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-on-surface-variant text-[11px]">Reps:</span>
                            <input
                              type="text"
                              value={ex.targetReps}
                              onChange={(e) =>
                                updateExerciseInDay(exIdx, 'targetReps', e.target.value)
                              }
                              className="w-16 px-1.5 py-0.5 rounded bg-surface border border-outline-variant/30 font-mono text-xs text-center text-on-surface"
                            />
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-on-surface-variant text-[11px]">Kg:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={ex.targetWeightKg}
                              onChange={(e) =>
                                updateExerciseInDay(exIdx, 'targetWeightKg', parseFloat(e.target.value) || 0)
                              }
                              className="w-14 px-1.5 py-0.5 rounded bg-surface border border-outline-variant/30 font-mono text-xs text-center text-on-surface"
                            />
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-on-surface-variant text-[11px]">Rest:</span>
                            <input
                              type="number"
                              min="15"
                              step="15"
                              value={ex.restSeconds}
                              onChange={(e) =>
                                updateExerciseInDay(exIdx, 'restSeconds', parseInt(e.target.value) || 60)
                              }
                              className="w-14 px-1.5 py-0.5 rounded bg-surface border border-outline-variant/30 font-mono text-xs text-center text-on-surface"
                            />
                            <span className="text-[10px] text-on-surface-variant">s</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeExerciseFromDay(exIdx)}
                            className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors ml-1"
                            title="Remove Exercise"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Save Action */}
          <div className="p-4 sm:px-6 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between shrink-0">
            <span className="text-xs text-on-surface-variant">
              Active plan will be linked to your daily Health overview.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all shadow-md font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Plan...' : 'Save Workout Plan'}
              </button>
            </div>
          </div>
        </form>

        {/* Exercise Selector Sub-Modal */}
        {isAddingExercise && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setIsAddingExercise(false)}
          >
            <div
              className="w-full max-w-lg max-h-[80vh] rounded-2xl bg-surface-container-low border border-outline-variant/40 p-5 shadow-2xl flex flex-col space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Add to {currentDay.dayOfWeek}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingExercise(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Search exercise library..."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
              />

              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-96 pr-1">
                {filteredExercises.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddExerciseFromLibrary(item)}
                    className="p-2.5 rounded-xl bg-surface-container/60 hover:bg-surface-container hover:border-primary/40 border border-outline-variant/20 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-headline-sm text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant flex items-center gap-2 mt-0.5">
                        <span>{item.muscleGroup}</span>
                        <span>•</span>
                        <span>{item.equipment}</span>
                        <span>•</span>
                        <span>{item.difficulty}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      add_circle
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
