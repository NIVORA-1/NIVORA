'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordStrengthMeter, { evaluatePassword } from '@/components/auth/PasswordStrengthMeter';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signOutAllSessions, setSignOutAllSessions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const qToken = searchParams.get('token');
    const qEmail = searchParams.get('email');

    if (qToken) {
      setToken(qToken);
    } else if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('nivora_reset_token');
      if (stored) setToken(stored);
    }

    if (qEmail) {
      setEmail(qEmail);
    } else if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('nivora_reset_email');
      if (storedEmail) setEmail(storedEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset authorization session is missing or expired. Please request a new verification code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    const { score } = evaluatePassword(newPassword);
    if (score < 4) {
      setError('Password does not meet all required security criteria.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: token,
          newPassword,
          confirmPassword,
          signOutAllSessions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Clear reset session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nivora_reset_token');
        sessionStorage.removeItem('nivora_reset_email');
        sessionStorage.removeItem('nivora_dev_code');
      }

      setIsSuccess(true);
    } catch {
      setError('Unable to communicate with security services. Please check your connection.');
      setIsLoading(false);
    }
  };

  // Truncated email for display chip (e.g., alexander.chen...)
  const displayEmailChip = email
    ? email.length > 20
      ? `${email.slice(0, 18)}...`
      : email
    : 'Authenticated';

  return (
    <div className="space-y-6">
      {isSuccess ? (
        /* Success Experience */
        <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-coral/15 border border-coral/40 text-coral flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold font-sans tracking-tight text-on-surface">
              Password updated.
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
              Your password has been successfully changed. All prior sessions have been revoked.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push('/login?reset=success')}
              className="w-full py-3 rounded-xl bg-deep-coral hover:bg-coral text-white font-sans font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Sign in</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : (
        /* Set New Password Form */
        <>
          {/* Top Row: Back link & email indicator */}
          <div className="flex items-center justify-between">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to sign in</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/60 text-[11px] font-mono text-deep-coral">
              <span className="w-1.5 h-1.5 rounded-full bg-deep-coral" />
              <span>{displayEmailChip}</span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-[28px] font-bold font-sans tracking-tight text-on-surface">
              Set new password
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Create a resilient password that you haven&apos;t used before for this NIVORA account.
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
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono tracking-wider uppercase text-on-surface-variant">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  name="new_password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create your new password"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-surface border border-outline-variant/60 hover:border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-coral focus:ring-1 focus:ring-coral focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono tracking-wider uppercase text-on-surface-variant">
                CONFIRM NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  name="confirm_password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-surface border border-outline-variant/60 hover:border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-coral focus:ring-1 focus:ring-coral focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Live Password Strength Meter & Checklist */}
            <PasswordStrengthMeter password={newPassword} />

            {/* Sign out of all devices checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                <input
                  type="checkbox"
                  checked={signOutAllSessions}
                  onChange={(e) => setSignOutAllSessions(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-surface border-outline-variant text-deep-coral focus:ring-0 focus:ring-offset-0 cursor-pointer accent-deep-coral"
                />
                <div className="space-y-0.5">
                  <span className="font-medium text-on-surface block">
                    Sign out of all devices &amp; active sessions
                  </span>
                  <span className="text-[11px] text-on-surface-variant/70 block leading-tight">
                    Recommended if your old password was compromised or forgotten.
                  </span>
                </div>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full py-3 rounded-xl bg-deep-coral hover:bg-coral text-white font-sans font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Reset password &amp; continue</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Need help footer link */}
          <div className="text-center text-xs text-on-surface-variant pt-1">
            Need help?{' '}
            <Link
              href="/help"
              className="font-medium text-deep-coral hover:underline underline-offset-2 transition-colors"
            >
              Visit NIVORA Support Desk
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      stepBadge="AUTHENTICATION FLOW • STEP 3 OF 3"
      headlineWhite="Strengthen your gate,"
      headlineGreen="protect your progress."
      description="Your notes, semester milestones, and AI study models are secured with zero-knowledge vault credentials. Choose a new password to seal your workspace."
      diagramType="reset"
    >
      <Suspense fallback={<div className="text-xs text-deep-coral py-8 text-center">Loading security credentials...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
