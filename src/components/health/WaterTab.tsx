'use client';

import React, { useState } from 'react';

interface WaterTabProps {
  waterData: any;
  onQuickAdd: (amountMl: number) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export default function WaterTab({
  waterData,
  onQuickAdd,
  onDeleteLog,
  onRefresh,
}: WaterTabProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMl = waterData?.currentMl || 0;
  const goalMl = waterData?.goalMl || 2500;
  const percentage = Math.min(100, Math.round((currentMl / goalMl) * 100));
  const logs = waterData?.logs || [];
  const weeklyHistory = waterData?.weeklyHistory || [];

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount);
    if (isNaN(val) || val <= 0) return;

    setIsSubmitting(true);
    try {
      await onQuickAdd(val);
      setCustomAmount('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP WATER DASHBOARD BENTO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Progress Gauge & Quick Add (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-tag text-label-tag uppercase tracking-wider text-primary font-semibold">
                  Daily Hydration Cadence
                </span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  Water Tracker
                </h3>
              </div>
              <span className="font-mono text-sm font-bold text-primary">
                {percentage}% of Goal
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display-hero text-4xl sm:text-5xl font-bold text-on-surface font-mono">
                    {currentMl}
                  </span>
                  <span className="text-sm font-semibold text-on-surface-variant font-mono">
                    / {goalMl} ml
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  {currentMl >= goalMl ? (
                    <span className="text-secondary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Daily Goal Achieved!</span>
                    </span>
                  ) : (
                    `${goalMl - currentMl} ml remaining`
                  )}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <span className="block text-[11px] font-label-tag uppercase text-on-surface-variant font-semibold">
                Quick Log Water
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 750].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => onQuickAdd(amount)}
                    className="py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 group"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary group-hover:scale-110 transition-transform">
                      water_drop
                    </span>
                    <span>+{amount} ml</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input Form */}
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="10"
                max="3000"
                step="10"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom amount (e.g. 350 ml)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isSubmitting || !customAmount}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold disabled:opacity-40 shadow-sm"
              >
                Log Amount
              </button>
            </form>
          </div>

          {/* 7-Day Consistency History Chart */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                7-Day Hydration History
              </h4>
              <span className="text-xs text-on-surface-variant font-mono">
                Target: {goalMl} ml / day
              </span>
            </div>

            {weeklyHistory.length > 0 ? (
              <div className="grid grid-cols-7 gap-2 pt-2">
                {weeklyHistory.map((item: any, idx: number) => {
                  const dayLabel = new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                  });
                  const barHeight = Math.min(100, Math.round((item.amountMl / item.goalMl) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 text-center">
                      <div className="w-full h-28 bg-surface-container rounded-xl flex items-end p-1 border border-outline-variant/20">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            item.isGoalMet ? 'bg-secondary' : 'bg-primary'
                          }`}
                          style={{ height: `${barHeight}%` }}
                          title={`${item.date}: ${item.amountMl} ml`}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-on-surface-variant font-semibold">
                        {dayLabel}
                      </span>
                      <span className="font-mono text-[9px] text-on-surface-variant/80">
                        {item.amountMl > 0 ? `${(item.amountMl / 1000).toFixed(1)}L` : '0L'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-on-surface-variant">
                No past logs yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Today's Logged History List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                  Today&apos;s Logs ({logs.length})
                </h4>
              </div>
              <span className="text-xs font-mono text-primary font-bold">
                {currentMl} ml Total
              </span>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {logs.map((log: any) => {
                  const timeStr = new Date(log.loggedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/20 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">water_drop</span>
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-on-surface">
                            +{log.amountMl} ml
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-mono">
                            {timeStr}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                        title="Delete log"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* EMPTY STATE: NO WATER LOGGED TODAY */
              <div className="py-12 text-center rounded-2xl border border-dashed border-outline-variant/30 space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">water_drop</span>
                </div>
                <p className="text-xs font-bold text-on-surface">No water logged today</p>
                <p className="text-[11px] text-on-surface-variant max-w-[200px] mx-auto">
                  Click the quick add buttons above to track your hydration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
