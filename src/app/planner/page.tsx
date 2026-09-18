'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

interface ScheduleSlot {
  id: string;
  time: string;
  title: string;
  category: 'classes' | 'assignments' | 'exams' | 'deepwork' | 'personal';
  code?: string;
  room?: string;
  meetingUrl?: string;
  status?: string;
  isCompleted?: boolean;
}

export default function PlannerPage() {
  const { setIsQuickAddOpen, user } = useApp();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'timeline'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState(8);
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [aiPlannedSuccess, setAiPlannedSuccess] = useState(false);

  const [slots, setSlots] = useState<ScheduleSlot[]>([]);

  useEffect(() => {
    fetch('/api/planner')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlots(
            data.map((t: any) => ({
              id: t.id,
              time: t.startTime && t.endTime ? `${t.startTime} – ${t.endTime}` : t.startTime || '10:00 AM',
              title: t.title,
              category: t.category || 'personal',
              code: t.relatedSubjectCode || 'CORE',
              room: t.description || 'Academic Block',
              isCompleted: t.isCompleted,
              meetingUrl: t.meetingUrl,
            }))
          );
        } else {
          setSlots([]);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const toggleComplete = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextVal = !s.isCompleted;
          fetch('/api/planner', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isCompleted: nextVal }),
          }).catch(() => {});
          return { ...s, isCompleted: nextVal };
        }
        return s;
      })
    );
  };

  const handleAiPlan = () => {
    setIsAiPlanning(true);
    setTimeout(() => {
      // Add auto-fitted study session for the student's weakest area
      setSlots((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          time: '06:00 PM – 06:40 PM',
          title: 'AI Auto-Fit: Trees & BCNF Targeted Retrieval Review',
          category: 'deepwork',
          code: 'CS-301',
          room: 'Optimized Revision Slot',
          isCompleted: false,
        },
      ]);
      setIsAiPlanning(false);
      setAiPlannedSuccess(true);
      setTimeout(() => setAiPlannedSuccess(false), 3000);
    }, 1200);
  };

  const filteredSlots =
    selectedCategory === 'all'
      ? slots
      : slots.filter((s) => s.category === selectedCategory);

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-lg pb-space-4xl animate-in fade-in duration-200">
      {/* Top Command Context Bar */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-tag text-label-tag uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Temporal Architecture / Active Timeline
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-mono-wide text-label-mono-wide">
              FALL &apos;25 • WEEK 06
            </span>
          </div>
          <h1 className="font-display-quote text-headline-lg italic font-normal text-on-surface tracking-tight">
            My Planner
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
            Unified cognitive timeline: synchronized classes, deliverable countdowns, algorithmic revision slots, and guarded deep work periods.
          </p>
        </div>

        {/* Quick Actions & AI Optimization Controls */}
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={handleAiPlan}
            disabled={isAiPlanning}
            className="group relative flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-secondary-container/80 hover:bg-secondary-container text-on-secondary-container font-button-text text-button-text transition-all shadow-sm font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-primary group-hover:rotate-12 transition-transform">
              auto_awesome
            </span>
            <span>{isAiPlanning ? 'Optimizing Schedule...' : 'AI Plan My Day'}</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-surface-container-lowest/60 text-primary font-label-tag text-[9px]">
              Auto-Fit
            </span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-button-text text-button-text transition-colors shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Schedule Block</span>
          </button>
        </div>
      </div>

      {aiPlannedSuccess && (
        <div className="p-3 rounded-xl bg-secondary-container text-on-secondary-container font-body-sm flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          <span>
            AI Auto-Fit Complete: Added a 40-minute targeted review block for Trees &amp; BCNF based on your weak topic telemetry!
          </span>
        </div>
      )}

      {/* Navigation, Filters & View Toggles Strip */}
      <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-sm shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-space-md flex-wrap">
          {/* Week / Day / View Modes */}
          <div className="flex items-center bg-surface-container rounded-lg p-1">
            {(['day', 'week', 'month', 'timeline'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded font-label-tag text-label-tag uppercase tracking-wider transition-colors ${
                  viewMode === mode
                    ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Date Window Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-container rounded-lg px-1 py-0.5">
              <button className="p-1 hover:text-primary text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-2 font-label-mono-wide text-label-mono-wide text-on-surface font-medium select-none">
                September 8 – 14, 2025
              </span>
              <button className="p-1 hover:text-primary text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <button
              onClick={() => setSelectedDay(8)}
              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-tag text-label-tag uppercase tracking-wider transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Category Filter Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-label-tag text-label-tag uppercase text-on-surface-variant/70 mr-1 hidden lg:inline">
            Filters:
          </span>
          {[
            { id: 'all', label: `All (${slots.length})`, color: 'bg-primary' },
            { id: 'classes', label: `Classes (${slots.filter((s) => s.category === 'classes').length})`, color: 'bg-primary' },
            { id: 'assignments', label: `Assignments (${slots.filter((s) => s.category === 'assignments').length})`, color: 'bg-tertiary' },
            { id: 'exams', label: `Exams (${slots.filter((s) => s.category === 'exams').length})`, color: 'bg-error' },
            { id: 'deepwork', label: `Deep Work (${slots.filter((s) => s.category === 'deepwork').length})`, color: 'bg-secondary' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-tag text-label-tag transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left: Schedule Canvas (8 Cols / 66%) */}
        <div className="xl:col-span-8 flex flex-col space-y-space-md">
          {/* Day Micro-Header Row */}
          <div className="grid grid-cols-7 gap-2 bg-surface-container-low border border-outline-variant/30 p-2 rounded-xl text-center">
            {[
              { day: 'Mon', num: 8 },
              { day: 'Tue', num: 9 },
              { day: 'Wed', num: 10 },
              { day: 'Thu', num: 11 },
              { day: 'Fri', num: 12 },
              { day: 'Sat', num: 13 },
              { day: 'Sun', num: 14 },
            ].map((d) => (
              <button
                key={d.num}
                onClick={() => setSelectedDay(d.num)}
                className={`p-1.5 rounded-lg flex flex-col items-center transition-colors ${
                  selectedDay === d.num
                    ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="font-label-tag text-[10px] uppercase">{d.day}</span>
                <span className="font-label-mono-wide text-xs font-semibold">{d.num}</span>
              </button>
            ))}
          </div>

          {/* Timeline Slots List */}
          <div className="space-y-space-xs">
            {filteredSlots.length > 0 ? (
              filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-space-md rounded-xl border transition-all flex items-center justify-between gap-space-md ${
                    slot.isCompleted
                      ? 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-60'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <button
                      onClick={() => toggleComplete(slot.id)}
                      className="text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {slot.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-label-mono-wide text-xs text-primary font-semibold">
                          {slot.time}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-container text-[10px] font-label-tag uppercase text-on-surface-variant">
                          {slot.category}
                        </span>
                        {slot.code && (
                          <span className="text-[11px] font-label-mono-wide text-on-surface-variant">
                            • {slot.code}
                          </span>
                        )}
                      </div>
                      <h4
                        className={`font-body-md text-body-md font-medium truncate mt-0.5 ${
                          slot.isCompleted ? 'line-through text-on-surface-variant' : 'text-on-surface'
                        }`}
                      >
                        {slot.title}
                      </h4>
                      {slot.room && (
                        <p className="text-xs text-on-surface-variant/80 truncate flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">location_on</span>
                          <span>{slot.room}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {slot.meetingUrl && (
                      <a
                        href={slot.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-xs font-button-text font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">videocam</span>
                        <span>Join</span>
                      </a>
                    )}
                    {slot.category === 'assignments' && (
                      <span className="px-2.5 py-1 rounded bg-surface-container text-xs text-primary font-button-text">
                        Due Tomorrow
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-space-xl rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3 py-12">
                <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline-sm text-body-lg font-semibold text-on-surface">
                    Nothing planned yet.
                  </h3>
                  <p className="font-body-sm text-on-surface-variant max-w-sm mx-auto">
                    Your scheduled classes, assignments, and deep work sessions will appear here.
                  </p>
                </div>
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-button-text text-body-sm font-semibold hover:bg-primary-fixed transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add First Task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Planner Intelligence Panel (4 Cols / 34%) */}
        <div className="xl:col-span-4 space-y-space-md">
          {/* Card: Cognitive Load Telemetry */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-label-mono-wide text-xs uppercase text-primary font-semibold">
                COGNITIVE LOAD RADAR
              </span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-label-tag text-on-surface-variant">
                <span>Today&apos;s Intensity: High (5.2 hrs)</span>
                <span className="text-secondary font-semibold">Balanced Band</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            <p className="font-display-quote text-body-sm italic text-on-surface-variant">
              &ldquo;3 study gaps identified between 1:00 PM and 2:00 PM. Reserved for neural rest.&rdquo;
            </p>
          </div>

          {/* Card: Exam Countdown Invariant */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-sm shadow-md">
            <span className="font-label-mono-wide text-xs uppercase text-tertiary font-semibold">
              IMPENDING EVALUATION
            </span>
            <div className="space-y-1">
              <h3 className="font-headline-sm text-on-surface font-semibold">
                CS-301: DBMS Mid-Term Theory
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                Thursday, September 18 • 18 Days Left
              </p>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-primary font-semibold">78% Syllabus Cleared</span>
              <span className="text-on-surface-variant font-label-mono-wide">Seat: C-42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
