'use client';

import React, { useState, useEffect } from 'react';

interface DailyCheckInModalProps {
  initialCheckIn?: any;
  currentWaterMl?: number;
  isWorkoutCompletedToday?: boolean;
  onClose: () => void;
  onSubmitCheckIn: (data: any) => Promise<void>;
}

const MOODS = ['Great', 'Energized', 'Focused', 'Neutral', 'Tired', 'Stressed'];

export default function DailyCheckInModal({
  initialCheckIn,
  currentWaterMl = 0,
  isWorkoutCompletedToday = false,
  onClose,
  onSubmitCheckIn,
}: DailyCheckInModalProps) {
  const [energyLevel, setEnergyLevel] = useState(initialCheckIn?.energyLevel || 3);
  const [workoutCompleted, setWorkoutCompleted] = useState(
    initialCheckIn ? initialCheckIn.workoutCompleted : isWorkoutCompletedToday
  );
  const [waterIntakeMl, setWaterIntakeMl] = useState(
    initialCheckIn?.waterIntakeMl || currentWaterMl || 1500
  );
  const [sleepHours, setSleepHours] = useState(
    initialCheckIn?.sleepHours !== undefined && initialCheckIn.sleepHours !== null
      ? String(initialCheckIn.sleepHours)
      : '7.5'
  );
  const [mood, setMood] = useState(initialCheckIn?.mood || 'Focused');
  const [notes, setNotes] = useState(initialCheckIn?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitCheckIn({
        energyLevel,
        workoutCompleted,
        waterIntakeMl: parseInt(String(waterIntakeMl)) || 0,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
        mood,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">self_improvement</span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              Daily Health Check-In
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant">
          A quick reflection on your physical energy and daily habits to correlate with your academic performance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Energy Level (1-5) */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 font-label-tag uppercase">
              Energy Level Today: <strong className="text-primary font-mono">{energyLevel}/5</strong>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEnergyLevel(level)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    energyLevel === level
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {level} {level === 1 ? '😴' : level === 3 ? '⚡' : level === 5 ? '🔥' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Mood / Feeling */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
              Mindset / Mood
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    mood === m
                      ? 'bg-secondary-container text-on-secondary-container font-bold shadow-2xs'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Workout Completed Toggle */}
          <div className="p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface">Did you exercise/workout today?</span>
            <button
              type="button"
              onClick={() => setWorkoutCompleted(!workoutCompleted)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                workoutCompleted
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {workoutCompleted ? 'Yes, Completed' : 'Not Yet'}
            </button>
          </div>

          {/* Sleep Hours & Water Intake */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase mb-1">
                Sleep Duration (hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="18"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase mb-1">
                Water Intake (ml)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={waterIntakeMl}
                onChange={(e) => setWaterIntakeMl(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
              General Wellness Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Good focus day, stayed hydrated during DBMS lab"
              className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
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
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Submit Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
