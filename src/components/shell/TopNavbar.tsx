'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NivoraLogo from '@/components/ui/NivoraLogo';

export default function TopNavbar() {
  const pathname = usePathname();
  const { setIsSidebarOpen, setIsCommandPaletteOpen, setIsQuickAddOpen, currentStream, user, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetch('/api/notifications')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [user?.id]);

  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Student')}&backgroundColor=172329&textColor=8fc5a7`;

  const getBreadcrumb = () => {
    if (pathname === '/home' || pathname === '/dashboard') {
      return { core: 'HOME', page: 'Tuesday, September 8' };
    }
    if (pathname.startsWith('/tour')) {
      return { core: 'ECOSYSTEM', page: 'Architecture & Tour' };
    }
    if (pathname.startsWith('/learning')) {
      return { core: 'ACADEMIC CORE', page: 'Console' };
    }
    if (pathname.startsWith('/subjects')) {
      return { core: 'ACADEMIC CORE', page: 'Subjects' };
    }
    if (pathname.startsWith('/resources')) {
      return { core: 'ACADEMIC CORE', page: 'Learning Vault' };
    }
    if (pathname.startsWith('/classes')) {
      return { core: 'ACADEMIC CORE', page: 'Lecture Schedule' };
    }
    if (pathname.startsWith('/assignments')) {
      return { core: 'ACADEMIC CORE', page: 'Assignments' };
    }
    if (pathname.startsWith('/exams')) {
      return { core: 'ACADEMIC CORE', page: 'Assessment Cadence' };
    }
    if (pathname.startsWith('/attendance')) {
      return { core: 'ACADEMIC CORE', page: 'Attendance Cadence' };
    }
    if (pathname.startsWith('/planner')) {
      return { core: 'TEMPORAL ARCHITECTURE', page: 'Active Timeline' };
    }
    if (pathname.startsWith('/reboot')) {
      return { core: 'TELEMETRY', page: 'Cognitive Protocol' };
    }
    if (pathname.startsWith('/music') || pathname.startsWith('/connect')) {
      return { core: 'LIFE CORE', page: 'Acoustics & Peer Spaces' };
    }
    if (pathname.startsWith('/skills') || pathname.startsWith('/projects')) {
      return { core: 'GROWTH ENGINE', page: 'Artifacts & Competencies' };
    }
    if (pathname.startsWith('/career')) {
      return { core: 'GROWTH ENGINE', page: 'Career & Placement Pipeline' };
    }
    if (pathname.startsWith('/nivora-ai')) {
      return { core: 'ACADEMIC CORE', page: 'Cognitive Engine' };
    }
    return { core: 'NIVORA', page: pathname.replace('/', '').toUpperCase() };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/20 z-40 px-4 sm:px-space-xl flex items-center justify-between">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-space-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          aria-label="Toggle navigation"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Mobile brand mark */}
        <div className="lg:hidden flex items-center">
          <NivoraLogo size="compact" href="/home" priority />
        </div>

        <div className="hidden sm:flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
          <span className="uppercase tracking-widest text-on-surface-variant font-semibold">
            {breadcrumb.core}
          </span>
          <span className="text-outline font-bold">/</span>
          <span className="text-primary font-bold truncate max-w-[140px] sm:max-w-none">
            {breadcrumb.page}
          </span>
        </div>
      </div>

      {/* Right: Search, Quick Add, Notifications, AI Assist, Profile */}
      <div className="flex items-center gap-space-xs sm:gap-space-md">
        {/* Search trigger */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-space-xs px-2.5 sm:px-space-sm py-1 rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface-variant cursor-pointer hover:border-outline-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span className="hidden sm:inline font-body-sm text-body-sm pr-space-md font-medium">
            Search...
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag border border-outline-variant/40 font-medium">
            ⌘K
          </kbd>
        </div>

        {/* Quick Add Universal Trigger */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="p-1.5 rounded-lg text-primary bg-surface-container hover:bg-surface-container-high transition-colors"
          title="Universal Quick Add"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {notifications.some((n) => !n.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-2xl p-space-md z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-xs">
                <div className="flex items-center gap-1">
                  <span className="font-headline-sm text-body-sm font-semibold text-on-surface">Notifications</span>
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-[9px]">
                      {notifications.filter((n) => !n.isRead).length} New
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-on-surface-variant hover:text-on-surface text-xs"
                >
                  Close
                </button>
              </div>

              <div className="space-y-space-xs max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-primary">
                        <span>{n.title}</span>
                        <span className="font-label-mono-wide text-[10px] text-on-surface-variant">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">{n.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center space-y-1.5">
                    <div className="w-8 h-8 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">done_all</span>
                    </div>
                    <p className="text-body-sm text-on-surface font-medium">You&apos;re all caught up.</p>
                    <p className="text-[11px] text-on-surface-variant">No unread alerts or notifications.</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-outline-variant/20 mt-2 text-center">
                <Link
                  href="/planner"
                  onClick={() => setShowNotifications(false)}
                  className="text-primary font-button-text text-body-sm hover:underline"
                >
                  View All in Academic Planner →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* AI Assist CTA button */}
        <Link
          href="/nivora-ai"
          className="flex items-center gap-space-2xs px-2.5 sm:px-space-sm py-1.5 rounded-lg bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors font-button-text text-button-text"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span className="hidden sm:inline">AI Assist</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-4 w-px bg-outline-variant/40 hidden sm:block" />

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center focus:outline-none"
            aria-label="User profile menu"
          >
            <img
              alt={user?.name || 'Profile'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40 hover:ring-primary transition-all cursor-pointer"
              src={avatarUrl}
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-high border border-outline-variant/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-outline-variant/20 mb-1">
                <div className="font-headline-sm text-body-sm font-semibold text-on-surface">
                  {user?.name || 'Student'}
                </div>
                <div className="font-label-tag text-[10px] text-primary uppercase font-mono tracking-wider">
                  {currentStream} • Year {user?.profile?.year || 3}
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                <span>Workspace Settings</span>
              </Link>

              <div className="pt-1 mt-1 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
