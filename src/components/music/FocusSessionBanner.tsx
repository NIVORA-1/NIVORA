'use client';

import React from 'react';
import { useMusic } from '@/context/MusicContext';

export default function FocusSessionBanner() {
  const { activeFocusSession, stopContextFocusSession, dismissFocusCompletion } = useMusic();

  if (!activeFocusSession) return null;

  const { name, totalMins, secondsLeft, isComplete } = activeFocusSession;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const progressPercent = Math.min(100, Math.max(0, ((totalMins * 60 - secondsLeft) / (totalMins * 60)) * 100));

  if (isComplete) {
    return (
      <div className="fixed top-20 right-4 z-40 max-w-md w-[calc(100vw-2rem)] rounded-2xl bg-surface-container-high border border-primary/50 shadow-2xl p-4 animate-in slide-in-from-top-4 duration-300 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-label-tag text-[10px] uppercase text-primary font-bold tracking-widest">
                FOCUS SESSION COMPLETE
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary font-label-tag text-[9px] font-bold">
                +5 Cognitive Points
              </span>
            </div>
            <h4 className="font-headline-sm text-sm font-bold text-on-surface">
              {name}
            </h4>
            <p className="font-body-sm text-xs text-on-surface-variant">
              {totalMins} minutes sustained academic flow completed. Neural tree graph updated.
            </p>
          </div>

          <button
            onClick={dismissFocusCompletion}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] rounded-xl bg-surface-container-low/95 border border-outline-variant/40 shadow-xl p-3 animate-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0" />
          <div className="min-w-0">
            <div className="font-label-tag text-[9px] uppercase text-primary font-bold truncate">
              STUDY FOCUS ACTIVE
            </div>
            <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
              {name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-label-mono-wide text-xs text-on-surface font-bold">
            {timeFormatted}
          </span>
          <button
            onClick={stopContextFocusSession}
            className="p-1 rounded text-on-surface-variant hover:text-error transition-colors"
            title="End Session Early"
          >
            <span className="material-symbols-outlined text-[16px]">stop_circle</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
