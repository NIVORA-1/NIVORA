'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface ClassItem {
  id: string;
  subjectId?: string | null;
  subjectName: string;
  subjectCode: string;
  startTime: string;
  endTime: string;
  startMins: number;
  endMins: number;
  room: string;
  type: string;
  instructor: string;
  isRunning: boolean;
  isUpcoming: boolean;
}

interface AttendanceRecordItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  attendedClasses: number;
  totalClasses: number;
  absentClasses: number;
  percentage: number;
  isLow: boolean;
  status: string;
}

interface AssignmentItem {
  id: string;
  title: string;
  subjectName: string;
  subjectCode: string;
  deadline: string | null;
  deadlineFormatted: string;
  statusTag: 'overdue' | 'today' | 'upcoming';
  statusLabel: string;
  priority?: string;
  estimatedMins?: number;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category: string;
  url: string;
  isInternal: boolean;
}

interface LearningItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  unitName: string;
  unitNumber: number;
  isWeak: boolean;
  progress: number;
  dueDate: string;
  actionLink: string;
}

interface UpcomingMilestone {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  dateFormatted: string;
  timeFormatted: string;
  location: string;
  badge: string;
  badgeColor: string;
  relativeTime: string;
  link: string;
}

interface CommunityItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  role: string;
  logo?: string | null;
  latestActivity: string;
  url: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface DashboardApiResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    profile?: {
      college?: string;
      stream?: string;
      streamCode?: string;
      degree?: string;
      year?: number;
      semester?: number;
      specialization?: string;
      cgpa?: number;
      streakDays?: number;
    } | null;
  };
  currentDayOfWeek: number;
  currentDayName: string;
  todayClasses: {
    items: ClassItem[];
    runningClassId: string | null;
    nextClassId: string | null;
    hasClassesToday: boolean;
    totalClassesWeek: number;
  };
  attendance: {
    overallPercentage: number;
    totalAttended: number;
    totalClasses: number;
    absentClasses: number;
    hasRecords: boolean;
    hasLowAttendance: boolean;
    records: AttendanceRecordItem[];
  };
  assignments: {
    items: AssignmentItem[];
    totalPending: number;
    hasPending: boolean;
  };
  events: {
    items: EventItem[];
    hasEvents: boolean;
  };
  learning: {
    items: LearningItem[];
    totalPending: number;
    hasPending: boolean;
  };
  upcoming: {
    items: UpcomingMilestone[];
    hasUpcoming: boolean;
  };
  communities: {
    items: CommunityItem[];
    hasJoined: boolean;
  };
  notifications: {
    unreadCount: number;
    recent: NotificationItem[];
  };
}

export default function HomePage() {
  const router = useRouter();
  const { user: appUser, isLoadingUser } = useApp();

  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [markingRead, setMarkingRead] = useState<boolean>(false);

  // Client clock state for real-time running/next class updates
  const [clientMinutes, setClientMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // Fetch real dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const jsDay = now.getDay();
      const clientDayOfWeek = jsDay === 0 ? 7 : jsDay;
      const minutes = now.getHours() * 60 + now.getMinutes();
      setClientMinutes(minutes);

      const res = await fetch(
        `/api/dashboard?clientDayOfWeek=${clientDayOfWeek}&clientTimeMinutes=${minutes}`,
        { cache: 'no-store' }
      );

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load dashboard');
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('[Dashboard Error]:', err);
      setError(err?.message || 'Unable to connect to Nivora services. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Update clock every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClientMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    try {
      setMarkingRead(true);
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: {
              unreadCount: 0,
              recent: prev.notifications.recent.map((n) => ({ ...n, isRead: true })),
            },
          };
        });
      }
    } catch {
      // Ignore
    } finally {
      setMarkingRead(false);
    }
  };

  // Determine dynamic time greeting
  const greeting = useMemo(() => {
    const hour = Math.floor(clientMinutes / 60);
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, [clientMinutes]);

  const studentName = data?.user?.name || appUser?.name || 'Student';
  const firstName = studentName.trim().split(' ')[0] || studentName;
  const avatarUrl = data?.user?.avatar || appUser?.avatar;
  const profile = data?.user?.profile || appUser?.profile;

  const collegeName = profile?.college || 'Indian Institute of Technology';
  const branchName = profile?.stream || profile?.streamCode || 'Engineering & Sciences';
  const yearText = profile?.year ? `Year ${profile.year}` : 'Year 1';
  const semText = profile?.semester ? `Sem ${profile.semester}` : 'Sem 1';

  // Compute live active & next class from current minutes
  const todayClassesList = data?.todayClasses?.items || [];
  const activeClass = todayClassesList.find(
    (c) => clientMinutes >= c.startMins && clientMinutes < c.endMins
  );
  const nextClass = todayClassesList.find((c) => c.startMins > clientMinutes);

  // Loading skeleton state
  if (loading || isLoadingUser) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-container" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-surface-container rounded" />
              <div className="h-4 w-72 bg-surface-container rounded" />
            </div>
          </div>
          <div className="h-10 w-10 bg-surface-container rounded-xl" />
        </div>

        {/* Classes Skeleton */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
          <div className="h-6 w-40 bg-surface-container rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-28 bg-surface-container rounded-xl" />
            <div className="h-28 bg-surface-container rounded-xl" />
            <div className="h-28 bg-surface-container rounded-xl" />
          </div>
        </div>

        {/* Attendance Skeleton */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
          <div className="h-6 w-36 bg-surface-container rounded" />
          <div className="h-24 bg-surface-container rounded-xl" />
        </div>

        {/* Assignments & Learning Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 h-64" />
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 h-64" />
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error || !data) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-surface-container-low border border-rose-500/30 text-center space-y-4 shadow-lg">
        <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
        <h2 className="text-xl font-bold text-on-surface">Unable to load dashboard</h2>
        <p className="text-sm text-on-surface-variant">{error || 'An unexpected error occurred.'}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      {/* ========================================================================= */}
      {/* 1. HEADER                                                                 */}
      {/* ========================================================================= */}
      <header className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Profile Picture with Fallback Initials */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={studentName}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/40 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface" />
          </div>

          {/* Student Greeting & Academic Details */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              {greeting}, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant flex flex-wrap items-center gap-1.5 font-medium">
              <span className="text-on-surface">{collegeName}</span>
              <span className="text-on-surface-variant/40">•</span>
              <span>{branchName}</span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="px-2 py-0.5 rounded-md bg-surface-container text-primary font-mono text-xs font-semibold">
                {yearText} ({semText})
              </span>
            </p>
          </div>
        </div>

        {/* Header Right: Notification Bell Only */}
        <div className="relative self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="View notifications"
            className="relative p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {data.notifications.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse">
                {data.notifications.unreadCount}
              </span>
            )}
          </button>

          {/* Floating Notifications Drawer / Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-on-surface">Notifications</span>
                  {data.notifications.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                      {data.notifications.unreadCount} new
                    </span>
                  )}
                </div>
                {data.notifications.unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    disabled={markingRead}
                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {data.notifications.recent.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6">
                    No new notifications right now.
                  </p>
                ) : (
                  data.notifications.recent.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        !n.isRead
                          ? 'bg-surface-container-high/60 border-primary/30'
                          : 'bg-surface-container-low border-outline-variant/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-on-surface-variant mt-1 leading-relaxed">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-on-surface-variant/60 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. TODAY'S CLASSES                                                        */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Today&apos;s Classes</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {data.currentDayName} • {todayClassesList.length} scheduled class{todayClassesList.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
          <Link
            href="/classes"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>Full Timetable</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {todayClassesList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-2">
            <span className="text-3xl">🎉</span>
            <h3 className="text-base font-bold text-on-surface">No classes today 🎉</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              You have no lectures or practicals scheduled for {data.currentDayName}. Take time to review upcoming coursework or work on your projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClassesList.map((cls) => {
              const isRunning = activeClass?.id === cls.id;
              const isNext = !isRunning && nextClass?.id === cls.id;

              return (
                <div
                  key={cls.id}
                  className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isRunning
                      ? 'bg-primary/5 border-primary shadow-md ring-1 ring-primary/40'
                      : isNext
                      ? 'bg-surface-container-low border-secondary/50 shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/40'
                  }`}
                >
                  {/* Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant border border-outline-variant/20">
                      {cls.type}
                    </span>
                    {isRunning && (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Happening Now</span>
                      </span>
                    )}
                    {isNext && (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">upcoming</span>
                        <span>Next Up</span>
                      </span>
                    )}
                  </div>

                  {/* Subject and Time */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-on-surface text-base line-clamp-1">
                      {cls.subjectName}
                    </h3>
                    <p className="text-xs font-mono font-medium text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{cls.startTime} - {cls.endTime}</span>
                    </p>
                  </div>

                  {/* Room & Instructor Info */}
                  <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant/70">location_on</span>
                      <span>{cls.room}</span>
                    </span>
                    <span className="truncate max-w-[120px] text-right font-medium">
                      {cls.instructor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. ATTENDANCE                                                             */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Attendance Overview</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {data.attendance.hasRecords
                  ? `Overall: ${data.attendance.overallPercentage}% across ${data.attendance.records.length} subjects`
                  : 'Real attendance monitoring'}
              </p>
            </div>
          </div>
          <Link
            href="/attendance"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>View Attendance</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {!data.attendance.hasRecords ? (
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-on-surface">No attendance records logged yet</h3>
              <p className="text-xs text-on-surface-variant max-w-md">
                Connect your college ERP or log manual attendance to keep track of mandatory 75% eligibility requirements.
              </p>
            </div>
            <Link
              href="/attendance"
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Set Up Attendance →
            </Link>
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-5">
            {/* Top Stat Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-4">
                <div
                  className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                    data.attendance.overallPercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {data.attendance.overallPercentage}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">Overall Eligibility</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        data.attendance.overallPercentage >= 75
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {data.attendance.overallPercentage >= 75 ? 'Safe (Eligible)' : 'Attention Needed'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {data.attendance.totalAttended} attended of {data.attendance.totalClasses} total classes held
                  </p>
                </div>
              </div>

              {data.attendance.hasLowAttendance && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Low attendance detected in one or more courses</span>
                </div>
              )}
            </div>

            {/* Compact Subject-wise Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.attendance.records.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    rec.isLow
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-surface-container border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-on-surface truncate" title={rec.subjectName}>
                      {rec.subjectName}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        rec.isLow ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {rec.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rec.isLow ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, rec.percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                    <span>{rec.attendedClasses} / {rec.totalClasses} classes</span>
                    {rec.isLow && (
                      <span className="text-amber-400 font-semibold text-[10px]">
                        Below 75%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. ASSIGNMENTS                                                            */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Pending Assignments</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {data.assignments.totalPending} pending submission{data.assignments.totalPending !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link
            href="/assignments"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {!data.assignments.hasPending || data.assignments.items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-2">
            <span className="text-3xl">🎉</span>
            <h3 className="text-base font-bold text-on-surface">All caught up! 🎉</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              No pending assignments waiting for submission. Completed deliverables are archived.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.assignments.items.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container text-primary font-mono text-[10px] font-bold uppercase truncate max-w-[140px]">
                      {asg.subjectCode || asg.subjectName}
                    </span>
                    {asg.statusTag === 'overdue' && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase">
                        Overdue
                      </span>
                    )}
                    {asg.statusTag === 'today' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                        Due Today
                      </span>
                    )}
                    {asg.statusTag === 'upcoming' && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                        {asg.statusLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-on-surface line-clamp-2">
                    {asg.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant text-[11px] font-medium">
                    {asg.deadlineFormatted}
                  </span>
                  <Link
                    href="/assignments"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. EVENTS                                                                 */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[20px]">celebration</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Campus &amp; Community Events</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Upcoming hackathons, workshops and technical keynotes
              </p>
            </div>
          </div>
          <Link
            href="/clubs-and-events"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {!data.events.hasEvents || data.events.items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">event_busy</span>
            <h3 className="text-base font-bold text-on-surface">No upcoming events right now</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Check back soon for new hackathons, workshops and campus community sessions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.events.items.map((ev) => (
              <a
                key={ev.id}
                href={ev.url}
                target={ev.url.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="group p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/50 transition-all flex flex-col justify-between gap-3 shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-primary border border-primary/20">
                      {ev.category}
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate max-w-[130px]">
                      {ev.organizer}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {ev.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-outline-variant/15 space-y-1 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-primary">event</span>
                    <span>{ev.date}</span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="truncate">{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant/60">location_on</span>
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. LEARNING                                                               */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[20px]">local_library</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Pending Learning Activities</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Active curriculum syllabus targets and mastery milestones
              </p>
            </div>
          </div>
          <Link
            href="/learning"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {!data.learning.hasPending || data.learning.items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-2">
            <span className="text-3xl">🎉</span>
            <h3 className="text-base font-bold text-on-surface">You&apos;re all caught up! 🎉</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              All topics in your current semester syllabus track are completed. You can review past notes or explore ahead.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.learning.items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-primary truncate max-w-[160px]">
                      {item.subjectName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/20">
                      {item.unitName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                    <span>{item.dueDate}</span>
                    {item.progress > 0 && <span>{item.progress}% mastered</span>}
                  </div>
                  {item.progress > 0 && (
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-end">
                  <Link
                    href={item.actionLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <span>{item.progress > 0 ? 'Continue' : 'Start'}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 7. UPCOMING                                                               */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">event_upcoming</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Upcoming Milestones</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Exams, academic deadlines &amp; verified dates
              </p>
            </div>
          </div>
        </div>

        {!data.upcoming.hasUpcoming || data.upcoming.items.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-1">
            <h3 className="text-sm font-bold text-on-surface">No upcoming deadlines or exams scheduled</h3>
            <p className="text-xs text-on-surface-variant">
              You are clear of any impending exams or submission cutoffs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.upcoming.items.map((milestone) => (
              <Link
                key={milestone.id}
                href={milestone.link}
                className="group p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/50 transition-all flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex flex-col items-center justify-center text-center flex-shrink-0 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {milestone.type === 'Exam' ? 'history_edu' : 'flag'}
                    </span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${milestone.badgeColor}`}>
                        {milestone.badge}
                      </span>
                      <span className="text-[11px] font-medium text-on-surface-variant">
                        {milestone.relativeTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      {milestone.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant truncate">
                      {milestone.subtitle} • {milestone.dateFormatted}
                    </p>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 8. COMMUNITIES                                                            */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Joined Communities</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Clubs and peer student networks you belong to
              </p>
            </div>
          </div>
          <Link
            href="/community"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>View Communities</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {!data.communities.hasJoined || data.communities.items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">You have not joined any community yet</h3>
              <p className="text-xs text-on-surface-variant max-w-md">
                Connect with student clubs, open-source cohorts, and project groups across campuses.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm"
            >
              <span>Discover communities →</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.communities.items.map((club) => (
              <Link
                key={club.id}
                href={club.url}
                className="group p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-primary border border-outline-variant/20">
                      {club.category}
                    </span>
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase">
                      {club.role}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {club.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                  <span className="truncate max-w-[160px] text-primary">{club.latestActivity}</span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
