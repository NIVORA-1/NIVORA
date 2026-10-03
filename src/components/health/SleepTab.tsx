'use client';

import React, { useState } from 'react';

interface SleepTabProps {
  sleepData: any;
  onLogSleep: (logData: any) => Promise<void>;
  onDeleteSleep: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export default function SleepTab({
  sleepData,
  onLogSleep,
  onDeleteSleep,
  onRefresh,
}: SleepTabProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goalHours = sleepData?.goalHours || 8.0;
  const latest = sleepData?.latest;
  const stats = sleepData?.stats;
  const history = sleepData?.history || [];

  // Live calculation of duration from bedtime & wake time
  const calculateDurationPreview = () => {
    try {
      const [bedH, bedM] = bedtime.split(':').map((v) => parseInt(v, 10));
      const [wakeH, wakeM] = wakeTime.split(':').map((v) => parseInt(v, 10));
      if (isNaN(bedH) || isNaN(wakeH)) return null;

      let totalMins = 0;
      if (wakeH < bedH || (wakeH === bedH && wakeM < bedM)) {
        // Overnight sleep past midnight
        totalMins = (24 * 60 - (bedH * 60 + bedM)) + (wakeH * 60 + wakeM);
      } else {
        totalMins = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
      }

      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return `${h}h ${m}m (${(totalMins / 60).toFixed(1)} hrs)`;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedtime || !wakeTime) return;

    setIsSubmitting(true);
    try {
      await onLogSleep({
        date,
        bedtime,
        wakeTime,
        quality,
        notes,
      });
      setIsLogging(false);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP STATS SUMMARY (Bento Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Today's / Latest Sleep */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-sm">
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
            Latest Sleep Recorded
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">
              {latest ? `${latest.durationHours}h` : '—'}
            </span>
            {latest && (
              <span className="text-xs text-on-surface-variant font-mono">
                ({latest.durationMinutes} mins)
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant">
            {latest
              ? `Woke on ${latest.date} • Quality: ${latest.quality}/5`
              : 'No sleep record logged yet.'}
          </p>
        </div>

        {/* Card 2: 7-Day Average Duration */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-sm">
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
            Average Sleep Duration
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-primary font-mono">
              {stats?.avgDurationHours ? `${stats.avgDurationHours}h` : '—'}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              / {goalHours}h Target
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round(((stats?.avgDurationHours || 0) / goalHours) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Card 3: Average Sleep Quality */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-sm">
          <span className="font-label-tag text-label-tag uppercase tracking-wider text-on-surface-variant font-semibold">
            Average Sleep Quality
          </span>
          <div className="flex items-baseline gap-1 text-primary">
            <span className="font-headline-lg text-headline-lg font-bold font-mono">
              {stats?.avgQuality ? stats.avgQuality : '—'}
            </span>
            <span className="text-sm font-mono text-on-surface-variant">/ 5</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Based on {stats?.logsCount || 0} recorded sleep cycles.
          </p>
        </div>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
            Sleep History &amp; Recovery Logs
          </h3>
          <p className="text-xs text-on-surface-variant">
            Overnight sleep duration is calculated automatically from bedtime to wake-up time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsLogging(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Log Sleep</span>
        </button>
      </div>

      {/* ── LOGS TABLE / LIST ── */}
      {history.length > 0 ? (
        <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-3 shadow-sm">
          <div className="grid grid-cols-12 gap-3 pb-2 border-b border-outline-variant/20 text-[11px] font-label-tag uppercase text-on-surface-variant font-semibold px-2">
            <span className="col-span-3 sm:col-span-2">Date</span>
            <span className="col-span-4 sm:col-span-3">Bedtime → Wake</span>
            <span className="col-span-3 sm:col-span-3">Duration</span>
            <span className="hidden sm:block sm:col-span-2">Quality</span>
            <span className="col-span-2 text-right">Action</span>
          </div>

          <div className="space-y-2">
            {history.map((item: any) => {
              const bedTimeStr = new Date(item.bedtime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const wakeTimeStr = new Date(item.wakeTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const hours = Math.floor(item.durationMinutes / 60);
              const mins = item.durationMinutes % 60;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-center p-3 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/20 transition-all text-xs"
                >
                  <span className="col-span-3 sm:col-span-2 font-mono font-bold text-on-surface">
                    {item.date}
                  </span>
                  <span className="col-span-4 sm:col-span-3 font-mono text-on-surface-variant">
                    {bedTimeStr} → {wakeTimeStr}
                  </span>
                  <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5 font-mono">
                    <strong className="text-primary font-bold">
                      {hours}h {mins}m
                    </strong>
                    {item.durationMinutes >= goalHours * 60 && (
                      <span className="material-symbols-outlined text-secondary text-[14px]">
                        check_circle
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block sm:col-span-2 text-primary">
                    {'★'.repeat(item.quality)}
                  </span>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onDeleteSleep(item.id)}
                      className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                      title="Delete sleep record"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* EMPTY STATE: NO SLEEP RECORD YET */
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-surface-container-low border border-dashed border-outline-variant/40 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[28px]">bedtime</span>
          </div>
          <h3 className="font-headline-sm text-base font-bold text-on-surface">
            No Sleep Record Yet
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Log your sleep schedules to analyze recovery trends alongside your study and workout performance.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsLogging(true)}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold shadow-sm"
            >
              Log Sleep Now
            </button>
          </div>
        </div>
      )}

      {/* ── LOG SLEEP MODAL ── */}
      {isLogging && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsLogging(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">bedtime</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Record Sleep Cycle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Date (Wake-Up Date)
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                    Bedtime (Night)
                  </label>
                  <input
                    type="time"
                    required
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                    Wake-Up Time (Morning)
                  </label>
                  <input
                    type="time"
                    required
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Duration Calculation Preview */}
              {calculateDurationPreview() && (
                <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Calculated Duration:</span>
                  <span className="font-mono font-bold text-primary">
                    {calculateDurationPreview()}
                  </span>
                </div>
              )}

              {/* Quality Rating */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Sleep Quality Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setQuality(star)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        quality >= star
                          ? 'bg-secondary-container text-on-secondary-container border-secondary/40'
                          : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-tag uppercase">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Slept deeply after CS-301 assignment sprint"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsLogging(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs hover:bg-primary-fixed transition-all font-bold disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Sleep Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
