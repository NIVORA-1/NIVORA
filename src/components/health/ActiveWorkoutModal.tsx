'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ExerciseItem, EXERCISE_LIBRARY } from '@/lib/exerciseLibrary';

interface ActiveSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  isCompleted: boolean;
}

interface ActiveExercise {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  sets: ActiveSet[];
  notes?: string;
  isSkipped?: boolean;
}

interface ActiveWorkoutModalProps {
  initialDayName?: string;
  initialExercises?: any[];
  planId?: string;
  planName?: string;
  onClose: () => void;
  onFinishWorkout: (workoutData: any) => Promise<void>;
}

export default function ActiveWorkoutModal({
  initialDayName = 'Workout Session',
  initialExercises = [],
  planId,
  planName,
  onClose,
  onFinishWorkout,
}: ActiveWorkoutModalProps) {
  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rest Timer state
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [restTotalSeconds, setRestTotalSeconds] = useState(60);

  // Exercises state
  const [exercises, setExercises] = useState<ActiveExercise[]>(() => {
    if (initialExercises && initialExercises.length > 0) {
      return initialExercises.map((ex, i) => {
        const count = ex.targetSets || 3;
        const sets: ActiveSet[] = [];
        for (let s = 1; s <= count; s++) {
          sets.push({
            setNumber: s,
            reps: parseInt(String(ex.targetReps)) || 10,
            weightKg: ex.targetWeightKg || 0,
            isCompleted: false,
          });
        }
        return {
          id: `ex-${i}-${Date.now()}`,
          exerciseName: ex.exerciseName || 'Exercise',
          muscleGroup: ex.muscleGroup || 'Full Body',
          sets,
          notes: ex.notes || '',
        };
      });
    }

    // Default starting exercise if none provided
    return [
      {
        id: `ex-def-1`,
        exerciseName: 'Barbell Flat Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 50, isCompleted: false },
          { setNumber: 2, reps: 10, weightKg: 50, isCompleted: false },
          { setNumber: 3, reps: 8, weightKg: 55, isCompleted: false },
        ],
      },
    ];
  });

  const [workoutTitle, setWorkoutTitle] = useState(initialDayName);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Main elapsed workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused]);

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (restSecondsRemaining !== null && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining((s) => (s !== null && s > 0 ? s - 1 : null));
      }, 1000);
    } else if (restSecondsRemaining === 0) {
      setRestSecondsRemaining(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restSecondsRemaining]);

  const startRestTimer = (seconds: number) => {
    setRestTotalSeconds(seconds);
    setRestSecondsRemaining(seconds);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set management
  const toggleSetComplete = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const targetSet = next[exerciseIdx].sets[setIdx];
      const wasCompleted = targetSet.isCompleted;
      targetSet.isCompleted = !wasCompleted;

      // If marking complete, automatically initiate a 60-90s rest timer
      if (!wasCompleted) {
        startRestTimer(75);
      }
      return next;
    });
  };

  const updateSet = (
    exerciseIdx: number,
    setIdx: number,
    field: 'reps' | 'weightKg',
    value: number
  ) => {
    setExercises((prev) => {
      const next = [...prev];
      next[exerciseIdx].sets[setIdx][field] = value;
      return next;
    });
  };

  const addSet = (exerciseIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const currentSets = next[exerciseIdx].sets;
      const lastSet = currentSets[currentSets.length - 1];
      currentSets.push({
        setNumber: currentSets.length + 1,
        reps: lastSet ? lastSet.reps : 10,
        weightKg: lastSet ? lastSet.weightKg : 0,
        isCompleted: false,
      });
      return next;
    });
  };

  const removeSet = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      if (next[exerciseIdx].sets.length > 1) {
        next[exerciseIdx].sets.splice(setIdx, 1);
        next[exerciseIdx].sets.forEach((s, idx) => {
          s.setNumber = idx + 1;
        });
      }
      return next;
    });
  };

  const removeExercise = (exerciseIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIdx));
  };

  const toggleSkipExercise = (exerciseIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      next[exerciseIdx].isSkipped = !next[exerciseIdx].isSkipped;
      return next;
    });
  };

  const handleAddExerciseFromLib = (item: ExerciseItem) => {
    setExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}-${item.id}`,
        exerciseName: item.name,
        muscleGroup: item.muscleGroup,
        sets: [
          { setNumber: 1, reps: 10, weightKg: 0, isCompleted: false },
          { setNumber: 2, reps: 10, weightKg: 0, isCompleted: false },
          { setNumber: 3, reps: 10, weightKg: 0, isCompleted: false },
        ],
      },
    ]);
    setIsAddingExercise(false);
    setExerciseSearch('');
  };

  const handleFinish = async () => {
    const activeExercises = exercises.filter((ex) => !ex.isSkipped);
    if (activeExercises.length === 0) {
      alert('Please add at least one active exercise to record this workout.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onFinishWorkout({
        title: workoutTitle,
        planId,
        planName,
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        notes: workoutNotes,
        exercises: activeExercises.map((ex) => ({
          exerciseName: ex.exerciseName,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
        })),
      });
      onClose();
    } catch (err) {
      console.error('Failed to finish workout:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered exercise library list for quick adding
  const filteredLib = EXERCISE_LIBRARY.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesSearch =
      !exerciseSearch.trim() ||
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const totalSetsCount = exercises.reduce((sum, ex) => sum + (ex.isSkipped ? 0 : ex.sets.length), 0);
  const completedSetsCount = exercises.reduce(
    (sum, ex) => sum + (ex.isSkipped ? 0 : ex.sets.filter((s) => s.isCompleted).length),
    0
  );

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && confirm('Do you want to leave the active workout? Unsaved progress will be lost.')) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOP HEADER / WORKOUT STATUS BAR ── */}
        <div className="p-4 sm:px-6 sm:py-4 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[24px]">fitness_center</span>
            </div>
            <div>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="font-headline-sm text-base sm:text-lg text-on-surface font-bold bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none"
              />
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                <span>{planName || 'Custom Session'}</span>
                <span>•</span>
                <span>
                  {completedSetsCount} / {totalSetsCount} Sets Completed
                </span>
              </div>
            </div>
          </div>

          {/* Stopwatch & Rest Timer Controls */}
          <div className="flex items-center gap-3">
            {/* Live Stopwatch */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px] text-primary">timer</span>
              <span className="font-mono text-sm sm:text-base font-bold text-on-surface">
                {formatTime(elapsedSeconds)}
              </span>
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="p-1 rounded-md text-on-surface-variant hover:text-on-surface"
                title={isPaused ? 'Resume Workout' : 'Pause Workout'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPaused ? 'play_arrow' : 'pause'}
                </span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Discard this workout session?')) {
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
              title="Close & Discard"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ── REST TIMER PROMINENT BANNER (if running) ── */}
        {restSecondsRemaining !== null && (
          <div className="px-6 py-2.5 bg-secondary-container text-on-secondary-container border-b border-outline-variant/30 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px] animate-spin">
                hourglass_top
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider">Rest Between Sets</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-primary">
                {formatTime(restSecondsRemaining)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRestSecondsRemaining((s) => (s ? s + 30 : 30))}
                  className="px-2 py-0.5 rounded-md bg-surface-container text-xs font-medium hover:bg-surface-container-high"
                >
                  +30s
                </button>
                <button
                  type="button"
                  onClick={() => setRestSecondsRemaining(null)}
                  className="px-2 py-0.5 rounded-md bg-surface-container text-xs font-medium hover:bg-surface-container-high"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── WORKOUT EXERCISE LIST (Scrollable Area) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {exercises.map((exercise, exIdx) => (
            <div
              key={exercise.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                exercise.isSkipped
                  ? 'bg-surface-container/40 border-outline-variant/20 opacity-60'
                  : 'bg-surface-container-low border-outline-variant/30 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-label-mono-wide text-xs text-on-surface-variant font-bold">
                    0{exIdx + 1}
                  </span>
                  <div>
                    <h4 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                      {exercise.exerciseName}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-tag text-[9px] uppercase font-semibold">
                      {exercise.muscleGroup}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSkipExercise(exIdx)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    {exercise.isSkipped ? 'Unskip' : 'Skip'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExercise(exIdx)}
                    className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                    title="Remove Exercise"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {!exercise.isSkipped && (
                <div className="space-y-2">
                  {/* Table Headers */}
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-label-tag text-on-surface-variant uppercase tracking-wider font-semibold px-2">
                    <span className="col-span-2">Set</span>
                    <span className="col-span-4">Weight (kg)</span>
                    <span className="col-span-4">Reps</span>
                    <span className="col-span-2 text-right">Done</span>
                  </div>

                  {/* Sets Rows */}
                  {exercise.sets.map((set, sIdx) => (
                    <div
                      key={sIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-all ${
                        set.isCompleted
                          ? 'bg-secondary-container/40 border border-secondary/40'
                          : 'bg-surface-container/60 hover:bg-surface-container border border-outline-variant/20'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-2 flex items-center gap-1">
                        <span className="font-mono text-xs font-bold text-on-surface">
                          #{set.setNumber}
                        </span>
                        {exercise.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(exIdx, sIdx)}
                            className="text-on-surface-variant/40 hover:text-error text-xs"
                            title="Remove set"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Weight Input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={set.weightKg}
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, 'weightKg', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface font-mono text-xs focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          min="0"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, 'reps', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface font-mono text-xs focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Complete Checkbox */}
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => toggleSetComplete(exIdx, sIdx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            set.isCompleted
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'border border-outline-variant hover:border-primary text-transparent'
                          }`}
                          aria-label={`Mark set ${set.setNumber} complete`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {set.isCompleted ? 'check' : 'check'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Set Button */}
                  <button
                    type="button"
                    onClick={() => addSet(exIdx)}
                    className="w-full py-1.5 rounded-xl border border-dashed border-outline-variant/40 hover:border-primary text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Set</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Exercise from Library CTA */}
          <button
            type="button"
            onClick={() => setIsAddingExercise(true)}
            className="w-full py-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-button-text text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">add_circle</span>
            <span>Add Exercise from Library</span>
          </button>

          {/* Workout Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
              Workout Notes / Reflection (Optional)
            </label>
            <textarea
              rows={2}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="Felt great on bench press. Increased dumbbell weight on final set..."
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* ── BOTTOM ACTIONS: FINISH OR DISCARD ── */}
        <div className="p-4 sm:px-6 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>Duration: <strong className="text-on-surface font-mono">{formatTime(elapsedSeconds)}</strong></span>
            <span>•</span>
            <span>
              Total Sets: <strong className="text-on-surface font-mono">{completedSetsCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (confirm('Discard this workout session?')) onClose();
              }}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all shadow-md font-bold disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>{isSubmitting ? 'Saving Session...' : 'Finish Workout'}</span>
            </button>
          </div>
        </div>

        {/* ── EXERCISE PICKER MODAL (From Library) ── */}
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
                  <span className="material-symbols-outlined text-primary text-[20px]">library_add</span>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Exercise Library
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

              {/* Search Bar */}
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Search exercise by name or muscle..."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
              />

              {/* Muscle Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core', 'Cardio', 'Full Body'].map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMuscle(m)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                        selectedMuscle === m
                          ? 'bg-primary text-on-primary font-bold'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>

              {/* Exercise Items List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-96 pr-1">
                {filteredLib.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddExerciseFromLib(item)}
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
