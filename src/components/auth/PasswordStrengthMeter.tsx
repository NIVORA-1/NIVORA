'use client';

import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export interface PasswordCriteria {
  minChars: boolean;
  caseMix: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePassword(password: string): { criteria: PasswordCriteria; score: number; label: string } {
  const criteria: PasswordCriteria = {
    minChars: password.length >= 8,
    caseMix: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (!password) {
    return { criteria, score: 0, label: 'None entered' };
  }

  const score = [criteria.minChars, criteria.caseMix, criteria.hasNumber, criteria.hasSpecial].filter(Boolean).length;

  let label = 'Weak';
  if (score === 2) label = 'Fair';
  if (score === 3) label = 'Good';
  if (score === 4) label = 'Strong';

  return { criteria, score, label };
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { criteria, score, label } = evaluatePassword(password);

  const getBarColor = (index: number) => {
    if (index >= score) return 'bg-outline-variant/25';
    if (score <= 1) return 'bg-coral/80';
    if (score === 2) return 'bg-muted-sand';
    if (score === 3) return 'bg-coral';
    return 'bg-deep-coral';
  };

  return (
    <div className="space-y-3.5">
      {/* Strength Bar & Label */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>Password strength:</span>
          <span className={`font-medium ${score === 4 ? 'text-deep-coral' : score >= 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
            {label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-full rounded-full transition-all duration-300 ${getBarColor(i)}`}
            />
          ))}
        </div>
      </div>

      {/* 2x2 Requirement Checklist */}
      <div className="rounded-xl bg-surface-container border border-outline-variant/40 p-3.5 space-y-2">
        <span className="block text-[11px] font-sans font-medium text-on-surface-variant uppercase tracking-wider">
          Password requirements:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Min 8 chars */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.minChars ? 'bg-deep-coral/15 text-deep-coral border border-deep-coral/40' : 'border border-outline-variant/60 text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.minChars ? 'text-on-surface' : 'text-on-surface-variant'}>
              Min. 8 characters
            </span>
          </div>

          {/* Upper & lower case */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.caseMix ? 'bg-deep-coral/15 text-deep-coral border border-deep-coral/40' : 'border border-outline-variant/60 text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.caseMix ? 'text-on-surface' : 'text-on-surface-variant'}>
              Upper &amp; lower case
            </span>
          </div>

          {/* At least 1 number */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.hasNumber ? 'bg-deep-coral/15 text-deep-coral border border-deep-coral/40' : 'border border-outline-variant/60 text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.hasNumber ? 'text-on-surface' : 'text-on-surface-variant'}>
              At least 1 number
            </span>
          </div>

          {/* 1 special symbol */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.hasSpecial ? 'bg-deep-coral/15 text-deep-coral border border-deep-coral/40' : 'border border-outline-variant/60 text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.hasSpecial ? 'text-on-surface' : 'text-on-surface-variant'}>
              1 special symbol
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

