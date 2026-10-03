'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: string;
  action: () => void;
}

const STATIC_SEARCH_TARGETS = [
  { id: 'page-home', title: 'Home Dashboard', subtitle: 'Academic Command Center & Progress', category: 'Page', icon: 'dashboard', path: '/home' },
  { id: 'page-subjects', title: 'Subjects & Curriculum', subtitle: 'Course Syllabi, Credits & Faculty', category: 'Academic', icon: 'menu_book', path: '/subjects' },
  { id: 'page-dbms', title: 'Database Management Systems (CS-301)', subtitle: 'Relational Model, Normalization & SQL', category: 'Subject', icon: 'auto_stories', path: '/subjects/CS-301' },
  { id: 'page-dsa', title: 'Data Structures & Algorithms (CS-302)', subtitle: 'Trees, Graphs, Dynamic Programming', category: 'Subject', icon: 'auto_stories', path: '/subjects' },
  { id: 'page-learning', title: 'Learning & Active Tracks', subtitle: 'Interactive Modules & Mastery', category: 'Academic', icon: 'local_library', path: '/learning' },
  { id: 'page-resources', title: 'Resource Vault', subtitle: 'Indexed Academic Notes & Textbooks', category: 'Resources', icon: 'folder', path: '/resources' },
  { id: 'page-classes', title: 'Lecture Schedule', subtitle: 'Weekly Timetable & Venues', category: 'Schedule', icon: 'schedule', path: '/classes' },
  { id: 'page-assignments', title: 'Assignments & Submissions', subtitle: 'Coursework Deadlines & Trackers', category: 'Academic', icon: 'assignment', path: '/assignments' },
  { id: 'page-exams', title: 'Assessment Cadence & Exams', subtitle: 'Mid-term & End-term Examination Schedule', category: 'Academic', icon: 'quiz', path: '/exams' },
  { id: 'page-attendance', title: 'Attendance Cadence & Compliance', subtitle: 'Subject-wise Percentage & Statutory Buffers', category: 'Academic', icon: 'how_to_reg', path: '/attendance' },
  { id: 'page-planner', title: 'Academic Planner & Timeline', subtitle: 'Calendar, Milestones & Deadlines', category: 'Planning', icon: 'calendar_today', path: '/planner' },
  { id: 'page-reboot', title: 'Reboot & Cognitive Telemetry', subtitle: 'Digital Wellbeing, Focus Score & Reset Sessions', category: 'Wellbeing', icon: 'self_improvement', path: '/reboot' },
  { id: 'page-health', title: 'Health Manager & Student Wellness', subtitle: 'Workouts, Hydration, Sleep, Nutrition & Vitality', category: 'Wellness', icon: 'favorite', path: '/health' },
  { id: 'page-health-gym', title: 'Gym & Workout Manager', subtitle: 'Custom Schedules, Active Tracker & Exercise Library', category: 'Wellness', icon: 'fitness_center', path: '/health?tab=gym' },
  { id: 'page-health-water', title: 'Water Intake Tracker', subtitle: 'Daily Hydration Cadence & Quick Logs', category: 'Wellness', icon: 'water_drop', path: '/health?tab=water' },
  { id: 'page-health-sleep', title: 'Sleep & Recovery Telemetry', subtitle: 'Overnight Sleep Cycles & Duration Logs', category: 'Wellness', icon: 'bedtime', path: '/health?tab=sleep' },
  { id: 'page-health-nutrition', title: 'Nutrition & Meal Vault', subtitle: 'Daily Meals, Macronutrients & Fueling Notes', category: 'Wellness', icon: 'restaurant', path: '/health?tab=nutrition' },
  { id: 'page-health-goals', title: 'Health & Wellness Goals', subtitle: 'Active Milestones & Completion Cadence', category: 'Wellness', icon: 'flag', path: '/health?tab=goals' },
  { id: 'page-health-progress', title: 'Health Progress & PRs', subtitle: 'Consistency Trends, Personal Records & Metrics', category: 'Wellness', icon: 'trending_up', path: '/health?tab=progress' },
  { id: 'page-music', title: 'Music & Focus Lounges', subtitle: 'Binaural Gamma Beats & Lo-Fi Study Companion', category: 'Audio', icon: 'headphones', path: '/music' },
  { id: 'page-skills', title: 'Skills & Competencies', subtitle: 'Verified Engineering Proofs & Badges', category: 'Growth', icon: 'military_tech', path: '/skills' },
  { id: 'page-projects', title: 'Projects & Artifacts', subtitle: 'Technical Portfolios & Code Repositories', category: 'Growth', icon: 'code', path: '/projects' },
  { id: 'page-career', title: 'Career & Placement Pipeline', subtitle: 'Recruiter Dossier & Placement Readiness', category: 'Career', icon: 'work_outline', path: '/career' },
  { id: 'page-settings', title: 'Workspace Settings', subtitle: 'Account, Stream & Display Preferences', category: 'Settings', icon: 'settings', path: '/settings' },
];

export default function CommandPaletteModal() {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useApp();
  const [query, setQuery] = useState('');
  const [dbResults, setDbResults] = useState<SearchResultItem[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus input on open, clear query on close
  useEffect(() => {
    if (isCommandPaletteOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
      setDbResults([]);
    }
  }, [isCommandPaletteOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Query server database matching when user types
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDbResults([]);
      setIsSearchingDb(false);
      return;
    }

    let isCurrent = true;
    const fetchTimer = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok && isCurrent) {
          const data = await res.json();
          const items: SearchResultItem[] = [];

          if (Array.isArray(data.subjects)) {
            data.subjects.forEach((s: any) => {
              items.push({
                id: `sub-${s.id}`,
                title: `${s.name} (${s.code})`,
                subtitle: s.department ? `Department of ${s.department}` : undefined,
                category: 'Subject',
                icon: 'auto_stories',
                action: () => navigateTo(`/subjects/${s.code || s.id}`),
              });
            });
          }

          if (Array.isArray(data.topics)) {
            data.topics.forEach((t: any) => {
              items.push({
                id: `topic-${t.id}`,
                title: t.title,
                subtitle: t.subject?.name ? `${t.subject.name} • ${t.unitName || 'Unit'}` : t.unitName,
                category: 'Topic',
                icon: 'menu_book',
                action: () => navigateTo(`/subjects/${t.subject?.code || ''}`),
              });
            });
          }

          if (Array.isArray(data.assignments)) {
            data.assignments.forEach((a: any) => {
              items.push({
                id: `assign-${a.id}`,
                title: a.title,
                subtitle: a.subject?.name ? `${a.subject.name} • Due ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Upcoming'}` : undefined,
                category: 'Assignment',
                icon: 'assignment',
                action: () => navigateTo('/assignments'),
              });
            });
          }

          if (Array.isArray(data.resources)) {
            data.resources.forEach((r: any) => {
              items.push({
                id: `res-${r.id}`,
                title: r.title,
                subtitle: r.subject?.name ? `${r.subject.name} • ${r.type || 'Document'}` : r.type,
                category: 'Resource',
                icon: 'description',
                action: () => navigateTo('/resources'),
              });
            });
          }

          if (isCurrent) setDbResults(items);
        }
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        if (isCurrent) setIsSearchingDb(false);
      }
    }, 150);

    return () => {
      isCurrent = false;
      clearTimeout(fetchTimer);
    };
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (path: string) => {
    setIsCommandPaletteOpen(false);
    router.push(path);
  };

  const cleanQuery = query.trim().toLowerCase();

  // Match static targets strictly when query is non-empty
  const staticMatches: SearchResultItem[] = cleanQuery
    ? STATIC_SEARCH_TARGETS.filter(
        (target) =>
          target.title.toLowerCase().includes(cleanQuery) ||
          target.category.toLowerCase().includes(cleanQuery) ||
          (target.subtitle && target.subtitle.toLowerCase().includes(cleanQuery))
      ).map((target) => ({
        id: target.id,
        title: target.title,
        subtitle: target.subtitle,
        category: target.category,
        icon: target.icon,
        action: () => navigateTo(target.path),
      }))
    : [];

  // Combine unique results
  const allResults = cleanQuery
    ? [...staticMatches, ...dbResults.filter((d) => !staticMatches.some((s) => s.title.toLowerCase() === d.title.toLowerCase()))]
    : [];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-100"
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Search Input Bar: [ 🔍 Search... ] */}
        <div className="flex items-center px-4 py-3 bg-surface-container border-b border-outline-variant/30">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-3 shrink-0">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsCommandPaletteOpen(false);
              } else if (e.key === 'Enter' && allResults.length > 0) {
                allResults[0].action();
              }
            }}
            placeholder="Search..."
            className="w-full bg-transparent text-on-surface font-body-md text-sm placeholder:text-on-surface-variant/50 focus:outline-none"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors mr-2 text-xs"
              aria-label="Clear query"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-[11px] border border-outline-variant/30 font-medium shrink-0">
            ESC
          </kbd>
        </div>

        {/* Search Results Area - ONLY rendered when query is non-empty */}
        {cleanQuery.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {allResults.length === 0 ? (
              <div className="py-8 px-4 text-center text-on-surface-variant text-sm">
                {isSearchingDb ? (
                  <div className="flex items-center justify-center gap-2 text-on-surface-variant">
                    <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <p>No results found for &quot;{query}&quot;</p>
                )}
              </div>
            ) : (
              allResults.map((item, index) => (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high group-hover:bg-secondary-container group-hover:text-on-secondary-container flex items-center justify-center transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-md text-on-surface text-xs sm:text-sm truncate font-medium">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="font-label-tag text-[10px] text-on-surface-variant/70 truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-[10px]">
                      {item.category}
                    </span>
                    {index === 0 && (
                      <span className="hidden sm:inline font-mono text-[10px] text-on-surface-variant/50">
                        ↵
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
