'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import NivoraLogo from '@/components/ui/NivoraLogo';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      await refreshUser();
      // Brand new account -> always route to onboarding
      router.push('/onboarding');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F171B] flex flex-col justify-center items-center p-4 text-[#F1F0E8] selection:bg-[#8FC5A7] selection:text-[#0F171B]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <NivoraLogo size="large" href="/" priority />
          <h1 className="text-2xl font-sans tracking-tight text-[#F1F0E8] font-normal pt-2">
            Create Your Nivora Account
          </h1>
          <p className="text-xs text-[#7f909a]">
            Join the personal student workspace for higher education
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl bg-[#172329] border border-[#29383D] p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#A6ADA9]">
                Full Student Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vinay Kumar"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F171B] border border-[#29383D] text-[#F1F0E8] text-xs focus:border-[#8FC5A7] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#A6ADA9]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@university.edu"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F171B] border border-[#29383D] text-[#F1F0E8] text-xs focus:border-[#8FC5A7] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#A6ADA9]">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create secure password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F171B] border border-[#29383D] text-[#F1F0E8] text-xs focus:border-[#8FC5A7] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 rounded-lg bg-[#8FC5A7] text-[#0F171B] hover:bg-[#aae1c2] transition-all font-sans font-semibold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Continue to Workspace Setup'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Existing account link */}
        <div className="text-center font-sans text-xs text-[#747F7B]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#8FC5A7] font-semibold hover:underline">
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
}
