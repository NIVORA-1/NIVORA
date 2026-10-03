'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to dispatch verification code. Please try again.');
        setIsLoading(false);
        return;
      }

      // Store email and devCode (if in development) for the verification screen
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nivora_reset_email', cleanEmail);
        if (data.devCode) {
          sessionStorage.setItem('nivora_dev_code', data.devCode);
        }
      }

      // Smoothly navigate to the code verification step
      router.push(`/verify-code?email=${encodeURIComponent(cleanEmail)}`);
    } catch {
      setError('Unable to reach NIVORA security services. Please check your network connection.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headlineWhite="Restore your access,"
      headlineGreen="resume your flow."
      description="Your academic workspace, study plans, and project hubs are waiting right where you left them."
      diagramType="forgot"
    >
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to sign in</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-[28px] font-bold font-sans tracking-tight text-on-surface">
            Reset your password.
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Enter your registered email address and we&apos;ll send you a secure verification link to reset your credentials.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-error/15 border border-error/30 text-xs text-error flex items-center gap-2.5 animate-in fade-in">
            <svg className="w-4 h-4 shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-on-surface-variant">
              Email address
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="new-email"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com or your .edu address"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/60 hover:border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-coral focus:ring-1 focus:ring-coral focus:outline-none transition-all disabled:opacity-50"
            />
            <p className="text-[11px] text-on-surface-variant/70 pt-0.5">
              Tip: Use your university email if your institution provided your NIVORA license.
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-deep-coral hover:bg-coral text-white font-sans font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending code...</span>
              </>
            ) : (
              <span>Send reset link</span>
            )}
          </button>
        </form>

        {/* Help Center Callout Box */}
        <div className="rounded-xl bg-surface-container border border-outline-variant/40 p-3.5 text-xs text-on-surface-variant leading-relaxed">
          Having trouble accessing your institutional inbox? Contact your campus IT administrator or visit the{' '}
          <Link href="/help" className="text-deep-coral hover:underline underline-offset-2 font-medium">
            NIVORA Help Center
          </Link>
          .
        </div>

        {/* Back to sign in link */}
        <div className="text-center text-xs text-on-surface-variant pt-1">
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-medium text-deep-coral hover:underline underline-offset-2 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
