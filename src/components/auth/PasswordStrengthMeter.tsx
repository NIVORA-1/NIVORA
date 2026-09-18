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
    if (index >= score) return 'bg-[#1e2f37]';
    if (score <= 1) return 'bg-[#ff8a80]';
    if (score === 2) return 'bg-[#ffd54f]';
    if (score === 3) return 'bg-[#81c784]';
    return 'bg-[#8fc5a7]';
  };

  return (
    <div className="space-y-3.5">
      {/* Strength Bar & Label */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#80919b]">
          <span>Password strength:</span>
          <span className={`font-medium ${score === 4 ? 'text-[#8fc5a7]' : score >= 2 ? 'text-[#e8eff2]' : 'text-[#80919b]'}`}>
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
      <div className="rounded-xl bg-[#131f25] border border-[#1e3039] p-3.5 space-y-2">
        <span className="block text-[11px] font-sans font-medium text-[#7a8c96] uppercase tracking-wider">
          Password requirements:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Min 8 chars */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.minChars ? 'bg-[#8fc5a7]/20 text-[#8fc5a7] border border-[#8fc5a7]/40' : 'border border-[#344752] text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.minChars ? 'text-[#dbe4e9]' : 'text-[#71838d]'}>
              Min. 8 characters
            </span>
          </div>

          {/* Upper & lower case */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.caseMix ? 'bg-[#8fc5a7]/20 text-[#8fc5a7] border border-[#8fc5a7]/40' : 'border border-[#344752] text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.caseMix ? 'text-[#dbe4e9]' : 'text-[#71838d]'}>
              Upper &amp; lower case
            </span>
          </div>

          {/* At least 1 number */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.hasNumber ? 'bg-[#8fc5a7]/20 text-[#8fc5a7] border border-[#8fc5a7]/40' : 'border border-[#344752] text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.hasNumber ? 'text-[#dbe4e9]' : 'text-[#71838d]'}>
              At least 1 number
            </span>
          </div>

          {/* 1 special symbol */}
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              criteria.hasSpecial ? 'bg-[#8fc5a7]/20 text-[#8fc5a7] border border-[#8fc5a7]/40' : 'border border-[#344752] text-transparent'
            }`}>
              ✓
            </span>
            <span className={criteria.hasSpecial ? 'text-[#dbe4e9]' : 'text-[#71838d]'}>
              1 special symbol
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
