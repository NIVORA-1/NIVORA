'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import NivoraLogo from '@/components/ui/NivoraLogo';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { name: 'Home', href: '/home', icon: 'dashboard' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { name: 'Learning', href: '/learning', icon: 'local_library' },
      { name: 'Subjects', href: '/subjects', icon: 'auto_stories' },
      { name: 'Resources', href: '/resources', icon: 'folder' },
    ],
  },
  {
    label: 'Academics',
    items: [
      { name: 'Classes', href: '/classes', icon: 'event_seat' },
      { name: 'Assignments', href: '/assignments', icon: 'assignment' },
      { name: 'Exams', href: '/exams', icon: 'history_edu' },
      { name: 'Attendance', href: '/attendance', icon: 'how_to_reg' },
    ],
  },
  {
    label: 'Life',
    items: [
      { name: 'Planner', href: '/planner', icon: 'calendar_today' },
      { name: 'Reboot', href: '/reboot', icon: 'self_improvement' },
      { name: 'Music', href: '/music', icon: 'headphones' },
      { name: 'Connect', href: '/connect', icon: 'forum' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Skills', href: '/skills', icon: 'psychology' },
      { name: 'Projects', href: '/projects', icon: 'code' },
      { name: 'Career', href: '/career', icon: 'work_outline' },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Groups', href: '/community', icon: 'groups' },
      { name: 'Clubs & Events', href: '/clubs-and-events', icon: 'celebration' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen, currentStream, user, logout } = useApp();

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStreamTitle = () => {
    const year = user?.profile?.year || 3;
    switch (currentStream) {
      case 'BBA':
        return `BBA Year ${year}`;
      case 'MECH':
        return `B.Tech MECH Year ${year}`;
      case 'LAW':
        return `B.A. LL.B Year ${year}`;
      default:
        return `B.Tech CSE Year ${year}`;
    }
  };

  const isActive = (href: string) => {
    if (href === '/home' && (pathname === '/home' || pathname === '/dashboard')) return true;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="px-space-lg pt-space-lg pb-space-md border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center">
              <NivoraLogo size="medium" href="/home" priority />
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="px-space-xs py-space-sm space-y-space-md">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-space-sm py-1 font-label-tag text-label-tag text-on-surface-variant/90 font-bold uppercase tracking-widest">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-space-sm py-1.5 rounded-lg transition-colors font-body-md text-body-md ${
                        active
                          ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-space-xs">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            active ? 'filled text-on-secondary-container' : 'text-on-surface-variant'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-tag text-[9px] uppercase">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Bar: AI, Settings & Profile */}
        <div className="p-space-xs space-y-space-xs border-t border-outline-variant/20 bg-surface-container-lowest/40">
          <nav className="space-y-1">
            <Link
              href="/nivora-ai"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between px-space-sm py-1.5 rounded-lg transition-colors font-body-md text-body-md ${
                isActive('/nivora-ai')
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">smart_toy</span>
                <span>NIVORA AI</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-label-tag">
                Beta
              </span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg transition-colors font-body-md text-body-md ${
                isActive('/settings')
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg transition-colors font-body-md text-body-md text-on-surface-variant hover:bg-error-container/20 hover:text-error text-left cursor-pointer"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </nav>

          {/* Profile Card */}
          <Link
            href="/settings"
            className="flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-container border border-outline-variant/20 hover:border-outline-variant/60 transition-colors"
          >
            <div className="relative flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-outline-variant/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-headline-sm text-headline-sm font-semibold text-primary">
                  {getInitials(user?.name)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-headline-sm text-body-sm font-semibold text-on-surface truncate">
                {user?.name || 'Student'}
              </span>
              <span className="font-label-tag text-label-tag text-on-surface-variant truncate">
                {user?.profile?.degree ? `${user.profile.degree} • ${user.profile.streamCode}` : getStreamTitle()}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
