'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface QuickResult {
  id: string;
  title: string;
  category: 'Navigation' | 'Slash Command' | 'Subject' | 'Topic' | 'Action';
  icon: string;
  action: () => void;
  badge?: string;
}

export default function CommandPaletteModal() {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, startResetSession } = useApp();
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (path: string) => {
    setIsCommandPaletteOpen(false);
    router.push(path);
  };

  const defaultItems: QuickResult[] = [
    // Slash commands
    { id: 'sc-1', title: '/explain-concept Bernstein 3NF Synthesis candidate key check', category: 'Slash Command', icon: 'terminal', badge: 'AI Copilot', action: () => navigateTo('/nivora-ai?q=/explain-concept+Bernstein+3NF+Synthesis') },
    { id: 'sc-2', title: '/solve-pyq GATE 2024 DBMS B+ Tree leaf capacity query', category: 'Slash Command', icon: 'terminal', badge: 'PYQ Solver', action: () => navigateTo('/nivora-ai?q=/solve-pyq+DBMS+B+Tree') },
    { id: 'sc-3', title: '/simulate-attendance 2 absences CS-301 DBMS impact', category: 'Slash Command', icon: 'science', badge: 'Simulator', action: () => navigateTo('/attendance') },
    { id: 'sc-4', title: '/quiz-me 5 questions on AVL Tree Rotations and Height Invariants', category: 'Slash Command', icon: 'psychology', badge: 'Quiz', action: () => navigateTo('/subjects/CS-301?tab=quizzes') },
    
    // Quick navigation
    { id: 'nav-1', title: 'Home Command Center', category: 'Navigation', icon: 'dashboard', action: () => navigateTo('/home') },
    { id: 'nav-2', title: 'My Learning & Active Tracks', category: 'Navigation', icon: 'local_library', action: () => navigateTo('/learning') },
    { id: 'nav-3', title: 'Database Management Systems (CS-301)', category: 'Subject', icon: 'auto_stories', badge: 'Active Course', action: () => navigateTo('/subjects/CS-301') },
    { id: 'nav-4', title: 'Data Structures & Algorithms (CS-302)', category: 'Subject', icon: 'auto_stories', badge: 'Active Course', action: () => navigateTo('/subjects') },
    { id: 'nav-5', title: 'Resource Vault (284 Indexed Assets)', category: 'Navigation', icon: 'folder', action: () => navigateTo('/resources') },
    { id: 'nav-6', title: 'Academic Planner & Timeline Calendar', category: 'Navigation', icon: 'calendar_today', action: () => navigateTo('/planner') },
    { id: 'nav-7', title: 'Reboot & Digital Balance Telemetry', category: 'Navigation', icon: 'self_improvement', action: () => navigateTo('/reboot') },
    { id: 'nav-8', title: 'Music & Connect Lounges', category: 'Navigation', icon: 'headphones', action: () => navigateTo('/music') },
    { id: 'nav-9', title: 'Career & Recruiter Dossier (Jane Street Pipeline)', category: 'Navigation', icon: 'work_outline', action: () => navigateTo('/career') },
    { id: 'nav-10', title: 'Skills & Projects (Raft Consensus Proofs)', category: 'Navigation', icon: 'code', action: () => navigateTo('/skills') },
    
    // Quick Actions
    { id: 'act-1', title: 'Start 25m Deep Work Reset Session', category: 'Action', icon: 'timelapse', badge: 'Cognitive Reset', action: () => { setIsCommandPaletteOpen(false); startResetSession(25); } },
    { id: 'act-2', title: 'Launch SQL Scratchpad Drawer', category: 'Action', icon: 'terminal', badge: 'Interactive', action: () => navigateTo('/subjects/CS-301') },
  ];

  const filteredItems = query
    ? defaultItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : defaultItems;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-outline-variant/30 bg-surface-container">
          <span className="material-symbols-outlined text-primary text-[22px] mr-3">terminal</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsCommandPaletteOpen(false);
              if (e.key === 'Enter' && filteredItems.length > 0) {
                filteredItems[0].action();
              }
            }}
            placeholder="Ask NIVORA AI or type slash commands (/solve-pyq, /explain-concept)..."
            className="w-full bg-transparent text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag border border-outline-variant/30">
            ESC
          </kbd>
        </div>

        {/* Slash Command Tags Strip */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-outline-variant/20 bg-surface-container-lowest/50">
          <span className="font-label-tag text-[9px] uppercase tracking-widest text-on-surface-variant/70">
            Suggested:
          </span>
          <button
            onClick={() => setQuery('/solve-pyq ')}
            className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-tag text-[10px] hover:bg-secondary-container transition-colors"
          >
            /solve-pyq
          </button>
          <button
            onClick={() => setQuery('/explain-concept ')}
            className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-[10px]"
          >
            /explain-concept
          </button>
          <button
            onClick={() => setQuery('/debug-code ')}
            className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-tag text-[10px] hover:bg-secondary-container transition-colors"
          >
            /debug-code
          </button>
          <button
            onClick={() => setQuery('/simulate-attendance ')}
            className="px-2 py-0.5 rounded-full bg-surface-container text-tertiary font-label-tag text-[10px] hover:bg-surface-container-highest transition-colors"
          >
            /simulate-attendance
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-outline-variant mb-2">
                manage_search
              </span>
              <p className="font-body-md text-on-surface">No exact command found</p>
              <p className="text-body-sm text-on-surface-variant/70 mt-1">
                Press Enter to run &quot;{query}&quot; directly in NIVORA AI Assistant.
              </p>
              <button
                onClick={() => navigateTo(`/nivora-ai?q=${encodeURIComponent(query)}`)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text"
              >
                Send to Copilot →
              </button>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={item.action}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-surface-container-high group-hover:bg-secondary-container group-hover:text-on-secondary-container flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-on-surface text-sm truncate font-medium">
                      {item.title}
                    </span>
                    <span className="font-label-tag text-[10px] text-on-surface-variant/70">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-tag text-[10px]">
                      {item.badge}
                    </span>
                  )}
                  {index === 0 && (
                    <span className="hidden sm:inline font-label-mono-wide text-[10px] text-on-surface-variant/50">
                      ↵ select
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-outline-variant/20 bg-surface-container text-xs text-on-surface-variant flex items-center justify-between font-label-mono-wide text-[10px]">
          <span>Autonomous Academic Copilot &amp; Synthesizer</span>
          <span>NIVORA SCHOLAR-4.5</span>
        </div>
      </div>
    </div>
  );
}
