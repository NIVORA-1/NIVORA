'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import VerificationCodeInput from '@/components/auth/VerificationCodeInput';

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Extract email from query params or sessionStorage
  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail);
    } else if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('nivora_reset_email');
      if (stored) {
        setEmail(stored);
      } else {
        // If no email is found, prompt them to start from forgot-password
        setEmail('student@university.edu');
      }

      // Check if a dev code was stored in development mode
      const devCode = sessionStorage.getItem('nivora_dev_code');
      if (devCode && devCode.length === 6) {
        setInfoMessage(`Development Mode: Auto-detected verification code: ${devCode}`);
      }
    }
  }, [searchParams]);

  // 10-minute expiry countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid verification code. Please check and try again.');
        setIsLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nivora_reset_token', data.resetToken);
      }

      router.push(`/reset-password?token=${encodeURIComponent(data.resetToken)}&email=${encodeURIComponent(email)}`);
    } catch {
      setError('Unable to verify security code. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setTimeLeft(600); // Reset 10m timer
        setResendCooldown(60); // 60s cooldown
        setDigits(['', '', '', '', '', '']);
        if (data.devCode && typeof window !== 'undefined') {
          sessionStorage.setItem('nivora_dev_code', data.devCode);
          setInfoMessage(`New verification code sent! Dev code: ${data.devCode}`);
        } else {
          setInfoMessage('A new verification code has been dispatched to your inbox.');
        }
      } else {
        setError(data.error || 'Failed to resend verification code.');
      }
    } catch {
      setError('Failed to resend code due to a network error.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#80919b] hover:text-[#dbe4e9] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to sign in</span>
        </Link>
      </div>

      {/* Check your inbox pill banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#142026] border border-[#22353f]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#192830] border border-[#273d49] flex items-center justify-center text-[#8fc5a7] shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#e8eff2]">Check your inbox</p>
            <p className="text-xs text-[#80919b] font-mono truncate">{email}</p>
          </div>
        </div>
        <Link
          href="/forgot-password"
          className="text-xs text-[#8fc5a7] hover:underline font-medium shrink-0 ml-2"
        >
          Edit
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-[28px] font-bold font-sans tracking-tight text-[#e8eff2]">
          Enter verification code
        </h2>
        <p className="text-sm text-[#7f909a] leading-relaxed">
          Type the 6-digit authentication token sent to your email to verify your session.
        </p>
      </div>

      {/* Info / Dev Message */}
      {infoMessage && (
        <div className="p-3 rounded-xl bg-[#8fc5a7]/10 border border-[#8fc5a7]/25 text-xs text-[#b7efcf] flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-[#8fc5a7] shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/25 text-xs text-[#ffb4ab] flex items-center gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0 text-[#ffb4ab]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Code Input Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          {/* Label row with countdown timer */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#c0c9c1]">Verification code</span>
            <span className={`font-mono ${timeLeft < 60 ? 'text-[#ffb4ab] font-bold animate-pulse' : 'text-[#8fc5a7]'}`}>
              Expires in {formatTimer(timeLeft)}
            </span>
          </div>

          <VerificationCodeInput
            code={digits}
            onChange={setDigits}
            onComplete={() => {}}
            disabled={isLoading || timeLeft <= 0}
            error={Boolean(error)}
          />
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading || timeLeft <= 0 || digits.some((d) => d === '')}
          className="w-full py-3 rounded-xl bg-[#8fc5a7] hover:bg-[#a3d9bc] text-[#0a1610] font-sans font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0a1610]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <span>Verify &amp; continue</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Resend Code row */}
      <div className="flex items-center justify-between text-xs text-[#7f909a] pt-1">
        <span>Didn&apos;t receive the email?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="inline-flex items-center gap-1.5 text-[#8fc5a7] hover:text-[#b7efcf] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : isResending
              ? 'Sending...'
              : 'Resend code'}
          </span>
        </button>
      </div>

      {/* Spam filter info callout */}
      <div className="rounded-xl bg-[#131f25] border border-[#1e3039] p-3.5 text-xs text-[#7f909a] leading-relaxed">
        Using an institutional account? Campus spam filters can delay emails by 1–2 minutes. Check your junk folder or visit the{' '}
        <Link href="/help" className="text-[#8fc5a7] hover:underline underline-offset-2 font-medium">
          NIVORA IT Help Center
        </Link>
        .
      </div>

      {/* Direct webmail shortcuts */}
      <div className="flex items-center justify-center gap-3 text-xs text-[#7f909a] pt-1">
        <span>Open:</span>
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#c0c9c1] hover:text-[#8fc5a7] transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          <span>Gmail</span>
        </a>
        <span>•</span>
        <a
          href="https://outlook.office.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#c0c9c1] hover:text-[#8fc5a7] transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.5 4h-19C1.67 4 1 4.67 1 5.5v13c0 .83.67 1.5 1.5 1.5h19c.83 0 1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5zm-9.5 8L3.5 6.5h17L12 12zm8 6.5H4v-10l8 5 8-5v10z" />
          </svg>
          <span>Outlook</span>
        </a>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <AuthLayout
      headlineWhite="Security verified,"
      headlineGreen="focus uninterrupted."
      description="We sent a 6-digit security code to your student email. Enter it below to confirm your identity and unlock your workspace."
      diagramType="verify"
    >
      <Suspense fallback={<div className="text-xs text-[#8fc5a7] py-8 text-center">Loading verification portal...</div>}>
        <VerifyCodeContent />
      </Suspense>
    </AuthLayout>
  );
}
