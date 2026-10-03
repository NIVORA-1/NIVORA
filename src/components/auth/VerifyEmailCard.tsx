'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient, isSupabaseConfigured, getSupabaseConfigStatus } from '@/lib/supabase/client';

interface VerifyEmailCardProps {
  email: string;
  onChangeEmail?: () => void;
  onBackToLogin?: () => void;
}

export default function VerifyEmailCard({
  email,
  onChangeEmail,
  onBackToLogin,
}: VerifyEmailCardProps) {
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // 60-second cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setStatusMessage(null);

    if (!email) {
      setStatusMessage({
        type: 'error',
        text: 'Missing email address to resend confirmation.',
      });
      return;
    }

    const configStatus = getSupabaseConfigStatus();
    if (!configStatus.isConfigured) {
      setStatusMessage({
        type: 'error',
        text: configStatus.errorMessage || 'Supabase authentication is pending configuration: NEXT_PUBLIC_SUPABASE_ANON_KEY is required in your .env file.',
      });
      return;
    }

    setIsResending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'http://localhost:3000';

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('[Verify Email] Resend failed:', error);
        setStatusMessage({
          type: 'error',
          text: error.message || 'Failed to resend verification email. Please wait a moment.',
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Verification link successfully resent to ${email}.`,
        });
        setResendCooldown(60);
      }
    } catch (err: any) {
      console.error('[Verify Email] Unexpected resend error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Connection error. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full space-y-6 text-on-surface">
      {/* Mail Envelope Icon with Soft Pulse */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-coral/15 border border-coral/30 flex items-center justify-center text-coral shadow-inner">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-deep-coral border-2 border-surface-container"></span>
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-sans tracking-tight text-on-surface">
          Check your email
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          We sent an official account verification link to your university email:
        </p>

        {/* Highlighted Email Badge */}
        <div className="pt-1.5 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-outline-variant/60 font-mono text-xs text-on-surface font-medium max-w-full break-all shadow-sm">
            <svg
              className="w-3.5 h-3.5 text-deep-coral shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
            <span>{email || 'your-email@university.edu'}</span>
          </div>
        </div>
      </div>

      {/* Instructions callout */}
      <div className="p-3.5 rounded-xl bg-surface/80 border border-outline-variant/40 text-xs text-on-surface-variant space-y-1.5 text-left">
        <div className="flex items-start gap-2.5">
          <svg
            className="w-4 h-4 text-deep-coral shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="space-y-1">
            <p className="text-on-surface font-medium">Activation Required</p>
            <p className="text-[11px] leading-normal text-on-surface-variant/80">
              Click the verification link inside the email to confirm your account and access your Nivora student workspace. Once verified, you will be redirected straight to onboarding.
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-coral/15 border-coral/30 text-on-surface'
              : 'bg-error/15 border-error/30 text-error'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <svg
              className="w-4 h-4 text-coral shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-error shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-1">
        {/* Resend Button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="w-full py-2.5 px-4 rounded-xl bg-deep-coral hover:bg-coral text-white font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Resending verification link...</span>
            </>
          ) : resendCooldown > 0 ? (
            <span>Resend available in {resendCooldown}s</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Resend Verification Email</span>
            </>
          )}
        </button>

        {/* Change email button */}
        {onChangeEmail && (
          <button
            type="button"
            onClick={onChangeEmail}
            className="w-full py-2 px-4 rounded-xl bg-surface hover:bg-surface-container-high border border-outline-variant/60 hover:border-outline-variant text-xs font-medium text-on-surface transition-all cursor-pointer shadow-sm"
          >
            Wrong email address? Change email
          </button>
        )}
      </div>

      {/* Footer / Back to Login */}
      <div className="pt-2 text-center text-xs text-on-surface-variant">
        Already clicked the link?{' '}
        {onBackToLogin ? (
          <button
            type="button"
            onClick={onBackToLogin}
            className="font-medium text-deep-coral hover:underline underline-offset-2 transition-colors"
          >
            Sign In Here →
          </button>
        ) : (
          <Link
            href="/login"
            className="font-medium text-deep-coral hover:underline underline-offset-2 transition-colors"
          >
            Sign In Here →
          </Link>
        )}
      </div>
    </div>
  );
}
