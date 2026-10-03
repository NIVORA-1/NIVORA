'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NivoraLogo from '@/components/ui/NivoraLogo';
import VerifyEmailCard from '@/components/auth/VerifyEmailCard';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const isUnconfirmed = searchParams.get('unconfirmed') === 'true';

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2 flex flex-col items-center">
        <NivoraLogo size="large" href="/" priority />
        <h1 className="text-2xl font-sans tracking-tight text-on-surface font-semibold pt-2">
          Verify Your University Email
        </h1>
        <p className="text-xs text-on-surface-variant">
          Complete email verification to activate your Nivora student workspace
        </p>
      </div>

      {isUnconfirmed && (
        <div className="p-3.5 rounded-xl bg-coral/15 border border-coral/30 text-xs text-on-surface flex items-center gap-2.5 animate-in fade-in duration-200">
          <svg className="w-4 h-4 text-coral shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Your university email is not verified yet. Please check your inbox for the link.</span>
        </div>
      )}

      {/* Verification Card */}
      <div className="rounded-2xl bg-surface-container border border-outline-variant/40 p-6 sm:p-8 shadow-2xl space-y-5">
        <VerifyEmailCard
          email={email}
          onChangeEmail={() => router.push('/signup')}
          onBackToLogin={() => router.push('/login')}
        />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 text-on-surface selection:bg-coral selection:text-white">
      <Suspense fallback={<div className="text-xs text-deep-coral py-8 text-center">Loading email verification...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
