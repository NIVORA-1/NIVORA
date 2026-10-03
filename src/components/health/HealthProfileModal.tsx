'use client';

import React, { useState } from 'react';

interface HealthProfileModalProps {
  profile: any;
  userMeta: any;
  onClose: () => void;
  onSaveProfile: (profileData: any) => Promise<void>;
}

export default function HealthProfileModal({
  profile,
  userMeta,
  onClose,
  onSaveProfile,
}: HealthProfileModalProps) {
  const [waterGoalMl, setWaterGoalMl] = useState(profile?.waterGoalMl || 2500);
  const [sleepGoalHours, setSleepGoalHours] = useState(profile?.sleepGoalHours || 8.0);
  const [weeklyWorkoutGoal, setWeeklyWorkoutGoal] = useState(profile?.weeklyWorkoutGoal || 4);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(profile?.dailyCalorieGoal || 2200);
  const [heightCm, setHeightCm] = useState(profile?.heightCm ? String(profile.heightCm) : '');
  const [weightKg, setWeightKg] = useState(profile?.weightKg ? String(profile.weightKg) : '');
  const [activityLevel, setActivityLevel] = useState(profile?.activityLevel || 'Moderate');
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitnessGoal || 'Strength & General Vitality');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveProfile({
        waterGoalMl: parseInt(String(waterGoalMl)),
        sleepGoalHours: parseFloat(String(sleepGoalHours)),
        weeklyWorkoutGoal: parseInt(String(weeklyWorkoutGoal)),
        dailyCalorieGoal: parseInt(String(dailyCalorieGoal)),
        heightCm: heightCm ? parseFloat(heightCm) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        activityLevel,
        fitnessGoal,
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
        className="w-full max-w-lg rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              Health &amp; Wellness Preferences
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

        {/* Existing Student Profile Info (Read-Only Integration) */}
        <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/20 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-label-tag block">
              Integrated Student Profile
            </span>
            <span className="font-bold text-on-surface">{userMeta?.name || 'Student'}</span>
            <span className="text-on-surface-variant ml-2">
              ({userMeta?.degree || 'B.Tech'} {userMeta?.streamCode || 'CSE'}, Sem {userMeta?.semester || 5})
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Daily Water Goal (ml)
              </label>
              <input
                type="number"
                min="500"
                max="8000"
                step="100"
                required
                value={waterGoalMl}
                onChange={(e) => setWaterGoalMl(parseInt(e.target.value) || 2500)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Daily Sleep Target (hrs)
              </label>
              <input
                type="number"
                min="4"
                max="14"
                step="0.5"
                required
                value={sleepGoalHours}
                onChange={(e) => setSleepGoalHours(parseFloat(e.target.value) || 8)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Weekly Workout Goal (days)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                required
                value={weeklyWorkoutGoal}
                onChange={(e) => setWeeklyWorkoutGoal(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Daily Calorie Target (kcal)
              </label>
              <input
                type="number"
                min="1000"
                max="6000"
                step="50"
                value={dailyCalorieGoal}
                onChange={(e) => setDailyCalorieGoal(parseInt(e.target.value) || 2200)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Height (cm) - Optional
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 178"
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Weight (kg) - Optional
              </label>
              <input
                type="number"
                min="30"
                max="200"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 72"
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Daily Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="Sedentary">Sedentary (Desk / Studying)</option>
                <option value="Light">Lightly Active</option>
                <option value="Moderate">Moderately Active (3-4x/wk)</option>
                <option value="Very Active">Very Active (5-7x/wk)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-label-tag text-on-surface-variant uppercase font-semibold mb-1">
                Primary Fitness Goal
              </label>
              <input
                type="text"
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                placeholder="e.g. Strength & General Vitality"
                className="w-full px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
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
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
