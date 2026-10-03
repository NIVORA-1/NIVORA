'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TimetableUploadModal from '@/components/classes/TimetableUploadModal';
import ClassEditModal from '@/components/classes/ClassEditModal';
import { KnownSubjectItem } from '@/lib/timetableOcrService';

interface ClassScheduleItem {
  id: string;
  userId: string;
  subjectId: string | null;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string | null;
  instructor: string | null;
  room: string | null;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  section: string | null;
  meetingUrl: string | null;
  notes: string | null;
  needsReview: boolean;
  subject?: {
    id: string;
    name: string;
    code: string;
    color: string | null;
    attendanceRate: number | null;
  } | null;
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClassesPage() {
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([]);
  const [todayClasses, setTodayClasses] = useState<ClassScheduleItem[]>([]);
  const [nextClass, setNextClass] = useState<ClassScheduleItem | null>(null);
  const [knownSubjects, setKnownSubjects] = useState<KnownSubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view states
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'grid'>('day');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editModalItem, setEditModalItem] = useState<ClassScheduleItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState<string | null>(null);

  // Student local clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDayName, setCurrentDayName] = useState<string>('Monday');

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      const dayIndex = now.getDay(); // 0 = Sun, 1 = Mon
      const localDay = DAYS_ORDER[dayIndex === 0 ? 6 : dayIndex - 1];
      setCurrentDayName(localDay);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch classes from backend
  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const jsDay = now.getDay();
      const clientDayOfWeek = jsDay === 0 ? 7 : jsDay;
      const clientTimeMinutes = now.getHours() * 60 + now.getMinutes();

      const res = await fetch(
        `/api/classes?clientDayOfWeek=${clientDayOfWeek}&clientTimeMinutes=${clientTimeMinutes}`
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view your timetable.');
        } else {
          setError(data.error || 'Failed to load timetable.');
        }
        setIsLoading(false);
        return;
      }

      setSchedules(data.schedules || []);
      setTodayClasses(data.todayClasses || []);
      setNextClass(data.nextClass || null);

      // Collect known subjects from response
      const subjects: KnownSubjectItem[] = [];
      if (Array.isArray(data.userSubjects)) {
        data.userSubjects.forEach((s: any) =>
          subjects.push({
            id: s.id,
            name: s.name,
            code: s.code,
            instructor: s.instructor,
            room: s.room,
          })
        );
      }
      if (Array.isArray(data.academicSubjects)) {
        data.academicSubjects.forEach((s: any) => {
          if (!subjects.some((existing) => existing.code === s.code)) {
            subjects.push({
              id: s.id,
              name: s.name,
              code: s.code,
            });
          }
        });
      }
      setKnownSubjects(subjects);

      // Set initial selected tab to today's day if it has classes, or the first active day
      const dayIndex = now.getDay();
      const currentDay = DAYS_ORDER[dayIndex === 0 ? 6 : dayIndex - 1];
      setSelectedDay(currentDay);
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
      setError('Network connection error. Could not load classes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleClearTimetable = async () => {
    if (!confirm('Are you sure you want to clear your entire timetable? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch('/api/classes', { method: 'DELETE' });
      if (res.ok) {
        fetchClasses();
      }
    } catch (err) {
      console.error('Clear timetable error:', err);
    }
  };

  const dayClasses = schedules.filter((s) => s.dayName === selectedDay);
  const totalClassesCount = schedules.length;
  const hasTimetable = totalClassesCount > 0;

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-label-mono-wide text-xs text-on-surface-variant uppercase tracking-wider">
            <span>Academic Core</span>
            <span>/</span>
            <span className="text-primary font-semibold">Classes &amp; Timetable</span>
            <span>•</span>
            <span className="text-secondary font-medium">{currentDayName}, {currentTimeStr}</span>
          </div>
          <h1 className="font-display-quote text-3xl sm:text-4xl text-on-surface tracking-tight font-normal italic">
            My Classes
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm max-w-2xl">
            AI-extracted institutional timetable, personalized class schedule, room directions, and live lectures.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Import Timetable</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Class</span>
          </button>

          {hasTimetable && (
            <button
              onClick={handleClearTimetable}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-error/15 hover:text-error text-on-surface-variant text-xs font-medium transition-colors"
              title="Clear personal timetable"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <Link
            href="/planner"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Planner</span>
          </Link>
        </div>
      </section>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs text-on-surface-variant">Loading your timetable schedule...</p>
        </div>
      )}

      {/* Error Banner */}
      {!isLoading && error && (
        <div className="p-4 rounded-2xl bg-error/15 border border-error/30 text-error text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchClasses()}
            className="px-3 py-1 rounded-lg bg-error/20 hover:bg-error/30 text-error font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY STATE: Hero Upload Timetable Card */}
      {!isLoading && !error && !hasTimetable && (
        <div className="py-8 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <div
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full border-2 border-dashed border-primary/40 hover:border-primary rounded-3xl p-8 sm:p-12 text-center bg-surface-container-low/70 hover:bg-surface-container-low transition-all duration-200 cursor-pointer shadow-lg hover:shadow-primary/5 flex flex-col items-center justify-center gap-5 group"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200 shadow-inner">
              <span className="material-symbols-outlined text-[44px]">upload_file</span>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-label-mono-wide uppercase tracking-wider font-semibold">
                Import Timetable
              </div>
              <h2 className="font-display-quote text-2xl sm:text-3xl text-on-surface font-normal">
                Upload PDF, screenshot or photo
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Self-hosted OCR extracts your classes automatically with a preview before saving. Just upload your college timetable.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-semibold shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span>Import Timetable</span>
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant font-label-mono-wide">
              Supports PDF Timetable • Mobile Screenshots • Camera Photos • JPG • PNG • HEIC
            </p>
          </div>

          <div className="pt-6 flex items-center gap-2 text-xs text-on-surface-variant">
            <span>Don&apos;t have a timetable file?</span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-primary hover:underline font-semibold"
            >
              Add Class Manually →
            </button>
          </div>
        </div>
      )}

      {/* POPULATED STATE: Active Timetable */}
      {!isLoading && !error && hasTimetable && (
        <div className="space-y-6">
          {/* Status & Next Class Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Live Clock & Day Overview */}
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-wide text-xs text-primary font-semibold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Schedule</span>
                </span>
                <span className="font-label-mono-wide text-xs text-on-surface-variant">{currentTimeStr}</span>
              </div>

              <div>
                <h3 className="text-xl font-headline-sm font-semibold text-on-surface">
                  {currentDayName}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {todayClasses.length > 0
                    ? `${todayClasses.length} class${todayClasses.length > 1 ? 'es' : ''} scheduled for today.`
                    : 'No classes scheduled for today. Enjoy your day!'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                <span>Total Classes: <strong>{totalClassesCount}</strong></span>
                <span>•</span>
                <span>Days Active: <strong>{new Set(schedules.map((s) => s.dayName)).size}</strong></span>
              </div>
            </div>

            {/* Next Upcoming Class Card */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-wide text-xs text-secondary font-semibold uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Next Upcoming Class</span>
                </span>
                {nextClass && (
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-xs font-label-mono-wide text-on-surface-variant">
                    {nextClass.dayName}
                  </span>
                )}
              </div>

              {nextClass ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono text-xs font-semibold">
                        {nextClass.subjectCode || 'CLASS'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] text-on-surface-variant uppercase">
                        {nextClass.type}
                      </span>
                      <span className="font-label-mono-wide text-xs text-on-surface font-semibold">
                        {nextClass.startTime} – {nextClass.endTime}
                      </span>
                    </div>

                    <h4 className="text-lg font-headline-sm font-semibold text-on-surface">
                      {nextClass.subjectName}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
                      {nextClass.instructor && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          {nextClass.instructor}
                        </span>
                      )}
                      {nextClass.room && (
                        <span className="flex items-center gap-1 text-primary">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {nextClass.room}
                        </span>
                      )}
                      {nextClass.section && (
                        <span>Section: {nextClass.section}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {nextClass.room && (
                      <button
                        onClick={() => setShowRoomModal(nextClass.room)}
                        className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">map</span>
                        <span>Room</span>
                      </button>
                    )}
                    <button
                      onClick={() => setEditModalItem(nextClass)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-medium text-on-surface flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-xs text-on-surface-variant">
                  No upcoming classes found on your schedule. All clear!
                </div>
              )}

              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>Synchronized with your personal timetable</span>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-primary hover:underline font-semibold"
                >
                  Upload New Timetable Screenshot →
                </button>
              </div>
            </div>
          </div>

          {/* Days Filter Strip & View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Days Filter Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs">
              {DAYS_ORDER.map((day) => {
                const count = schedules.filter((s) => s.dayName === day).length;
                const isToday = currentDayName === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      selectedDay === day
                        ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>{day.slice(0, 3)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-label-mono-wide ${
                        selectedDay === day
                          ? 'bg-on-secondary-container/20 text-on-secondary-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {count}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Today" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex rounded-xl bg-surface-container p-1 border border-outline-variant/30 text-xs">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'day'
                      ? 'bg-surface-bright text-on-surface shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                  <span>Day View</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-surface-bright text-on-surface shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">grid_view</span>
                  <span>Weekly Timetable</span>
                </button>
              </div>
            </div>
          </div>

          {/* DAY VIEW MODE */}
          {viewMode === 'day' && (
            <div className="space-y-3">
              {dayClasses.length === 0 ? (
                <div className="p-12 rounded-3xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">event_busy</span>
                  <h4 className="font-semibold text-on-surface text-sm">No classes on {selectedDay}</h4>
                  <p className="text-xs text-on-surface-variant">There are no lectures or labs scheduled for this day.</p>
                  <button
                    onClick={() => {
                      setEditModalItem(null);
                      setIsAddModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold"
                  >
                    + Add Class to {selectedDay}
                  </button>
                </div>
              ) : (
                dayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-5 rounded-2xl bg-surface-container-low border transition-all duration-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      cls.needsReview
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-outline-variant/30 hover:border-outline-variant/60'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {cls.subjectCode && (
                          <span className="px-2.5 py-0.5 rounded bg-surface-container font-label-mono-wide text-xs text-primary font-semibold">
                            {cls.subjectCode}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-tag text-[9px] uppercase">
                          {cls.type}
                        </span>
                        <span className="font-label-mono-wide text-xs text-on-surface font-semibold">
                          {cls.startTime} – {cls.endTime}
                        </span>
                        {cls.section && (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px]">
                            {cls.section}
                          </span>
                        )}
                        {cls.needsReview && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1 border border-amber-500/30">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            <span>Needs review</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-semibold">
                        {cls.subjectName}
                      </h3>

                      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-on-surface-variant">
                        {cls.instructor && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                              person
                            </span>
                            {cls.instructor}
                          </span>
                        )}
                        {cls.room && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              location_on
                            </span>
                            {cls.room}
                          </span>
                        )}
                        {cls.subject?.attendanceRate != null && (
                          <span className="text-secondary font-label-mono-wide">
                            Attendance: {cls.subject.attendanceRate}%
                          </span>
                        )}
                        {cls.notes && (
                          <span className="text-on-surface-variant italic">
                            Note: {cls.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {cls.room && (
                        <button
                          onClick={() => setShowRoomModal(cls.room)}
                          className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-semibold transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">map</span>
                          <span>Room</span>
                        </button>
                      )}

                      {cls.meetingUrl && (
                        <a
                          href={cls.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">videocam</span>
                          <span>Join Live</span>
                        </a>
                      )}

                      <button
                        onClick={() => setEditModalItem(cls)}
                        className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface font-semibold transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* WEEKLY TIMETABLE GRID MODE */}
          {viewMode === 'grid' && (
            <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-low overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container">
                      <th className="p-3.5 font-label-mono-wide uppercase text-on-surface-variant font-semibold w-28">
                        Day
                      </th>
                      <th className="p-3.5 font-label-mono-wide uppercase text-on-surface-variant font-semibold">
                        Scheduled Classes &amp; Slots
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {DAYS_ORDER.map((day) => {
                      const daySlots = schedules.filter((s) => s.dayName === day);
                      return (
                        <tr key={day} className="hover:bg-surface-container-high/30 transition-colors">
                          <td className="p-3.5 font-semibold text-on-surface align-top border-r border-outline-variant/20">
                            <div className="flex items-center gap-1.5">
                              <span>{day}</span>
                              {currentDayName === day && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant block font-normal">
                              {daySlots.length} class{daySlots.length !== 1 ? 'es' : ''}
                            </span>
                          </td>
                          <td className="p-3.5 align-top">
                            {daySlots.length === 0 ? (
                              <span className="text-on-surface-variant/50 italic text-[11px]">— No classes scheduled —</span>
                            ) : (
                              <div className="flex flex-wrap gap-2.5">
                                {daySlots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    onClick={() => setEditModalItem(slot)}
                                    className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer transition-colors max-w-xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="px-1.5 py-0.2 rounded bg-surface-container-high font-mono text-[10px] text-primary font-semibold">
                                        {slot.subjectCode || slot.type}
                                      </span>
                                      <span className="font-label-mono-wide text-[10px] text-on-surface-variant">
                                        {slot.startTime} – {slot.endTime}
                                      </span>
                                    </div>
                                    <h5 className="font-medium text-on-surface text-xs truncate">
                                      {slot.subjectName}
                                    </h5>
                                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                                      <span>{slot.room || '—'}</span>
                                      <span>{slot.instructor || ''}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload & AI Extraction Modal */}
      <TimetableUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => fetchClasses()}
        existingCount={totalClassesCount}
        knownSubjects={knownSubjects}
      />

      {/* Add / Edit Single Class Modal */}
      <ClassEditModal
        isOpen={isAddModalOpen || Boolean(editModalItem)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditModalItem(null);
        }}
        onSuccess={() => fetchClasses()}
        editClassItem={editModalItem}
        knownSubjects={knownSubjects}
        defaultDay={selectedDay}
      />

      {/* Room Guide Modal */}
      {showRoomModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRoomModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
                <h3 className="font-headline-sm text-on-surface font-semibold">
                  Classroom Guide
                </h3>
              </div>
              <button
                onClick={() => setShowRoomModal(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-2 text-xs text-on-surface-variant">
              <p><strong>Room Designation</strong>: {showRoomModal}</p>
              <p><strong>Campus Wing</strong>: Central Academic Quad, Level 2.</p>
              <p><strong>Facilities</strong>: Smart Projector, High-Bandwidth Eduroam WiFi, Lecture Recording Cameras.</p>
            </div>
            <button
              onClick={() => setShowRoomModal(null)}
              className="w-full py-2 rounded-xl bg-primary text-on-primary font-button-text font-semibold text-xs"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
