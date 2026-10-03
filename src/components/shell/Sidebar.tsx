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
    ],
  },
  {
    label: 'Academics',
    items: [
      { name: 'Classes', href: '/classes', icon: 'event_seat' },
      { name: 'Assignments', href: '/assignments', icon: 'assignment' },
      { name: 'Exams', href: '/exams', icon: 'history_edu' },
      { name: 'Attendance', href: '/attendance', icon: 'how_to_reg' },
      { name: 'Subjects', href: '/subjects', icon: 'auto_stories' },
      { name: 'Resources', href: '/resources', icon: 'folder' },
    ],
  },
  {
    label: 'Life',
    items: [
      { name: 'Planner', href: '/planner', icon: 'calendar_today' },
      { name: 'Reboot', href: '/reboot', icon: 'self_improvement' },
      { name: 'Music', href: '/music', icon: 'headphones' },
    ],
  },
  {
    label: 'Growth & Community',
    items: [
      { name: 'Skills & Projects', href: '/skills', icon: 'psychology' },
      { name: 'Career', href: '/career', icon: 'work_outline' },
      { name: 'Community', href: '/community', icon: 'groups' },
      { name: 'Clubs & Events', href: '/clubs-and-events', icon: 'celebration' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useApp();

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
        className={`fixed left-0 top-0 h-screen w-[260px] bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Header */}
          <div className="px-space-lg pt-space-lg pb-space-md border-b border-outline-variant/20 flex items-center justify-between shrink-0">
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
          <nav className="px-space-xs py-space-sm space-y-space-md flex-1">
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

        {/* Bottom Bar: Ends cleanly with NIVORA AI Beta */}
        <div className="p-space-xs border-t border-outline-variant/20 bg-surface-container-lowest/40 shrink-0">
          <Link
            href="/nivora-ai"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors font-body-md text-body-md ${
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
        </div>
      </aside>
    </>
  );
}
