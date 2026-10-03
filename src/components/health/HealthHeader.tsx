'use client';

import React from 'react';

export type HealthTab = 'overview' | 'gym' | 'workout' | 'nutrition' | 'water' | 'sleep' | 'goals' | 'progress';

interface HealthHeaderProps {
  activeTab: HealthTab;
  onTabChange: (tab: HealthTab) => void;
  onOpenCheckIn: () => void;
  onOpenSettings: () => void;
  hasCheckInToday: boolean;
}

const TABS: { id: HealthTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'gym', label: 'Gym', icon: 'fitness_center' },
  { id: 'workout', label: 'Workout', icon: 'timer' },
  { id: 'water', label: 'Water', icon: 'water_drop' },
  { id: 'sleep', label: 'Sleep', icon: 'bedtime' },
  { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
  { id: 'goals', label: 'Goals', icon: 'flag' },
  { id: 'progress', label: 'Progress', icon: 'trending_up' },
];

export default function HealthHeader({
  activeTab,
  onTabChange,
  onOpenCheckIn,
  onOpenSettings,
  hasCheckInToday,
}: HealthHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-tag text-label-tag font-semibold uppercase tracking-wider">
              Student Wellness
            </span>
            <span className="text-outline-variant font-label-tag text-label-tag">/</span>
            <span className="font-label-tag text-label-tag uppercase tracking-widest text-on-surface-variant">
              Vitality &amp; Recovery
            </span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-semibold">
            Health Manager
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Take care of your body, energy and daily routine.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCheckIn}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              hasCheckInToday
                ? 'bg-surface-container-high text-on-surface border border-outline-variant/30 hover:bg-surface-container-highest'
                : 'bg-primary text-on-primary hover:bg-primary-fixed shadow-md'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {hasCheckInToday ? 'check_circle' : 'edit_note'}
            </span>
            <span>{hasCheckInToday ? 'Check-In Logged' : 'Daily Check-In'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Wellness Settings"
            aria-label="Wellness Settings"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs Bar */}
      <div className="border-b border-outline-variant/30 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 min-w-max py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[17px] ${
                    isActive ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
