'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface TourHeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function TourHeader({
  activeSection,
  onNavigate,
  isFullscreen,
  onToggleFullscreen,
}: TourHeaderProps) {
  const { currentStream, user } = useApp();

  const navItems = [
    { id: 'features', label: 'Features', sectionId: 'philosophy' },
    { id: 'curriculum', label: 'Curriculum', sectionId: 'modules' },
    { id: 'connect', label: 'Connect', sectionId: 'connect' },
  ];

  return (
    <nav className="sticky top-0 z-30 w-full bg-[#0F171B]/95 backdrop-blur-xl border-b border-[#29383D]/60 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Official NIVORA Brand Logo */}
        <div className="flex items-center gap-3">
          <NivoraLogo size="responsive" href="/" priority />

          {/* Current Stream Pill */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#172329] border border-[#29383D] text-[10px] font-mono text-[#8FC5A7] tracking-wider uppercase ml-2 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FC5A7] animate-pulse" />
            {currentStream} ACTIVE
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden sm:flex items-center gap-6 md:gap-8 font-sans text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.sectionId)}
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
        </div>

        {/* Right Actions: Fullscreen, ThemeToggle, Login, Get Started */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg text-[#747F7B] cursor-pointer"
              title={isFullscreen ? 'Exit Immersive View' : 'Enter Immersive View'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          )}

          <Link
            href="/login"
            className="text-xs font-semibold text-[#A6ADA9] px-2 py-1"
          >
            Login
          </Link>

          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full bg-[#8FC5A7] text-[#0F171B] text-xs font-bold tracking-wide shadow-sm flex items-center gap-1"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </Link>

          {/* User Profile Thumbnail if logged in */}
          {user && (
            <Link
              href="/settings"
              className="relative hidden xs:block w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#8FC5A7]/70 ml-1"
              title="Profile Settings"
            >
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Student')}&backgroundColor=172329&textColor=8fc5a7`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
