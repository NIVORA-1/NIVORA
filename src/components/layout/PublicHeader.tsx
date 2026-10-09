'use client';

import React, { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const handleScroll = () => {
      if (!isMounted) return;
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScrollable > 0) {
        setPageScrollProgress(Math.min(Math.max(scrollY / totalScrollable, 0), 1));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      isMounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
      } else {
        window.location.href = `/#${sectionId}`;
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full px-4 sm:px-8 py-3 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border/70 shadow-sm'
          : 'bg-background/40 backdrop-blur-md border-b border-transparent'
      }`}
    >
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
                className={`relative py-1 tracking-wide cursor-pointer transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full shadow-[0_0_6px_#E85A4F]" />
                )}
              </button>
            );
          })}

          <div className="h-4 w-px bg-border/70" />

          {/* Theme Toggle Button */}
          <ThemeToggle />

          <Link
            href="/login"
            className="text-xs font-semibold text-on-surface-variant hover:text-on-surface px-2.5 py-1 transition-colors"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="px-4.5 py-2 rounded-full bg-primary text-white hover:bg-coral active:scale-95 text-xs font-bold tracking-wide shadow-sm shadow-primary/20 flex items-center gap-1.5 transition-all"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Mobile header controls */}
        <div className="flex md:hidden items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <Link
            href="/signup"
            className="px-3 py-1.5 rounded-full bg-primary text-white hover:bg-coral text-xs font-bold shrink-0 transition-colors shadow-sm"
          >
            Get Started →
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Subtle micro scroll-progress indicator line on the header bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-transparent overflow-hidden pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-secondary via-coral to-primary transition-all duration-75"
          style={{ width: `${pageScrollProgress * 100}%` }}
        />
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-3 border-t border-border/60 mt-3 space-y-2 bg-surface-container/95 backdrop-blur-xl rounded-xl p-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.sectionId)}
              className="block w-full text-left px-3.5 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-border/40 mt-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-3.5 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
