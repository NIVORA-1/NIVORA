'use client';

import React from 'react';
import { ExerciseItem } from '@/lib/exerciseLibrary';

interface ExerciseDetailModalProps {
  exercise: ExerciseItem | null;
  onClose: () => void;
  onAddToWorkout?: (exercise: ExerciseItem) => void;
}

export default function ExerciseDetailModal({
  exercise,
  onClose,
  onAddToWorkout,
}: ExerciseDetailModalProps) {
  if (!exercise) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono text-[10px] font-bold uppercase">
                {exercise.muscleGroup}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px]">
                {exercise.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px]">
                {exercise.equipment}
              </span>
            </div>
            <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-1.5">
              {exercise.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Secondary Muscles & Recommendations */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant block font-label-tag uppercase">
              Rec. Sets
            </span>
            <span className="font-mono font-bold text-on-surface">{exercise.defaultSets} Sets</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant block font-label-tag uppercase">
              Rec. Reps
            </span>
            <span className="font-mono font-bold text-on-surface">{exercise.defaultReps}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/20">
            <span className="text-[10px] text-on-surface-variant block font-label-tag uppercase">
              Rest Time
            </span>
            <span className="font-mono font-bold text-on-surface">{exercise.defaultRestSeconds}s</span>
          </div>
        </div>

        {exercise.secondaryMuscles.length > 0 && (
          <div className="text-xs text-on-surface-variant">
            <strong className="text-on-surface">Secondary Muscles:</strong>{' '}
            {exercise.secondaryMuscles.join(', ')}
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-1.5">
          <h4 className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wider">
            Execution Steps
          </h4>
          <ol className="space-y-1 text-xs text-on-surface-variant list-decimal list-inside pl-1 leading-relaxed">
            {exercise.instructions.map((step, idx) => (
              <li key={idx} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Pro / Student Tip */}
        {exercise.tips && (
          <div className="p-3 rounded-xl bg-secondary-container/30 border border-secondary/30 flex items-start gap-2 text-xs text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <p>
              <strong className="text-primary font-semibold">Form Cue:</strong> {exercise.tips}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
          >
            Close
          </button>
          {onAddToWorkout && (
            <button
              type="button"
              onClick={() => {
                onAddToWorkout(exercise);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-colors font-bold shadow-sm"
            >
              Add to Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
