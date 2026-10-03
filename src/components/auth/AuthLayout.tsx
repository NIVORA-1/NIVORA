'use client';

import React from 'react';
import Link from 'next/link';
import AuthDiagram, { DiagramType } from './AuthDiagram';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface AuthLayoutProps {
  stepBadge?: string;
  headlineWhite: string;
  headlineGreen: string;
  description: string;
  diagramType: DiagramType;
  children: React.ReactNode;
}

export default function AuthLayout({
  stepBadge,
  headlineWhite,
  headlineGreen,
  description,
  diagramType,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex flex-col justify-between p-4 sm:p-8 selection:bg-coral selection:text-white relative overflow-x-clip transition-colors duration-250">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-coral/[0.05] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-muted-sand/[0.1] rounded-full blur-3xl pointer-events-none" />

      {/* Top step badge if present */}
      <div className="w-full max-w-6xl mx-auto pt-2 pb-4">
        {stepBadge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-border text-[10px] font-mono tracking-widest text-primary uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
            <span>{stepBadge}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left branding & diagram, Right card */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex items-center justify-center my-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column (Branding & Diagram) */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-7 flex flex-col justify-center">
            {/* Official NIVORA Brand Logo */}
            <div className="mb-1">
              <NivoraLogo size="large" href="/" priority />
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-sans tracking-tight leading-[1.15] text-on-surface">
                {headlineWhite}
                <br />
                <span className="text-primary font-serif italic">{headlineGreen}</span>
              </h1>
              <p className="text-sm sm:text-[15px] text-on-surface-variant leading-relaxed max-w-md">
                {description}
              </p>
            </div>

            {/* Diagram Card */}
            <div className="pt-2">
              <AuthDiagram type={diagramType} />
            </div>
          </div>

          {/* Right Column (Elevated Card) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[460px] rounded-2xl bg-surface-container border border-border p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-4 text-center text-xs text-on-surface-variant font-sans">
        By continuing, you agree to NIVORA&apos;s{' '}
        <Link href="/terms" className="text-primary hover:text-coral underline underline-offset-2 transition-colors">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-primary hover:text-coral underline underline-offset-2 transition-colors">
          Privacy Policy
        </Link>
        .
      </footer>
    </div>
  );
}
