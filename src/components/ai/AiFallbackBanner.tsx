'use client';

import React from 'react';

interface AiFallbackBannerProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const FREE_TIER_LIMIT_MESSAGE =
  'AI service is temporarily unavailable or the free usage limit has been reached. Please try again later.';

export default function AiFallbackBanner({
  message = FREE_TIER_LIMIT_MESSAGE,
  onRetry,
  className = '',
}: AiFallbackBannerProps) {
  return (
    <div
      role="alert"
      className={`p-4 rounded-xl bg-error/10 border border-error/30 text-on-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-error text-[22px] mt-0.5 shrink-0">
          cloud_off
        </span>
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-error uppercase tracking-wider font-mono">
            Free-Tier Rate Limit / Temporary Outage
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface hover:bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
