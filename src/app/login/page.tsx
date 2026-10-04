'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { useApp } from '@/context/AppContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, user, isLoadingUser } = useApp();

  // If already authenticated, redirect directly to dashboard
  useEffect(() => {
    if (!isLoadingUser && user) {
      if (user.profile && user.profile.onboardingCompleted === false) {
        router.replace('/onboarding');
      } else {
        router.replace('/home');
      }
    }
  }, [user, isLoadingUser, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if redirected after successful password reset or OAuth errors
  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setSuccessMessage('Password updated successfully. You can now sign in.');
    }

    const oauthError = searchParams.get('error');
    const providerParam = searchParams.get('provider') || 'OAuth';
    const messageParam = searchParams.get('message');

    if (oauthError) {
      if (oauthError === 'link_expired') {
        setError(messageParam || 'Your email verification link has expired or has already been used. Please request a new verification email.');
      } else if (oauthError === 'oauth_cancelled') {
        setError('Sign in was cancelled.');
      } else if (oauthError === 'oauth_not_configured') {
        setError(`${providerParam} authentication is not yet configured in server environment.`);
      } else if (oauthError === 'oauth_missing_email') {
        setError(`Unable to retrieve a verified email address from ${providerParam}.`);
      } else if (oauthError === 'oauth_state_mismatch') {
        setError('Security validation failed. Please try signing in again.');
      } else if (messageParam) {
        setError(messageParam);
      } else {
        setError(`Unable to complete sign in with ${providerParam}. Please try again or use your password.`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 || data.needsVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email || email)}&unconfirmed=true`);
          return;
        }
        setError(data.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      await refreshUser();
      if (data.user?.profile && data.user.profile.onboardingCompleted === false) {
        router.push('/onboarding');
      } else {
        router.push('/home');
      }
    } catch {
      setError('Unable to connect to NIVORA authentication services. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-[28px] font-bold font-sans tracking-tight text-on-surface">
          Welcome back.
        </h2>
        <p className="text-sm text-on-surface-variant">
          Continue your journey with NIVORA.
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-coral/15 border border-coral/30 text-xs text-on-surface flex items-center gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 text-coral shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-error/15 border border-error/30 text-xs text-error flex items-center gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Primary Social OAuth Buttons (Google + GitHub) */}
      <SocialLoginButtons disabled={isLoading} onError={(msg) => setError(msg)} />

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/40" />
        </div>
        <div className="relative flex justify-center text-[10px] font-mono tracking-widest uppercase">
          <span className="bg-surface-container px-3 text-on-surface-variant">OR CONTINUE WITH EMAIL</span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* Email Address */}
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
            placeholder="you@example.com"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/60 hover:border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-coral focus:ring-1 focus:ring-coral focus:outline-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-on-surface-variant">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-surface border border-outline-variant/60 hover:border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-coral focus:ring-1 focus:ring-coral focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
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

        {/* Remember me & Forgot password row */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-on-surface-variant hover:text-on-surface transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-surface border-outline-variant text-deep-coral focus:ring-0 focus:ring-offset-0 cursor-pointer accent-deep-coral"
            />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-deep-coral hover:underline underline-offset-2 transition-colors font-medium"
          >
            Forgot password?
          </Link>
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
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      {/* Create Account Link */}
      <div className="pt-2 text-center text-xs text-on-surface-variant">
        New to NIVORA?{' '}
        <Link
          href="/signup"
          className="font-medium text-deep-coral hover:underline underline-offset-2 transition-colors"
        >
          Create your account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      headlineWhite="Your student life,"
      headlineGreen="finally connected."
      description="Learn. Plan. Focus. Grow. Connect."
      diagramType="login"
    >
      <Suspense fallback={<div className="text-xs text-deep-coral py-8 text-center">Loading NIVORA sign in...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
