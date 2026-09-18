'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface ExamItem {
  id: string;
  code: string;
  name: string;
  desc: string;
  date: string;
  time: string;
  hall: string;
  proctor: string;
  weightage: string;
  daysAway: number;
  mastery: number;
  statusTag: string;
  statusType: 'success' | 'warning' | 'error' | 'normal';
  strongRetention: string;
  intervention: string;
  revisionSheets: number;
}

const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    code: 'CS-301',
    name: 'Database Management Systems (DBMS)',
    desc: 'Mid-Term Theory Examination • Core Relational Theory & Concurrency',
    date: 'Thursday, September 18, 2025',
    time: '09:30 AM – 12:30 PM (3.0 hrs)',
    hall: 'Hall C, East Academic Block',
    proctor: 'Dr. A. Sharma',
    weightage: '30%',
    daysAway: 8,
    mastery: 78,
    statusTag: 'IMMEDIATE NEXT EVALUATION',
    statusType: 'warning',
    strongRetention: 'Relational Algebra, SQL DDL/DML, 3NF Normalization',
    intervention: 'B+ Tree Concurrency & Lock Escalation (Scheduled for 40m recall)',
    revisionSheets: 4,
  },
  {
    id: 'exam-2',
    code: 'CS-302',
    name: 'Data Structures & Algorithms (DSA)',
    desc: 'Theory & Practicum Assessment • Trees, Graphs & Dynamic Programming',
    date: 'Monday, September 22, 2025',
    time: '09:30 AM – 12:30 PM (3.0 hrs)',
    hall: 'Computing Center 2',
    proctor: 'Prof. A. Bannerjee',
    weightage: '25%',
    daysAway: 12,
    mastery: 86,
    statusTag: 'LAB + WRITTEN',
    statusType: 'success',
    strongRetention: 'AVL Trees, Graph Traversals, Heaps, BFS/DFS',
    intervention: 'Red-Black Tree Deletions & Binary Lifting (62% confidence)',
    revisionSheets: 3,
  },
  {
    id: 'exam-3',
    code: 'CS-303',
    name: 'Operating Systems Architecture (OS)',
    desc: 'Mid-Semester Theory • Process Synchronization & Memory Paging',
    date: 'Thursday, September 25, 2025',
    time: '02:00 PM – 05:00 PM (3.0 hrs)',
    hall: 'Hall A-104',
    proctor: 'Prof. C. Verma',
    weightage: '25%',
    daysAway: 15,
    mastery: 64,
    statusTag: 'NEEDS REVISION',
    statusType: 'error',
    strongRetention: 'Process Scheduling, Paging Mechanisms, Virtual Memory',
    intervention: "Deadlock Banker's Algorithm, Semaphore Proofs",
    revisionSheets: 2,
  },
  {
    id: 'exam-4',
    code: 'CS-304',
    name: 'Computer Networks (CN)',
    desc: 'Protocol Layers, Subnetting & Congestion Control',
    date: 'Monday, September 29, 2025',
    time: '09:30 AM – 12:30 PM (3.0 hrs)',
    hall: 'Hall B-201',
    proctor: 'Prof. S. Sengupta',
    weightage: '20%',
    daysAway: 19,
    mastery: 55,
    statusTag: 'ON TRACK',
    statusType: 'normal',
    strongRetention: 'OSI Model, IPv4/IPv6 Addressing, Subnetting',
    intervention: 'TCP Congestion Window Mechanics & BGP Routing Invariants',
    revisionSheets: 3,
  },
];

export default function ExamCenterPage() {
  const { currentStream } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [viewMode, setViewMode] = useState<'chronological' | 'readiness'>('chronological');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [activeDrill, setActiveDrill] = useState<ExamItem | null>(null);

  // Quick Spaced Repetition items
  const [spacedItems, setSpacedItems] = useState([
    { id: 'sr-1', topic: 'B+ Tree Concurrency Locks', time: '16:00 Today', duration: '40m', done: false },
    { id: 'sr-2', topic: 'Banker\'s Deadlock Safety Proofs', time: '10:00 Tomorrow', duration: '35m', done: false },
    { id: 'sr-3', topic: 'TCP Reno vs Vegas Sliding Window', time: '17:30 Sep 10', duration: '25m', done: false },
  ]);

  const toggleSpacedItem = (id: string) => {
    setSpacedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const primaryExam = INITIAL_EXAMS[0];

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Context Subheader & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-label-tag text-label-tag text-on-surface-variant uppercase tracking-widest border border-outline-variant/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Assessment Cadence • {streamData.name.toUpperCase()}
            </span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant/60">
              SYS-REV: 4.8.2
            </span>
          </div>

          <h1 className="font-display-quote text-[34px] leading-[40px] text-on-surface font-normal tracking-tight">
            Exam Center
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Strategic preparation cadence, cognitive syllabus mastery, and spaced revision timelines designed for composed retention.
          </p>
        </div>

        {/* Header Stats & Revision Action Trigger */}
        <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg bg-surface-container shadow-sm border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[18px]">event_note</span>
            <div className="flex flex-col">
              <span className="font-label-tag text-label-tag text-on-surface-variant/80 uppercase">Term</span>
              <span className="font-headline-sm text-body-sm text-on-surface">Mid-Semester Eval</span>
            </div>
          </div>

          <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg bg-surface-container shadow-sm border border-outline-variant/20">
            <span className="material-symbols-outlined text-tertiary text-[18px]">fact_check</span>
            <div className="flex flex-col">
              <span className="font-label-tag text-label-tag text-on-surface-variant/80 uppercase">Papers</span>
              <span className="font-headline-sm text-body-sm text-on-surface">
                {INITIAL_EXAMS.length} Scheduled
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsRevisionModalOpen(true)}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-button-text text-button-text shadow-md shadow-primary/10"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Generate Revision Cycle</span>
          </button>
        </div>
      </div>

      {/* Prominent Hero Focus — Impending Exam Banner */}
      <section className="relative rounded-2xl bg-surface-container-low p-space-lg lg:p-space-xl overflow-hidden shadow-xl border border-outline-variant/30">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-xl">
          {/* Left Info Block */}
          <div className="space-y-space-md max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-label-tag font-semibold uppercase tracking-wider">
                {primaryExam.statusTag}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-wide text-label-mono-wide">
                SEAT C-42
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-wide text-label-mono-wide">
                WEIGHTAGE {primaryExam.weightage}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {primaryExam.code}: {primaryExam.name}
              </h2>
              <p className="font-display-quote text-display-quote text-on-surface-variant italic">
                {primaryExam.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-1">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                <span>{primaryExam.date} • {primaryExam.time}</span>
              </div>
              <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
                <span>{primaryExam.hall} • Proctor: {primaryExam.proctor}</span>
              </div>
            </div>

            {/* Progress & Telemetry */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-on-surface font-medium">
                  Preparation Velocity: {primaryExam.mastery}% Syllabus Mastered
                </span>
                <span className="font-label-mono-wide text-label-mono-wide text-primary">
                  4 of 5 Core Modules Cleared
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${primaryExam.mastery}%` }}
                ></div>
              </div>
            </div>

            {/* Spaced Retrieval Notice */}
            <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg bg-surface-container text-on-surface-variant font-body-sm text-body-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-[18px]">history_edu</span>
              <span>
                <strong className="text-on-surface font-medium">Spaced Retrieval Trigger:</strong>{' '}
                {primaryExam.intervention}
              </span>
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
                  0{primaryExam.daysAway}
                </span>
                <div className="flex flex-col">
                  <span className="font-label-mono-wide text-label-mono-wide text-on-surface uppercase font-semibold">
                    Days to Exam
                  </span>
                  <span className="font-label-tag text-label-tag text-on-surface-variant">
                    {primaryExam.daysAway * 24} Hours Buffer
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs pt-space-xs">
              <button
                onClick={() => setIsMockModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-space-md rounded-lg bg-primary text-on-primary font-button-text text-button-text hover:bg-primary-container transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                <span>Launch Focused Mock Test</span>
              </button>

              <div className="grid grid-cols-2 gap-space-xs">
                <a
                  href="/resources"
                  className="flex items-center justify-center gap-1.5 py-2 px-space-xs rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-button-text text-body-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  <span>PYQs (20-24)</span>
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

      {/* Main Asynchronous Content Grid (2 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl">
        {/* Left / Main Column (Detailed Exam Schedule) */}
        <div className="xl:col-span-8 flex flex-col space-y-space-lg">
          {/* Section Header with View Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-1">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Upcoming Examinations Schedule</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Structured chronological pipeline with mastery diagnostics
              </p>
            </div>

            <div className="flex items-center bg-surface-container p-1 rounded-lg border border-outline-variant/20">
              <button
                onClick={() => setViewMode('chronological')}
                className={`px-3 py-1 rounded text-body-sm font-semibold transition-all ${
                  viewMode === 'chronological'
                    ? 'bg-surface-container-high text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Chronological Timeline
              </button>
              <button
                onClick={() => setViewMode('readiness')}
                className={`px-3 py-1 rounded text-body-sm font-semibold transition-all ${
                  viewMode === 'readiness'
                    ? 'bg-surface-container-high text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Readiness Matrix
              </button>
            </div>
          </div>

          {/* Schedule Cards Container */}
          <div className="flex flex-col space-y-space-md">
            {INITIAL_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="rounded-xl bg-surface-container-low p-space-lg space-y-space-md hover:bg-surface-container transition-all shadow-sm border border-outline-variant/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-mono-wide text-label-mono-wide text-primary font-semibold">
                        {exam.code}
                      </span>
                      <span className="font-label-tag text-label-tag text-on-surface-variant">
                        {exam.daysAway} DAYS AWAY
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-tag text-label-tag ${
                          exam.statusType === 'error'
                            ? 'bg-error-container/40 text-error'
                            : exam.statusType === 'warning'
                            ? 'bg-tertiary-container/40 text-tertiary'
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}
                      >
                        {exam.statusTag}
                      </span>
                    </div>

                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {exam.name}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {exam.hall} • {exam.date} • Proctor: {exam.proctor}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span
                      className={`font-headline-md text-headline-md font-semibold ${
                        exam.mastery < 70 ? 'text-tertiary' : 'text-primary'
                      }`}
                    >
                      {exam.mastery}%
                    </span>
                    <span className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                      Mastery
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="space-y-1">
                  <div className="flex justify-between font-label-mono-wide text-label-mono-wide text-on-surface-variant">
                    <span>PROGRESS VELOCITY</span>
                    <span className="text-on-surface">Target 90%+ before term evaluation</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        exam.mastery < 70 ? 'bg-tertiary' : 'bg-primary'
                      }`}
                      style={{ width: `${exam.mastery}%` }}
                    ></div>
                  </div>
                </div>

                {/* Diagnostic Chips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xs pt-1">
                  <div className="p-2 rounded bg-surface-container flex items-start gap-2 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">verified</span>
                    <div className="text-body-sm">
                      <span className="text-on-surface-variant font-label-tag text-label-tag uppercase block">
                        Strong Retention
                      </span>
                      <span className="text-on-surface text-body-sm">{exam.strongRetention}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-surface-container flex items-start gap-2 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">warning</span>
                    <div className="text-body-sm">
                      <span className="text-on-surface-variant font-label-tag text-label-tag uppercase block">
                        Intervention Required
                      </span>
                      <span className="text-on-surface text-body-sm">{exam.intervention}</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/40">
                  <span className="font-label-tag text-label-tag text-on-surface-variant">
                    {exam.revisionSheets} REVISION SHEETS AVAILABLE
                  </span>

                  <div className="flex items-center gap-space-xs">
                    <a
                      href={`/subjects`}
                      className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-button-text text-body-sm transition-colors"
                    >
                      Study Roadmap
                    </a>
                    <button
                      onClick={() => setActiveDrill(exam)}
                      className="px-3 py-1.5 rounded bg-primary/20 text-primary hover:bg-primary/30 font-button-text text-body-sm transition-colors"
                    >
                      Start Drill
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Contextual Intelligence, Spaced Retrieval & Cadence) */}
        <div className="xl:col-span-4 flex flex-col space-y-space-lg">
          {/* Card 1: Cognitive Readiness & Spaced Repetition */}
          <div className="rounded-xl bg-surface-container-low p-space-lg space-y-space-md shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Cognitive Cadence</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-tag text-label-tag text-primary font-mono">
                12-DAY STREAK
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Ebbinghaus forgetting curve protection algorithm tuned to your morning peak alertness.
            </p>

            {/* Retention Curve Graph */}
            <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <div className="flex justify-between font-label-mono-wide text-label-tag text-on-surface-variant">
                <span>RETENTION PROJECTION</span>
                <span className="text-primary font-bold">92% WITH RETRIEVAL</span>
              </div>
              <svg className="w-full h-24 text-primary" fill="none" viewBox="0 0 280 90">
                <path
                  d="M10,20 Q60,50 120,40 T200,25 T270,15"
                  fill="none"
                  stroke="#8fc5a7"
                  strokeWidth="2.5"
                />
                <path
                  d="M10,20 Q60,70 120,80 T200,85 T270,88"
                  fill="none"
                  stroke="#404943"
                  strokeDasharray="4 4"
                  strokeWidth="2"
                />
                <circle cx="120" cy="40" r="4" fill="#8fc5a7" />
                <circle cx="200" cy="25" r="4" fill="#8fc5a7" />
              </svg>
              <div className="flex justify-between text-label-tag font-label-tag text-on-surface-variant/80">
                <span>Day 0 (Initial Learn)</span>
                <span className="text-primary">Day 7 (Recall)</span>
                <span>Exam Day</span>
              </div>
            </div>
          </div>

          {/* Card 2: Spaced Revision Queue */}
          <div className="rounded-xl bg-surface-container-low p-space-lg space-y-space-md shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">update</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Spaced Revision Queue</h4>
              </div>
              <span className="font-label-tag text-label-tag text-on-surface-variant uppercase tracking-widest">
                ACTIVE
              </span>
            </div>

            <div className="space-y-space-xs">
              {spacedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSpacedItem(item.id)}
                  className={`p-space-sm rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    item.done
                      ? 'bg-surface-container/50 border-outline-variant/10 opacity-60 line-through'
                      : 'bg-surface-container border-outline-variant/20 hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-body-sm font-medium text-on-surface">{item.topic}</div>
                    <div className="font-label-mono-wide text-label-tag text-on-surface-variant">
                      {item.time} · {item.duration} recall
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      item.done ? 'text-primary' : 'text-on-surface-variant/60'
                    }`}
                  >
                    {item.done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GENERATE REVISION CYCLE AI MODAL */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-2xl shadow-2xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  NIVORA AI Revision Cycle Generator
                </h3>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Synthesized an adaptive 14-day spaced retrieval schedule balancing upcoming mid-semester examinations against weak topics identified in recent quizzes:
            </p>

            <div className="space-y-2 font-body-sm text-body-sm">
              <div className="p-space-sm rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <strong className="text-on-surface">Block A: CS-301 DBMS Normalization & B+ Trees</strong>
                  <div className="text-on-surface-variant text-label-tag">Tomorrow • 16:00 – 17:15 (75 min) • Spaced Recall 2</div>
                </div>
                <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-tag text-label-tag">
                  Auto-Scheduled
                </span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <strong className="text-on-surface">Block B: CS-303 OS Banker&apos;s Algorithm & Semaphores</strong>
                  <div className="text-on-surface-variant text-label-tag">Wednesday • 10:30 – 11:45 (75 min) • Weak Area Remediation</div>
                </div>
                <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-tag text-label-tag">
                  Auto-Scheduled
                </span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <strong className="text-on-surface">Block C: CS-302 Red-Black Tree Deletion Traces</strong>
                  <div className="text-on-surface-variant text-label-tag">Friday • 14:00 – 15:00 (60 min) • Practicum Drill</div>
                </div>
                <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-tag text-label-tag">
                  Auto-Scheduled
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-space-xs pt-space-xs">
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text"
              >
                Dismiss
              </button>
              <a
                href="/planner"
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-colors font-button-text text-button-text font-semibold"
              >
                Sync to Planner Calendar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MOCK TEST MODAL */}
      {(isMockModalOpen || activeDrill) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-2xl shadow-2xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">quiz</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Focused Examination Drill: {activeDrill ? activeDrill.code : primaryExam.code}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsMockModalOpen(false);
                  setActiveDrill(null);
                }}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <span className="font-label-mono-wide text-label-tag text-tertiary uppercase">
                PYQ Question 1 of 5 • 6 Marks
              </span>
              <p className="font-body-md text-body-md text-on-surface font-medium">
                Under what condition does a B+ Tree secondary index split cause an internal parent node overflow? State the minimum keys in an order-p internal node.
              </p>
            </div>

            <textarea
              rows={4}
              placeholder="Enter technical explanation or proof trace..."
              className="w-full p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />

            <div className="flex items-center justify-between pt-space-xs">
              <span className="font-label-mono-wide text-label-tag text-on-surface-variant">
                Time Remaining: 14m 32s
              </span>
              <button
                onClick={() => {
                  alert('Submission verified! Score: 5.5/6. Telemetry updated.');
                  setIsMockModalOpen(false);
                  setActiveDrill(null);
                }}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
