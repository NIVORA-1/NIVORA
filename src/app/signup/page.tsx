'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NivoraLogo from '@/components/ui/NivoraLogo';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import VerifyEmailCard from '@/components/auth/VerifyEmailCard';
import { createSupabaseBrowserClient, isSupabaseConfigured, getSupabaseConfigStatus } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const password = formData.password;

    // 1. Client-side input validations
    if (cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid university email address.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    // 2. Supabase configuration validation
    const configStatus = getSupabaseConfigStatus();
    if (!configStatus.isConfigured) {
      setError(
        configStatus.errorMessage ||
        'Supabase authentication is pending configuration: NEXT_PUBLIC_SUPABASE_ANON_KEY is required in your .env file.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'http://localhost:3000';

      // 3. Supabase Auth email/password signup with PKCE callback
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('[Signup] Supabase signUp failed:', signUpError);
        const msg = signUpError.message || '';
        const lower = msg.toLowerCase();

        if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('taken')) {
          setError('This email address is already registered. Please sign in or use another email.');
        } else if (lower.includes('password') && (lower.includes('short') || lower.includes('least 6') || lower.includes('weak'))) {
          setError('Password is too weak. Please use at least 6 characters.');
        } else if (lower.includes('valid email') || lower.includes('invalid format')) {
          setError('Please enter a valid university email address.');
        } else if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
          setError('Verification email rate limit exceeded. Please wait a moment before trying again.');
        } else {
          setError(msg || 'Failed to send verification email. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // 4. Check for existing user identity suppression (Supabase email enumeration prevention)
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setError('This email address is already registered. Please sign in or reset your password.');
        setIsLoading(false);
        return;
      }

      // 5. Account created and REAL verification email dispatched by Supabase
      // An unverified user is NOT allowed to enter dashboard/onboarding.
      // Transition to professional "Verify your email" screen.
      setSubmittedEmail(cleanEmail);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[Signup] Unexpected signup error:', err);
      setError(err?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 text-on-surface selection:bg-coral selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <NivoraLogo size="large" href="/" priority />
          <h1 className="text-2xl font-sans tracking-tight text-on-surface font-semibold pt-2">
            {isSubmitted ? 'Verify Your University Email' : 'Create Your Nivora Account'}
          </h1>
          <p className="text-xs text-on-surface-variant">
            {isSubmitted
              ? 'Complete email verification to activate your student workspace'
              : 'Join the personal student workspace for higher education'}
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl bg-surface-container border border-outline-variant/40 p-6 sm:p-8 shadow-2xl space-y-5">
          {isSubmitted ? (
            /* Post-Signup Verification Screen */
            <VerifyEmailCard
              email={submittedEmail}
              onChangeEmail={() => {
                setIsSubmitted(false);
                setError('');
              }}
              onBackToLogin={() => router.push('/login')}
            />
          ) : (
            /* Registration Form */
            <>
              {error && (
                <div className="p-3 rounded-lg bg-error/15 border border-error/30 text-error text-xs animate-in fade-in duration-200">
                  {error}
                </div>
              )}

              {/* Social OAuth Signup */}
              <SocialLoginButtons disabled={isLoading} onError={(msg) => setError(msg)} />

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/40" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono tracking-widest uppercase">
                  <span className="bg-surface-container px-3 text-on-surface-variant">OR REGISTER WITH EMAIL</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div className="space-y-1">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="off"
                    spellCheck={false}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vinay Kumar"
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:border-coral focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    University Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="new-email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@university.edu"
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:border-coral focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Password (min. 6 characters)
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create secure password"
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-outline-variant/60 text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:border-coral focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 mt-2 rounded-lg bg-deep-coral text-white hover:bg-coral transition-all font-sans font-semibold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Verification Email...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Verify</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Existing account link */}
              <div className="text-center font-sans text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
                Already have an account?{' '}
                <Link href="/login" className="text-deep-coral font-semibold hover:underline">
                  Sign In Here →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
