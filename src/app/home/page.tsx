'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getStreamConfig } from '@/lib/personalization';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoadingUser, currentStream, setCurrentStream } = useApp();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [showRebootBanner, setShowRebootBanner] = useState(true);
  const [showRoomGuide, setShowRoomGuide] = useState(false);
  const [showWhyInsight, setShowWhyInsight] = useState(false);
  const [checklist, setChecklist] = useState<any[]>([]);

  // Handle URL stream param
  useEffect(() => {
    const streamParam = searchParams.get('stream');
    if (streamParam) {
      setCurrentStream(streamParam.toUpperCase());
    }
  }, [searchParams, setCurrentStream]);

  // Fetch user-specific dashboard data
  useEffect(() => {
    let isMounted = true;
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data) {
          setDashboardData(data);
          if (data.plannerTasks && data.plannerTasks.length > 0) {
            setChecklist(
              data.plannerTasks.slice(0, 4).map((t: any) => ({
                id: t.id,
                time: t.startTime || '10:00 AM',
                label: t.title.length > 24 ? t.title.slice(0, 24) + '...' : t.title,
                done: t.isCompleted,
              }))
            );
          } else {
            setChecklist([]);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingDashboard(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const streamConfig = getStreamConfig(currentStream);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextDone = !item.done;
          fetch('/api/planner', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isCompleted: nextDone }),
          }).catch(() => {});
          return { ...item, done: nextDone };
        }
        return item;
      })
    );
  };

  const completedCount = checklist.filter((c) => c.done).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  // Authenticated user greeting calculation
  const displayName = user?.name ? user.name.split(' ')[0] : 'there';
  const displayDegree = user?.profile?.degree || streamConfig.degree;
  const displayStreamCode = user?.profile?.streamCode || streamConfig.code;
  const displaySemester = user?.profile?.semester || 5;

  // Personalization attributes from authenticated student profile
  const studentYear = user?.profile?.year || 1;
  const userGoals = user?.profile?.academicGoals || [];
  const userInterests = user?.profile?.interests || [];
  const studentStreamName = user?.profile?.stream || streamConfig.name;
  const preferredDuration = user?.profile?.studyDuration || '45 min';
  const studyStyle = user?.profile?.studyStyle || 'Deep Focus';
  const dailyGoal = user?.profile?.dailyStudyGoal || '2 hours';

  // Build dynamic personalized priorities
  const generatedPriorities: any[] = [];

  // Year 1 Foundation priority vs Year 4 Placement/Career priority
  if (studentYear === 1) {
    generatedPriorities.push({
      id: 'p-foundation',
      title: `${studentStreamName}: Freshman Foundation & Semester Orientation`,
      dueText: 'Syllabus structure, course rosters & foundational milestones • Est: 30 min',
      link: '/learning',
      actionText: 'Review',
    });
  } else if (studentYear >= 4 || userGoals.includes('Prepare for placements')) {
    generatedPriorities.push({
      id: 'p-career',
      title: `Placement Sprint: ${streamConfig.careerRoadmap.role} Dossier`,
      dueText: `Target ATS Score: ${streamConfig.careerRoadmap.atsTarget}% • Resume & System Design`,
      link: '/career',
      actionText: 'Open',
    });
  }

  // Exam Preparation goal
  if (userGoals.includes('Prepare for exams') || userGoals.includes('Improve my grades')) {
    generatedPriorities.push({
      id: 'p-exams',
      title: `${streamConfig.defaultSubjects[0]?.code || 'Core'}: Exam Review & Problem Sets`,
      dueText: `High-yield formula review & past question breakdowns • Est: ${preferredDuration}`,
      link: `/subjects/${streamConfig.defaultSubjects[0]?.code || 'CS-301'}?tab=quizzes`,
      actionText: 'Start',
    });
  }

  // Project Building goal or Coding interest
  if (userGoals.includes('Build projects') || userInterests.includes('Coding') || userInterests.includes('Web Development')) {
    generatedPriorities.push({
      id: 'p-projects',
      title: 'Capstone Project: Architecture & Sprint Deliverables',
      dueText: 'Active milestones & GitHub repository syncing • In Progress',
      link: '/projects',
      actionText: 'Code',
    });
  }

  // Fallback defaults if few priorities were generated
  if (generatedPriorities.length < 3) {
    generatedPriorities.push({
      id: 'p-core-study',
      title: `${streamConfig.defaultSubjects[0]?.name || studentStreamName}: Core Syllabus Orientation`,
      dueText: `Foundational concepts & syllabus roadmap • Est: ${preferredDuration}`,
      link: `/subjects/${streamConfig.defaultSubjects[0]?.code || 'CS-301'}`,
      actionText: 'Review',
    });
  }

  if (generatedPriorities.length < 3) {
    generatedPriorities.push({
      id: 'p-focus-block',
      title: `${studentStreamName} Independent Focus Session`,
      dueText: `Dedicated ${preferredDuration} study block (${studyStyle})`,
      link: '/planner',
      actionText: 'Plan',
    });
  }

  const priorities = dashboardData?.priorities || generatedPriorities;

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-lg pb-space-3xl animate-in fade-in duration-200">
      {/* 1. Reboot Digital Balance Warning Banner */}
      {showRebootBanner && dashboardData?.digitalBalance?.isAboveLimit && (
        <div className="w-full flex items-center justify-between px-space-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm shadow-sm transition-all">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-tag text-label-tag font-semibold uppercase tracking-wider">
              REBOOT
            </span>
            <span className="text-on-surface-variant">
              You&apos;re <strong className="text-on-surface font-medium">{dashboardData.digitalBalance.limitDeltaMins} minutes above</strong> your daily digital balance limit.
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <Link
              href="/reboot"
              className="font-button-text text-body-sm text-primary hover:text-primary-fixed flex items-center gap-1 transition-colors"
            >
              <span>Take Control</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <button
              onClick={() => setShowRebootBanner(false)}
              className="text-on-surface-variant hover:text-on-surface p-1"
              title="Dismiss warning"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Greeting Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant/80 uppercase">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span className="text-primary font-semibold">
              {displayDegree} {displayStreamCode} (Sem {displaySemester})
            </span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-semibold">
            {isLoadingUser ? (
              <span className="inline-block w-64 h-10 bg-surface-container rounded animate-pulse" />
            ) : (
              `Good morning, ${displayName}`
            )}
          </h1>
        </div>
        <p className="font-display-quote text-display-quote text-on-surface-variant/90 italic font-normal">
          &ldquo;Let&apos;s make today count.&rdquo;
        </p>
      </section>

      {/* Personalized Workspace Status Pills */}
      <div className="flex items-center gap-2 flex-wrap py-1">
        <div className="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs font-medium text-on-surface flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>{displayDegree} • {studentStreamName}</span>
          <span className="text-on-surface-variant font-mono text-[11px]">(Year {studentYear}, Sem {displaySemester})</span>
        </div>

        {userGoals.length > 0 && (
          <div className="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-primary">flag</span>
            <span>Focus: <strong className="text-on-surface font-medium">{userGoals.slice(0, 2).join(' • ')}</strong></span>
          </div>
        )}

        <div className="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-1.5 shadow-sm">
          <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span>
          <span>Goal: <strong className="text-on-surface font-medium">{dailyGoal}</strong> ({preferredDuration} / session)</span>
        </div>

        {userInterests.length > 0 && (
          <div className="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant hidden md:flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-primary">trending_up</span>
            <span>Growth: <strong className="text-on-surface font-medium">{userInterests.slice(0, 2).join(', ')}</strong></span>
          </div>
        )}
      </div>

      {/* 3. Primary Two-Column Asymmetric Productivity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: TODAY'S FOCUS PRIORITY QUEUE (62% width)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-space-md">
          {/* Section Subheading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <h2 className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface font-semibold tracking-wider">
                Today&apos;s Focus
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-tag text-[10px]">
                {priorities.length} priorities
              </span>
            </div>
            <span className="font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">
              Priority Queue
            </span>
          </div>

          {/* Queue Cards */}
          <div className="space-y-space-sm">
            {priorities.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="group relative rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 p-space-md transition-all shadow-sm flex items-center justify-between gap-space-md"
              >
                {/* Green vertical accent indicator bar */}
                {idx === 0 && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r" />
                )}

                <div className="flex items-center gap-space-md pl-2 min-w-0">
                  <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant font-semibold select-none">
                    0{idx + 1}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-headline-sm text-body-lg text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {item.dueText}
                    </p>
                  </div>
                </div>

                {item.isExternal ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-button-text text-button-text font-semibold transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                    <span>{item.actionText || 'Join'}</span>
                  </a>
                ) : (
                  <Link
                    href={item.link}
                    className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors shadow-sm shrink-0"
                  >
                    {item.actionText || 'Start'}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Full Day in Planner CTA link */}
          <div className="pt-space-xs">
            <Link
              href="/planner"
              className="inline-flex items-center gap-1.5 font-button-text text-body-sm text-on-surface-variant hover:text-primary transition-colors group"
            >
              <span>View full day in Planner</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: INTELLIGENCE & TELEMETRY PANELS (38% width) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-space-md">
          {/* Card 1: NIVORA INSIGHT ADVISORY */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[16px]">chevron_left</span>
                <span className="font-label-mono-wide text-[10px] uppercase tracking-widest text-primary font-semibold">
                  NIVORA INSIGHT
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>

            <div className="space-y-1">
              <p className="font-body-md text-on-surface font-medium leading-snug">
                &ldquo;{dashboardData?.insight?.message || (
                  currentStream === 'BBA'
                    ? 'Your recent Valuation quiz results show that DCF Terminal Multiple is currently your focus area.'
                    : currentStream === 'MECH'
                    ? 'Your recent Thermodynamics quiz results show that Heat Exchangers are currently your focus area.'
                    : currentStream === 'LAW'
                    ? 'Your recent Constitutional Law quiz results show that Basic Structure Doctrine is currently your focus area.'
                    : 'Your recent DSA quiz results show that Trees are currently your weakest topic.'
                )}&rdquo;
              </p>
              <p className="font-body-sm text-on-surface-variant">
                {dashboardData?.insight?.recommendation || 'Spend 40 minutes revising core topics before tomorrow\'s lecture.'}
              </p>
            </div>

            <div className="flex items-center gap-space-md pt-space-xs">
              <Link
                href="/learning"
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>Start Revision</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <button
                onClick={() => setShowWhyInsight(!showWhyInsight)}
                className="text-body-sm text-on-surface-variant hover:text-on-surface underline underline-offset-4 cursor-pointer"
              >
                Why this?
              </button>
            </div>

            {showWhyInsight && (
              <div className="p-2.5 rounded-lg bg-surface-container text-xs text-on-surface-variant space-y-1 animate-in fade-in duration-150">
                <p>
                  <strong>Deficit Vector</strong>: {dashboardData?.insight?.deficitVector || 'Quiz score was below your benchmark.'}
                </p>
                <p>
                  <strong>Impact</strong>: {dashboardData?.insight?.impact || 'Examination carries substantial weightage on final grade.'}
                </p>
              </div>
            )}
          </div>

          {/* Card 2: NEXT UP (Immediate Lecture Context) */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-label-mono-wide text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                NEXT UP
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-tag text-[10px] uppercase">
                On Campus
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-label-mono-wide text-xs text-primary font-semibold">
                {dashboardData?.nextClass?.time || '10:00 AM'}{' '}
                <span className="text-on-surface-variant font-normal">
                  ({dashboardData?.nextClass?.relativeTime || 'in 42 min'})
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {dashboardData?.nextClass?.title || (
                  currentStream === 'BBA'
                    ? 'Strategic Marketing (BBA-301)'
                    : currentStream === 'MECH'
                    ? 'Applied Thermodynamics (ME-301)'
                    : currentStream === 'LAW'
                    ? 'Constitutional Law II (LAW-301)'
                    : 'Database Management Systems (DBMS)'
                )}
              </h3>
              <p className="font-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span>
                  Lecture with {dashboardData?.nextClass?.instructor || 'Prof. Sharma'} • Room {dashboardData?.nextClass?.location || 'Hall B-204'}
                </span>
              </p>
            </div>

            <button
              onClick={() => setShowRoomGuide(true)}
              className="w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-button-text text-button-text font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>View Room Guide</span>
            </button>
          </div>

          {/* Card 3: DAILY PROGRESS & MILESTONES */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-sm shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-label-mono-wide text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                DAILY PROGRESS
              </span>
              <span className="font-label-mono-wide text-headline-sm text-primary font-bold">
                {progressPercent}%
              </span>
            </div>

            {/* Continuous Progress Bar Channel */}
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-label-tag text-label-tag text-on-surface-variant">
              <span>
                {checklist.length === 0
                  ? '0 priorities planned'
                  : `${completedCount} of ${checklist.length} priorities completed`}
              </span>
              <span className="text-secondary font-medium">
                {checklist.length === 0 ? 'Ready to plan' : progressPercent === 100 ? 'Completed' : 'On schedule'}
              </span>
            </div>

            {/* Micro Checklist */}
            {checklist.length === 0 ? (
              <div className="py-3 px-3 rounded-lg bg-surface-container/50 border border-outline-variant/20 text-center flex flex-col items-center justify-center">
                <p className="text-body-sm text-on-surface-variant font-medium">Nothing planned yet.</p>
                <Link
                  href="/planner"
                  className="mt-1 text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Planner</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`flex items-center gap-1.5 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                      item.done
                        ? 'bg-surface-container text-on-surface-variant line-through'
                        : 'bg-surface-container-high text-on-surface hover:text-primary'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        item.done ? 'text-primary' : 'text-outline-variant'
                      }`}
                    >
                      {item.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className="truncate">
                      {item.time} {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="font-display-quote text-body-sm italic text-on-surface-variant/80 pt-1">
              {checklist.length === 0
                ? '\u201CPlan your daily study session to stay ahead.\u201D'
                : '\u201CYou\u2019re ahead of schedule today.\u201D'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom System Status Bar */}
      <footer className="pt-space-xl border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-surface-variant font-label-mono-wide text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>NIVORA Workspace v2.4</span>
          <span>•</span>
          <span>Academic Core</span>
          <span>•</span>
          <span className="text-secondary">{streamConfig.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tour" className="text-primary hover:underline flex items-center gap-1 font-semibold">
            <span>Ecosystem Tour</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </Link>
          <span>•</span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/30">⌘K</kbd> for Command Palette</span>
          <span>•</span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/30">/</kbd> to search</span>
        </div>
      </footer>

      {/* Room Guide Modal */}
      {showRoomGuide && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRoomGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-space-lg shadow-2xl space-y-space-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
                <h3 className="font-headline-sm text-on-surface font-semibold">
                  Room Guide: {dashboardData?.nextClass?.location || 'Hall B-204'}
                </h3>
              </div>
              <button
                onClick={() => setShowRoomGuide(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-space-xs text-body-sm text-on-surface-variant">
              <p><strong>Location</strong>: Academic Block C, 2nd Floor, West Wing.</p>
              <p><strong>Capacity</strong>: 90 Tiered Seats • High-Speed Institutional WiFi &amp; Terminal Power Ports.</p>
              <p><strong>Instructor</strong>: {dashboardData?.nextClass?.instructor || 'Dr. K. Sharma'} (Office Hours: Tue/Thu 3 PM).</p>
              <p><strong>Current Stream</strong>: {streamConfig.name}.</p>
            </div>
            <button
              onClick={() => setShowRoomGuide(false)}
              className="w-full py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="p-space-xl text-on-surface-variant font-mono text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[20px] text-primary">progress_activity</span>
          <span>Loading NIVORA Command Center...</span>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
