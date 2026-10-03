'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ClassroomConnectModal from '@/components/assignments/ClassroomConnectModal';
import CourseMappingModal from '@/components/assignments/CourseMappingModal';
import AddAssignmentModal from '@/components/assignments/AddAssignmentModal';

interface AssignmentItem {
  id: string;
  title: string;
  code: string;
  description: string | null;
  deadline: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  status: string; // 'pending' | 'in_progress' | 'completed' | 'submitted' | 'graded'
  effectiveStatus: 'today' | 'upcoming' | 'overdue' | 'completed';
  source: 'google_classroom' | 'manual';
  externalId: string | null;
  externalCourseId: string | null;
  externalUrl: string | null;
  workType: string | null;
  maxScore: number;
  score: number | null;
  subject?: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  } | null;
}

interface ClassroomStatus {
  isConnected: boolean;
  status: string;
  lastSyncedAt: string | null;
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  color?: string | null;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    today: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
    classroom: 0,
    manual: 0,
  });
  const [classroom, setClassroom] = useState<ClassroomStatus>({
    isConnected: false,
    status: 'disconnected',
    lastSyncedAt: null,
  });
  const [unmappedCourses, setUnmappedCourses] = useState<Array<{ id: string; googleCourseId: string; name: string }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<'all' | 'google_classroom' | 'manual'>('all');
  const [statusTab, setStatusTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Read URL query params (e.g. ?connected=true or ?error=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      setSyncFeedback('Google Classroom successfully connected! Courses and assignments imported.');
      window.history.replaceState({}, '', '/assignments');
    }
    const err = params.get('error');
    const msg = params.get('message');
    if (err) {
      setSyncFeedback(msg ? `Classroom: ${msg}` : 'Authorization was canceled or encountered an issue.');
      window.history.replaceState({}, '', '/assignments');
    }
  }, []);

  // Fetch Assignments and Status
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        source: sourceFilter,
        status: statusTab,
        subject: selectedSubject,
      });

      const res = await fetch(`/api/assignments?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setAssignments(data.assignments || []);
        if (data.counts) setCounts(data.counts);
        if (data.classroom) setClassroom(data.classroom);
        if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      }

      // Check unmapped courses if connected
      const statusRes = await fetch('/api/classroom/status');
      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.unmappedCourses) {
          setUnmappedCourses(sData.unmappedCourses);
        }
        if (sData.connection) {
          setClassroom((prev) => ({
            ...prev,
            isConnected: sData.isConnected,
            lastSyncedAt: sData.connection.lastSyncedAt,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sourceFilter, statusTab, selectedSubject]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Sync Google Classroom Now
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/classroom/sync', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setSyncFeedback(data.message || 'Synchronization complete.');
        if (data.unmappedCourses) setUnmappedCourses(data.unmappedCourses);
        fetchAssignments();
      } else {
        setSyncFeedback(data.error || 'Failed to sync Google Classroom. Please reconnect.');
      }
    } catch (err: any) {
      setSyncFeedback('Sync failed. Please check network connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Complete status
  const handleToggleComplete = async (assignment: AssignmentItem) => {
    const newStatus = assignment.status === 'completed' ? 'pending' : 'completed';
    try {
      // Optimistic update
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === assignment.id ? { ...item, status: newStatus } : item
        )
      );

      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        fetchAssignments();
      } else {
        // Refresh counts
        fetchAssignments();
      }
    } catch (err) {
      fetchAssignments();
    }
  };

  // Delete Assignment
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment from NIVORA?')) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
        fetchAssignments();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Disconnect Google Classroom
  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/classroom/disconnect', { method: 'POST' });
      if (res.ok) {
        setClassroom({ isConnected: false, status: 'disconnected', lastSyncedAt: null });
        setUnmappedCourses([]);
        setSyncFeedback('Google Classroom disconnected. Previously imported assignments have been retained.');
        fetchAssignments();
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Format sync timestamp
  const formatSyncTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-label-mono-wide text-xs text-on-surface-variant uppercase tracking-wider">
            <span>Academic Core</span>
            <span>/</span>
            <span className="text-primary font-semibold">Coursework</span>
            <span>•</span>
            <span className="text-secondary font-medium">Assignments &amp; Submissions</span>
          </div>
          <h1 className="font-display-quote text-3xl sm:text-4xl text-on-surface tracking-tight font-normal italic">
            Assignments
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm max-w-2xl">
            Live coursework feed synchronized with institutional Google Classroom courses and personal homework rosters.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Google Classroom Connection Status / Button */}
          {classroom.isConnected ? (
            <div className="flex items-center gap-2 p-1 pl-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-label-tag">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Google Classroom Connected</span>
                <span className="sm:hidden">Classroom ✓</span>
              </div>
              <span className="text-on-surface-variant text-[11px] hidden lg:inline">
                • Last synced: {formatSyncTime(classroom.lastSyncedAt)}
              </span>

              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                title="Sync assignments now"
              >
                <span className={`material-symbols-outlined text-[15px] ${isSyncing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Classroom options & disconnect"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all duration-200 group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                school
              </span>
              <span>Connect Google Classroom</span>
            </button>
          )}

          {/* Add Manual Assignment Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Assignment</span>
          </button>
        </div>
      </section>

      {/* Sync Feedback Toast / Banner */}
      {syncFeedback && (
        <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs flex items-center justify-between text-on-surface animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">info</span>
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Unmapped Courses Warning Banner */}
      {unmappedCourses.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-400">warning</span>
            <span>
              <strong>{unmappedCourses.length} Google Classroom course{unmappedCourses.length > 1 ? 's' : ''}</strong> need to be linked with a NIVORA Subject.
            </span>
          </div>
          <button
            onClick={() => setIsMappingModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors shadow-xs shrink-0"
          >
            Review &amp; Link Courses →
          </button>
        </div>
      )}

      {/* Source Filter Strip & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'today', label: 'Due Today', count: counts.today },
            { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { id: 'overdue', label: 'Overdue', count: counts.overdue },
            { id: 'completed', label: 'Completed', count: counts.completed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusTab === tab.id
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-label-mono-wide ${
                  statusTab === tab.id
                    ? 'bg-on-secondary-container/20 text-on-secondary-container'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Source Filter (All / Classroom / Manual) + Subject Dropdown */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Source Filter Switcher */}
          <div className="inline-flex rounded-xl bg-surface-container p-1 border border-outline-variant/30 text-xs">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                sourceFilter === 'all'
                  ? 'bg-surface-bright text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setSourceFilter('google_classroom')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                sourceFilter === 'google_classroom'
                  ? 'bg-surface-bright text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] text-emerald-400">school</span>
              <span>Classroom ({counts.classroom})</span>
            </button>
            <button
              onClick={() => setSourceFilter('manual')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                sourceFilter === 'manual'
                  ? 'bg-surface-bright text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Manual ({counts.manual})
            </button>
          </div>

          {/* Subject Dropdown Filter */}
          {subjects.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface focus:border-primary"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.code || s.name}>
                  {s.code ? `[${s.code}] ` : ''}{s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs text-on-surface-variant">Loading assignments...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && assignments.length === 0 && (
        <div className="py-16 px-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 text-center space-y-4 max-w-xl mx-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[36px]">assignment_turned_in</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-headline-sm text-on-surface font-semibold text-lg">
              No assignments found
            </h3>
            <p className="text-xs text-on-surface-variant">
              {sourceFilter !== 'all' || statusTab !== 'all'
                ? 'No coursework matches your active filter selection.'
                : 'Connect your Google Classroom or add manual homework to track deadlines.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {!classroom.isConnected && (
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">school</span>
                <span>Connect Google Classroom</span>
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface"
            >
              + Add Manual Assignment
            </button>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {!isLoading && assignments.length > 0 && (
        <div className="space-y-3.5">
          {assignments.map((item) => {
            const isCompleted = item.status === 'completed';
            const isClassroom = item.source === 'google_classroom';

            // Format Due Display
            let dueDisplay = item.dueDate ? `Due: ${item.dueDate}` : 'No due date set';
            if (item.dueTime) dueDisplay += ` • ${item.dueTime}`;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-80'
                    : item.priority === 'CRITICAL'
                    ? 'bg-surface-container-low border-error/40 hover:border-error/60'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
                }`}
              >
                {/* Left Content */}
                <div className="space-y-2 min-w-0 flex-1">
                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Subject Pill */}
                    <span className="px-2.5 py-0.5 rounded bg-surface-container font-mono text-xs font-semibold text-primary">
                      {item.subject?.code || item.code || 'ASG'}
                    </span>

                    {/* Source Indicator */}
                    {isClassroom ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-label-tag text-[10px] border border-emerald-500/30 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">school</span>
                        <span>Google Classroom</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-tag text-[10px]">
                        Manual Entry
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full font-label-tag text-[9px] uppercase font-bold tracking-wider ${
                        item.priority === 'CRITICAL'
                          ? 'bg-error/20 text-error border border-error/30'
                          : item.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.priority === 'MEDIUM'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {item.priority}
                    </span>

                    {/* Status Pill */}
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-label-tag text-[10px] flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[12px]">done_all</span>
                        <span>Completed</span>
                      </span>
                    ) : item.effectiveStatus === 'overdue' ? (
                      <span className="px-2 py-0.5 rounded-full bg-error/20 text-error font-label-tag text-[10px] font-semibold">
                        Overdue
                      </span>
                    ) : item.effectiveStatus === 'today' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-label-tag text-[10px] font-semibold">
                        Due Today
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h3
                    className={`font-headline-md text-base sm:text-lg font-semibold text-on-surface ${
                      isCompleted ? 'line-through text-on-surface-variant' : ''
                    }`}
                  >
                    {item.title}
                  </h3>

                  {/* Description preview */}
                  {item.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 max-w-2xl">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-on-surface-variant pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        schedule
                      </span>
                      <span>{dueDisplay}</span>
                    </span>

                    {item.subject?.name && (
                      <span className="text-secondary font-medium">
                        {item.subject.name}
                      </span>
                    )}

                    {item.maxScore > 0 && (
                      <span>Points: {item.maxScore}</span>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  {/* Google Classroom External Link */}
                  {item.externalUrl && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5"
                    >
                      <span>View in Classroom</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  )}

                  {/* Mark Complete Toggle Button */}
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        : 'bg-primary text-on-primary hover:bg-primary-fixed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isCompleted ? 'check_box' : 'check'}
                    </span>
                    <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                  </button>

                  {/* Delete button (for manual assignments or removing) */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete assignment"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      <ClassroomConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        isConnected={classroom.isConnected}
        lastSyncedAt={classroom.lastSyncedAt}
        onDisconnect={handleDisconnect}
      />

      {/* Course Mapping Review Modal */}
      <CourseMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        onSuccess={() => fetchAssignments()}
        unmappedCourses={unmappedCourses}
        subjects={subjects}
      />

      {/* Add Manual Assignment Modal */}
      <AddAssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchAssignments()}
        subjects={subjects}
      />
    </div>
  );
}
