'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface PublicHeaderProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

export default function PublicHeader({
  activeSection = '',
  onNavigate,
}: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'features', label: 'Features', sectionId: 'philosophy' },
    { id: 'curriculum', label: 'Curriculum', sectionId: 'modules' },
    { id: 'connect', label: 'Connect', sectionId: 'connect' },
  ];

  const handleItemClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F171B]/90 backdrop-blur-xl border-b border-[#29383D]/60 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Official NIVORA Brand Logo */}
        <div className="flex items-center shrink-0">
          <NivoraLogo
            size="responsive"
            href="/"
            onClick={() => handleItemClick('hero')}
            priority
          />
        </div>

        {/* Right Desktop Nav: Features, Curriculum, Connect, ThemeToggle, Login, Get Started */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7 font-sans text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.sectionId)}
                className={`relative py-1 tracking-wide cursor-pointer ${
                  isActive ? 'text-[#8FC5A7]' : 'text-[#A6ADA9]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#8FC5A7] rounded-full" />
                )}
              </button>
            );
          })}

          <div className="h-4 w-px bg-[#29383D]" />

          {/* Theme Toggle Button */}
          <ThemeToggle />

          <Link
            href="/login"
            className="text-xs font-semibold text-[#A6ADA9] px-2 py-1"
          >
            Login
          </Link>

          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full bg-[#8FC5A7] text-[#0F171B] text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Mobile header controls */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2.5 shrink-0">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-2.5 py-1 rounded-full bg-[#8FC5A7] text-[#0F171B] text-xs font-bold shrink-0"
          >
            Get Started →
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-lg text-[#A6ADA9]"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 border-t border-[#29383D]/60 mt-3 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.sectionId)}
              className="block w-full text-left px-3 py-2 text-xs font-medium text-[#A6ADA9] rounded-lg"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
