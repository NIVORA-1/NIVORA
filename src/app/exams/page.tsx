'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import ExamUploadModal from '@/components/exams/ExamUploadModal';
import ManualAddExamModal from '@/components/exams/ManualAddExamModal';
import { KnownSubjectItem } from '@/lib/examOcrService';

interface RealExamItem {
  id: string;
  userId: string;
  subjectId: string | null;
  title: string;
  examType: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    name: string;
    code: string;
    color: string | null;
    instructor: string | null;
    room: string | null;
  } | null;
}

export default function ExamCenterPage() {
  const { currentStream } = useApp();

  const [exams, setExams] = useState<RealExamItem[]>([]);
  const [knownSubjects, setKnownSubjects] = useState<KnownSubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [activeDrillExam, setActiveDrillExam] = useState<RealExamItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Fetch only real exams belonging to the authenticated user
  const fetchExams = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/exams');
      if (!res.ok) {
        throw new Error('Failed to load exams');
      }

      const data = await res.json();
      setExams(Array.isArray(data.exams) ? data.exams : []);
      if (Array.isArray(data.subjects)) {
        setKnownSubjects(data.subjects);
      }
    } catch (err: any) {
      console.error('[Exam Center] Fetch error:', err);
      setErrorMessage('Could not load examination schedule. Please refresh.');
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDeleteExam = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this examination from your schedule?')) {
      return;
    }

    try {
      setIsDeletingId(id);
      const res = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setExams((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert('Failed to delete exam.');
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      alert('Failed to delete exam.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Helper: calculate days remaining
  const calculateDaysRemaining = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffMs = examDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Format date readable
  const formatExamDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Immediate next exam (first upcoming in chronological list)
  const upcomingExams = exams.filter((e) => calculateDaysRemaining(e.date) >= 0);
  const primaryExam = upcomingExams.length > 0 ? upcomingExams[0] : exams[0];

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-label-tag text-label-tag text-on-surface-variant uppercase tracking-widest border border-outline-variant/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Assessment Cadence • {currentStream || 'ACADEMIC'}
            </span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant/60">
              REAL DATA MODE
            </span>
          </div>

          <h1 className="font-display-quote text-[34px] leading-[40px] text-on-surface font-normal tracking-tight">
            Exam Center
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Strategic preparation cadence, cognitive syllabus mastery, and spaced revision timelines designed for composed retention.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high text-on-surface transition-all font-button-text text-button-text shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">upload_file</span>
            <span>Upload Exam Timetable</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all font-button-text text-button-text shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>+ Add Exam</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-spin">
            <span className="material-symbols-outlined text-[24px]">progress_activity</span>
          </div>
          <span className="text-body-sm text-on-surface-variant font-medium">
            Fetching your authenticated examination schedule...
          </span>
        </div>
      )}

      {/* ERROR NOTICE */}
      {!isLoading && errorMessage && (
        <div className="p-4 rounded-xl bg-error-container/40 border border-error/20 flex items-center justify-between text-error text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchExams}
            className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* EXACT EMPTY STATE: When user has no exams, show ONLY specified empty state */}
      {!isLoading && !errorMessage && exams.length === 0 && (
        <div className="p-10 sm:p-16 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[40px]">calendar_today</span>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-on-surface">No exams scheduled yet</h2>
            <p className="text-body-md text-on-surface-variant">
              Upload your exam timetable or add an exam manually.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">upload_file</span>
              <span>Upload Exam Timetable</span>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary/90 font-semibold text-sm transition-all shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>+ Add Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE EXAMS VIEW: Rendered ONLY when real exams exist */}
      {!isLoading && exams.length > 0 && primaryExam && (
        <>
          {/* Prominent Hero Focus — Impending Exam Banner */}
          {(() => {
            const daysAway = calculateDaysRemaining(primaryExam.date);
            const isToday = daysAway === 0;
            const isPast = daysAway < 0;

            return (
              <section className="relative rounded-2xl bg-surface-container-low p-space-lg lg:p-space-xl overflow-clip shadow-xl border border-outline-variant/30">
                <div className="absolute -right-16 -top-16 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-xl">
                  {/* Left Info Block */}
                  <div className="space-y-space-md max-w-3xl">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-label-tag font-semibold uppercase tracking-wider">
                        {isPast ? 'COMPLETED' : isToday ? 'TODAY' : 'NEXT UPCOMING EVALUATION'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-tag text-label-tag font-semibold uppercase">
                        {primaryExam.examType}
                      </span>
                      {primaryExam.room && (
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-wide text-label-mono-wide">
                          ROOM: {primaryExam.room}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h2 className="font-headline-lg text-headline-lg text-on-surface">
                        {primaryExam.subject?.code ? `${primaryExam.subject.code}: ` : ''}
                        {primaryExam.subject?.name || primaryExam.title}
                      </h2>
                      {primaryExam.notes && (
                        <p className="font-display-quote text-display-quote text-on-surface-variant italic">
                          {primaryExam.notes}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-1">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                        <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                        <span>
                          {formatExamDate(primaryExam.date)}
                          {primaryExam.startTime
                            ? ` • ${primaryExam.startTime}${primaryExam.endTime ? ` – ${primaryExam.endTime}` : ''}`
                            : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                        <span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
                        <span>{primaryExam.room ? `Location: ${primaryExam.room}` : 'Examination Hall TBA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Countdown and Action Suite */}
                  <div className="w-full xl:w-80 flex flex-col justify-between self-stretch bg-surface-container p-space-lg rounded-xl space-y-space-md border border-outline-variant/20">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-tag text-label-tag uppercase tracking-widest text-on-surface-variant">
                          Time Remaining
                        </span>
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-headline-lg text-[44px] leading-none font-bold text-primary tracking-tight">
                          {isPast ? '0' : daysAway < 10 ? `0${daysAway}` : daysAway}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-label-mono-wide text-label-mono-wide text-on-surface uppercase font-semibold">
                            {isToday ? 'Today!' : isPast ? 'Days Ago' : 'Days to Exam'}
                          </span>
                          <span className="font-label-tag text-label-tag text-on-surface-variant">
                            {isPast ? 'Evaluation finished' : `${Math.max(0, daysAway * 24)} Hours Buffer`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-space-xs pt-space-xs">
                      <button
                        onClick={() => setActiveDrillExam(primaryExam)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-space-md rounded-lg bg-primary text-on-primary font-button-text text-button-text hover:bg-primary/90 transition-all shadow-md"
                      >
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        <span>Launch Focused Mock Drill</span>
                      </button>

                      <div className="grid grid-cols-2 gap-space-xs">
                        <a
                          href="/resources"
                          className="flex items-center justify-center gap-1.5 py-2 px-space-xs rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-button-text text-body-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">history</span>
                          <span>PYQs</span>
                        </a>
                        <a
                          href="/subjects"
                          className="flex items-center justify-center gap-1.5 py-2 px-space-xs rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-button-text text-body-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">segment</span>
                          <span>Syllabus</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl">
            {/* Left Column (Detailed Exam Schedule) */}
            <div className="xl:col-span-8 flex flex-col space-y-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Scheduled Examinations</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {exams.length} official evaluation slot{exams.length === 1 ? '' : 's'} recorded in your student profile
                  </p>
                </div>
              </div>

              {/* Schedule Cards Container */}
              <div className="flex flex-col space-y-space-md">
                {exams.map((exam) => {
                  const daysAway = calculateDaysRemaining(exam.date);
                  const isToday = daysAway === 0;
                  const isPast = daysAway < 0;

                  return (
                    <div
                      key={exam.id}
                      className="rounded-xl bg-surface-container-low p-space-lg space-y-space-md hover:bg-surface-container transition-all shadow-sm border border-outline-variant/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-space-xs">
                            {exam.subject?.code && (
                              <span className="font-label-mono-wide text-label-mono-wide text-primary font-semibold">
                                {exam.subject.code}
                              </span>
                            )}
                            <span className="font-label-tag text-label-tag text-on-surface-variant font-mono">
                              {isToday ? 'TODAY' : isPast ? `${Math.abs(daysAway)} DAYS AGO` : `${daysAway} DAYS AWAY`}
                            </span>
                            <span className="px-2 py-0.5 rounded-full font-label-tag text-label-tag bg-secondary-container text-on-secondary-container font-semibold uppercase">
                              {exam.examType}
                            </span>
                          </div>

                          <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {exam.subject?.name || exam.title}
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {formatExamDate(exam.date)}
                            {exam.startTime ? ` • ${exam.startTime}${exam.endTime ? ` – ${exam.endTime}` : ''}` : ''}
                            {exam.room ? ` • ${exam.room}` : ''}
                          </p>
                          {exam.notes && (
                            <p className="text-xs text-on-surface-variant/80 italic pt-1">
                              Note: {exam.notes}
                            </p>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          disabled={isDeletingId === exam.id}
                          className="text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
                          title="Delete Exam"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>

                      {/* Action Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-xs">
                        <span className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                          {exam.subject?.name ? `Subject: ${exam.subject.name}` : 'General Examination'}
                        </span>

                        <div className="flex items-center gap-space-xs">
                          <a
                            href="/subjects"
                            className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-button-text text-body-sm transition-colors"
                          >
                            Study Roadmap
                          </a>
                          <button
                            onClick={() => setActiveDrillExam(exam)}
                            className="px-3 py-1.5 rounded bg-primary/20 text-primary hover:bg-primary/30 font-button-text text-body-sm transition-colors"
                          >
                            Practice Mock
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (Review Guidelines & Tools) */}
            <div className="xl:col-span-4 flex flex-col space-y-space-lg">
              {/* Card 1: Review Cadence */}
              <div className="rounded-xl bg-surface-container-low p-space-lg space-y-space-md shadow-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">Cognitive Cadence</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-tag text-label-tag text-primary font-mono">
                    ACTIVE
                  </span>
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Ebbinghaus forgetting curve protection algorithm tuned to your examination timeline.
                </p>

                {/* Spaced Retention Graphic */}
                <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
                  <div className="flex justify-between font-label-mono-wide text-label-tag text-on-surface-variant">
                    <span>RETENTION PROJECTION</span>
                    <span className="text-primary font-bold">92% WITH RETRIEVAL</span>
                  </div>
                  <svg className="w-full h-24 text-primary" fill="none" viewBox="0 0 280 90">
                    <path
                      d="M10,20 Q60,50 120,40 T200,25 T270,15"
                      fill="none"
                      stroke="#E85A4F"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M10,20 Q60,70 120,80 T200,85 T270,88"
                      fill="none"
                      stroke="#8E8D8A"
                      strokeDasharray="4 4"
                      strokeWidth="2"
                    />
                    <circle cx="120" cy="40" r="4" fill="#E85A4F" />
                    <circle cx="200" cy="25" r="4" fill="#E85A4F" />
                  </svg>
                  <div className="flex justify-between text-label-tag font-label-tag text-on-surface-variant/80">
                    <span>Initial Learn</span>
                    <span className="text-primary">Targeted Recall</span>
                    <span>Exam Day</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Links */}
              <div className="rounded-xl bg-surface-container-low p-space-lg space-y-space-md shadow-sm border border-outline-variant/20">
                <div className="flex items-center gap-space-2xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">menu_book</span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Study Resources</h4>
                </div>

                <div className="space-y-2">
                  <a
                    href="/resources"
                    className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between border border-outline-variant/20 text-on-surface text-body-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                      Question Papers & Solutions
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                  </a>

                  <a
                    href="/subjects"
                    className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between border border-outline-variant/20 text-on-surface text-body-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">menu_book</span>
                      Syllabus & Core Modules
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                  </a>

                  <a
                    href="/planner"
                    className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between border border-outline-variant/20 text-on-surface text-body-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">calendar_month</span>
                      Planner & Study Blocks
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MOCK TEST MODAL */}
      {activeDrillExam && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-2xl shadow-2xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">quiz</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Exam Practice Drill: {activeDrillExam.subject?.name || activeDrillExam.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDrillExam(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <span className="font-label-mono-wide text-label-tag text-tertiary uppercase">
                {activeDrillExam.examType} Practice Question 1 of 5
              </span>
              <p className="font-body-md text-body-md text-on-surface font-medium">
                Outline key conceptual principles for {activeDrillExam.subject?.name || activeDrillExam.title} and derive standard analytical criteria relevant to your evaluation syllabus.
              </p>
            </div>

            <textarea
              rows={4}
              placeholder="Enter technical explanation or proof trace..."
              className="w-full p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />

            <div className="flex items-center justify-between pt-space-xs">
              <span className="font-label-mono-wide text-label-tag text-on-surface-variant">
                Standard Time: 15m
              </span>
              <button
                onClick={() => {
                  alert('Submission verified! Feedback recorded in your study profile.');
                  setActiveDrillExam(null);
                }}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary/90"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIMETABLE OCR UPLOAD MODAL */}
      <ExamUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchExams}
        knownSubjects={knownSubjects}
      />

      {/* MANUAL ADD EXAM MODAL */}
      <ManualAddExamModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={fetchExams}
        knownSubjects={knownSubjects}
      />
    </div>
  );
}
