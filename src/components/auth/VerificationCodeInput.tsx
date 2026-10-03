'use client';

import React, { useRef, useEffect } from 'react';

interface VerificationCodeInputProps {
  code: string[];
  onChange: (digits: string[]) => void;
  onComplete?: (fullCode: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function VerificationCodeInput({
  code,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input box on initial mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...code];
      newDigits[index] = '';
      onChange(newDigits);
      return;
    }

    const lastDigit = cleaned[cleaned.length - 1];
    const newDigits = [...code];
    newDigits[index] = lastDigit;
    onChange(newDigits);

    // Auto-advance to the next input box
    if (index < 5 && lastDigit) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger onComplete if all 6 digits are entered
    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasted) return;

    const newDigits = [...code];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    onChange(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(newDigits.join(''));
    }
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().replace(/\D/g, '');
      if (!cleaned) return;

      const newDigits = [...code];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || '';
      }
      onChange(newDigits);

      const nextIndex = Math.min(cleaned.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (newDigits.every((d) => d !== '') && onComplete) {
        onComplete(newDigits.join(''));
      }
    } catch {
      // Clipboard read permission might not be granted; user can manually paste into boxes
    }
  };

  return (
    <div className="space-y-2">
      {/* 6 OTP Boxes */}
      <div className="flex items-center justify-between gap-2 sm:gap-2.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={code[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1} of 6`}
            className={`w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-semibold rounded-xl bg-surface text-on-surface border transition-all duration-150 outline-none ${
              error
                ? 'border-error text-error focus:ring-1 focus:ring-error'
                : code[index]
                ? 'border-coral bg-surface-container-high ring-1 ring-coral/30'
                : 'border-outline-variant/60 hover:border-outline-variant focus:border-coral focus:ring-1 focus:ring-coral'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      {/* Sub-helper Row */}
      <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
        <span>Tip: You can paste the complete 6-digit code</span>
        <button
          type="button"
          onClick={handlePasteClick}
          disabled={disabled}
          className="inline-flex items-center gap-1 text-deep-coral hover:text-coral transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Paste code</span>
        </button>
      </div>
    </div>
  );
}
