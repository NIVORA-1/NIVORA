'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface AssignmentItem {
  id: string;
  code: string;
  title: string;
  desc: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  dueDate: string;
  dueHours: string;
  estTime: string;
  instructor: string;
  status: 'pending' | 'in_progress' | 'under_review' | 'completed';
  progress: number;
  points: number;
  weight: string;
  autograder?: string;
  type: string;
}

const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    code: 'CS-301',
    title: 'DBMS Assignment 03: Normalization & B+ Tree Indexing Decompositions',
    desc: 'Prove 3NF and BCNF minimal covers for the hospital transaction schemas. Provide dependency preservation matrices and secondary B+ tree index recalculations for table partition splits.',
    priority: 'CRITICAL',
    dueDate: 'Tomorrow at 11:59 PM',
    dueHours: '14h 22m',
    estTime: '35 min',
    instructor: 'Prof. Dr. K. Sharma',
    status: 'in_progress',
    progress: 75,
    points: 30,
    weight: '15% Internal',
    autograder: '8/10 test cases passing • Bernstein 3NF synthesis ready',
    type: 'LaTeX + SQL Repo',
  },
  {
    id: 'asg-2',
    code: 'CS-303',
    title: 'OS Lab: Producer-Consumer Thread Synchronization in C',
    desc: 'Implementation of bounded POSIX circular buffers using POSIX mutexes and counting semaphores with deadlock prevention guarantees.',
    priority: 'MEDIUM',
    dueDate: 'Friday, Sep 11',
    dueHours: '3 days',
    estTime: '50 min',
    instructor: 'Prof. Nair',
    status: 'in_progress',
    progress: 40,
    points: 25,
    weight: '10% Lab',
    type: 'C11 POSIX System Code',
  },
  {
    id: 'asg-3',
    code: 'CS-304',
    title: 'Computer Networks: Subnetting & CIDR Calculation Sheet',
    desc: 'Variable Length Subnet Masking (VLSM) topology design for a 4-tier campus enterprise network with route aggregation tables.',
    priority: 'NORMAL',
    dueDate: 'Sep 14',
    dueHours: '6 days',
    estTime: '25 min',
    instructor: 'Prof. Sengupta',
    status: 'pending',
    progress: 0,
    points: 20,
    weight: '5% Homework',
    type: 'Analytical Problem Set',
  },
  {
    id: 'asg-4',
    code: 'CS-305',
    title: 'Distributed Systems: Consensus Algorithms Whitepaper Review',
    desc: 'Comparative analysis between Raft leadership leases and Multi-Paxos quorum invariants under asymmetric network partitions.',
    priority: 'NORMAL',
    dueDate: 'Sep 16',
    dueHours: '8 days',
    estTime: '60 min',
    instructor: 'Dr. V. Raman',
    status: 'in_progress',
    progress: 25,
    points: 30,
    weight: '12% Internal',
    type: 'Whitepaper Review',
  },
  {
    id: 'asg-5',
    code: 'ALGO-201',
    title: 'DSA Weekly Contest Problem Set #4',
    desc: 'Dynamic programming over trees, LCA queries via binary lifting, and disjoint-set cycle detection with path compression.',
    priority: 'HIGH',
    dueDate: 'Sunday',
    dueHours: '4 days',
    estTime: '90 min',
    instructor: 'Prof. Bannerjee',
    status: 'in_progress',
    progress: 50,
    points: 50,
    weight: '15% Practicum',
    type: 'Autograded Contest',
  },
  {
    id: 'asg-6',
    code: 'CS-301',
    title: 'DBMS Quiz 1: Relational Algebra & Query Optimization',
    desc: 'Relational calculus translation and heuristic query tree cost estimation.',
    priority: 'NORMAL',
    dueDate: 'Submitted Sep 04',
    dueHours: 'Graded',
    estTime: 'Completed',
    instructor: 'Prof. Sharma',
    status: 'completed',
    progress: 100,
    points: 20,
    weight: '5% Internal',
    type: 'Mid-term Quiz',
  },
];

export default function AssignmentsPage() {
  const { currentStream, setIsQuickAddOpen } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'review' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);

  // Modals state
  const [activeSubmission, setActiveSubmission] = useState<AssignmentItem | null>(null);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isTestingRun, setIsTestingRun] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [tokenBannerDismissed, setTokenBannerDismissed] = useState(false);
  const [tokenApplied, setTokenApplied] = useState(false);

  const filteredAssignments = assignments.filter((item) => {
    if (selectedSubject !== 'ALL' && !item.code.includes(selectedSubject)) return false;
    if (activeTab === 'today') return item.dueDate.toLowerCase().includes('tomorrow') || item.dueDate.toLowerCase().includes('today');
    if (activeTab === 'upcoming') return item.status === 'pending' || item.status === 'in_progress';
    if (activeTab === 'review') return item.status === 'under_review';
    if (activeTab === 'completed') return item.status === 'completed';
    return true;
  });

  const handleMarkComplete = (id: string) => {
    setAssignments((prev) =>
      prev.map((asg) => (asg.id === id ? { ...asg, status: 'completed', progress: 100 } : asg))
    );
  };

  const handleRunAutograder = () => {
    setIsTestingRun(true);
    setTestOutput(null);
    setTimeout(() => {
      setIsTestingRun(false);
      setTestOutput('All 10/10 test cases passed! Verification signature SHA-256: 9b207f... Ready for automated grade export.');
      if (activeSubmission) {
        setAssignments((prev) =>
          prev.map((asg) => (asg.id === activeSubmission.id ? { ...asg, progress: 100, status: 'completed' } : asg))
        );
      }
    }, 1200);
  };

  const pendingCount = assignments.filter((a) => a.status !== 'completed').length;
  const criticalItem = assignments[0];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Late Token Cushion Alert Banner */}
      {!tokenBannerDismissed && (
        <div className="flex flex-wrap items-center justify-between gap-space-sm px-space-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-space-sm">
            <span className="px-2 py-0.5 rounded bg-error/15 text-error font-label-tag text-label-tag font-semibold tracking-wider uppercase">
              DEADLINE WARNING
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {criticalItem.code} Normalization problem set submission window closes in{' '}
              <strong className="text-on-surface font-semibold">14h 22m</strong>. Late token cushion available.
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => setTokenApplied(true)}
              disabled={tokenApplied}
              className="flex items-center gap-1 font-button-text text-button-text text-primary hover:text-primary-fixed transition-colors disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{tokenApplied ? 'Cushion Applied (+24h)' : 'Apply Late Token'}</span>
            </button>
            <button
              onClick={() => setTokenBannerDismissed(true)}
              className="text-on-surface-variant/60 hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Editorial Page Title & Telemetry Capsule */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg pb-space-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-space-xs text-primary font-label-mono-wide text-label-mono-wide">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>ACADEMIC REGISTRY & DELIVERABLES • {streamData.name.toUpperCase()}</span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Assignments</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Priority queue, deadlines, and active course deliverables structured for cognitive clarity.
          </p>
        </div>

        {/* Telemetry Capsule */}
        <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container px-space-md py-space-xs rounded-xl shadow-sm border border-outline-variant/20">
          <div className="flex flex-col">
            <span className="font-label-tag text-label-tag text-on-surface-variant uppercase tracking-widest">Active Sprint</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">Fall &apos;25 · Week 06</span>
          </div>
          <div className="h-6 w-px bg-surface-variant"></div>
          <div className="flex items-center gap-space-xs">
            <span className="font-label-mono-wide text-label-mono-wide text-tertiary font-semibold">
              {pendingCount} PENDING
            </span>
            <span className="material-symbols-outlined text-tertiary text-[18px]">pending_actions</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="p-space-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface-variant">Active Queue</span>
            <div className="mt-1 flex items-baseline gap-space-xs">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">3 Due This Week</span>
              <span className="font-label-tag text-label-tag text-error font-medium">1 Urgent &lt; 24h</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-0.5">Est. remaining workload: 3.8 hrs</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
        </div>

        <div className="p-space-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface-variant">Aggregate Standing</span>
            <div className="mt-1 flex items-baseline gap-space-xs">
              <span className="font-headline-lg text-headline-lg font-bold text-primary">94.2%</span>
              <span className="font-label-tag text-label-tag text-secondary font-medium">+1.8% vs Sem 4</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-0.5">Ranked top 4% in Department cohort</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">insights</span>
          </div>
        </div>

        <div className="p-space-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface-variant">Lifetime Deliverables</span>
            <div className="mt-1 flex items-baseline gap-space-xs">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">18 Completed</span>
              <span className="font-label-tag text-label-tag text-tertiary font-medium">3 In Review</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-0.5">All autograded tests logged to Git</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[22px]">task_alt</span>
          </div>
        </div>
      </div>

      {/* Interactive Filter Tabs & Subject Strip */}
      <div className="space-y-space-sm pt-space-xs">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl overflow-x-auto max-w-full border border-outline-variant/20">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-space-md py-1.5 rounded-lg font-button-text text-button-text transition-colors flex items-center gap-space-2xs ${
                activeTab === 'all'
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span>All</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest/60 text-on-surface font-label-mono-wide text-label-mono-wide">
                {assignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-space-md py-1.5 rounded-lg font-button-text text-button-text transition-colors flex items-center gap-space-2xs ${
                activeTab === 'today'
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span>Due Today</span>
              <span className="px-1.5 py-0.5 rounded-full bg-error-container text-error font-label-mono-wide text-label-mono-wide">
                1
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-space-md py-1.5 rounded-lg font-button-text text-button-text transition-colors flex items-center gap-space-2xs ${
                activeTab === 'upcoming'
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span>Upcoming</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-wide text-label-mono-wide">
                3
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-space-md py-1.5 rounded-lg font-button-text text-button-text transition-colors flex items-center gap-space-2xs ${
                activeTab === 'completed'
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span>Completed</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-wide text-label-mono-wide">
                {assignments.filter((a) => a.status === 'completed').length}
              </span>
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-space-xs">
            <span className="font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider hidden sm:inline">
              Filter Course:
            </span>
            <button
              onClick={() => setSelectedSubject('ALL')}
              className={`px-2.5 py-1 rounded-full font-label-tag text-label-tag font-semibold transition-colors ${
                selectedSubject === 'ALL'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ALL
            </button>
            {streamData.defaultSubjects.slice(0, 4).map((sub) => (
              <button
                key={sub.code}
                onClick={() => setSelectedSubject(sub.code)}
                className={`px-2.5 py-1 rounded-full font-label-tag text-label-tag transition-colors ${
                  selectedSubject === sub.code
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {sub.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Asymmetric Layout Canvas (Feed 65% vs Context Intelligence 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* LEFT PANE: Priority Feed & Task Queues (8 cols) */}
        <div className="lg:col-span-8 space-y-space-xl">
          {/* 1. PRIORITY QUEUE ALERT BANNER */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-md border border-outline-variant/30">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary"></div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md relative z-10">
              <div className="space-y-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="px-2 py-0.5 rounded bg-tertiary/15 text-tertiary font-label-mono-wide text-label-mono-wide uppercase font-semibold tracking-wider">
                    CRITICAL DEADLINE
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag">
                    {criticalItem.code} · {streamData.defaultSubjects[0]?.name || 'Database Systems'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag">
                    Weight: {criticalItem.weight}
                  </span>
                </div>

                <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold pt-1">
                  {criticalItem.title}
                </h2>

                <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm pt-1">
                  <div className="flex items-center gap-1.5 text-tertiary font-medium">
                    <span className="material-symbols-outlined text-[16px]">alarm</span>
                    <span>Due {criticalItem.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">timelapse</span>
                    <span>Est. time: {criticalItem.estTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>{criticalItem.instructor}</span>
                  </div>
                </div>
              </div>

              {/* Rubric Points Badge */}
              <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container text-tertiary shrink-0 border border-outline-variant/20">
                <span className="material-symbols-outlined text-[28px]">stars</span>
                <span className="font-label-tag text-label-tag mt-1 uppercase tracking-wider text-on-surface font-semibold">
                  {criticalItem.points} PTS
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant/90 mt-space-md relative z-10 leading-relaxed">
              {criticalItem.desc}
            </p>

            {/* Banner Action Bar */}
            <div className="flex flex-wrap items-center gap-space-sm mt-space-lg pt-space-md border-t border-surface-variant/40 relative z-10">
              <button
                onClick={() => setActiveSubmission(criticalItem)}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text hover:bg-primary-fixed transition-all flex items-center gap-space-2xs shadow-sm group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                  terminal
                </span>
                <span>Continue Workspace (75%)</span>
              </button>

              <button
                onClick={() => setIsRubricOpen(true)}
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text transition-colors flex items-center gap-space-2xs border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">rule</span>
                <span>View Rubric</span>
              </button>

              <button
                onClick={() => handleMarkComplete(criticalItem.id)}
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-button-text text-button-text transition-colors flex items-center gap-space-2xs ml-auto border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Mark Complete</span>
              </button>
            </div>
          </div>

          {/* 2. MAIN WORKSPACE QUEUE: Priority Rows */}
          <div className="space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <h3 className="font-headline-md text-headline-md text-on-surface">Active Priority Pipeline</h3>
                <span className="font-label-mono-wide text-label-mono-wide px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  {filteredAssignments.length} In Flight
                </span>
              </div>
            </div>

            {filteredAssignments.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl bg-surface-container-low p-space-lg hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/20"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-mono-wide text-label-mono-wide px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">
                        {item.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-tag text-label-tag ${
                          item.priority === 'CRITICAL'
                            ? 'bg-error-container text-error'
                            : item.priority === 'HIGH'
                            ? 'bg-tertiary-container/30 text-tertiary'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {item.priority} PRIORITY
                      </span>
                      <span className="font-label-tag text-label-tag text-on-surface-variant">{item.type}</span>
                    </div>

                    <h4
                      onClick={() => setActiveSubmission(item)}
                      className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors cursor-pointer truncate"
                    >
                      {item.title}
                    </h4>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">{item.desc}</p>
                  </div>

                  {/* Meta & Status Ring */}
                  <div className="flex items-center justify-between md:justify-end gap-space-lg shrink-0 pt-2 md:pt-0">
                    <div className="text-right">
                      <div className="flex items-center md:justify-end gap-1 font-label-mono-wide text-label-mono-wide text-on-surface font-semibold">
                        <span className="material-symbols-outlined text-[15px] text-on-surface-variant">event</span>
                        <span>{item.dueDate}</span>
                      </div>
                      <span className="font-label-tag text-label-tag text-on-surface-variant block mt-0.5">
                        Est: {item.estTime} · {item.instructor}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2.5 py-1 rounded-full font-label-tag text-label-tag font-semibold ${
                          item.status === 'completed'
                            ? 'bg-primary/20 text-primary'
                            : item.progress > 0
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {item.status === 'completed' ? 'Completed' : item.progress > 0 ? `In Progress (${item.progress}%)` : 'Not Started'}
                      </span>
                      <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.status === 'completed' ? 'bg-primary' : 'bg-primary'}`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSubmission(item)}
                      className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface transition-colors"
                      title="Open workspace"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Historical Academic Velocity Sparkline */}
          <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-space-lg">
            <div className="space-y-1 max-w-sm">
              <span className="font-label-tag text-label-tag text-on-surface-variant uppercase tracking-widest">Sprint Velocity</span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Weekly Deliverable Completion Trend</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                You are operating at 84% on-time submission rate across engineering courses this term.
              </p>
            </div>

            <div className="w-full md:w-64 h-16 flex items-end">
              <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 240 60">
                <defs>
                  <linearGradient id="velocityGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <path
                  d="M0,45 Q40,40 70,25 T140,30 T200,10 L240,18"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></path>
                <path
                  d="M0,45 Q40,40 70,25 T140,30 T200,10 L240,18 L240,60 L0,60 Z"
                  fill="url(#velocityGradient)"
                ></path>
                <circle className="fill-primary ring-4 ring-surface-container" cx="200" cy="10" r="3.5"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Academic Context & Intelligence Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-space-lg">
          {/* QUICK ADD TRIGGER BUTTON */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full py-3.5 px-space-md rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-button-text text-button-text flex items-center justify-center gap-space-xs shadow-md transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">
              add_task
            </span>
            <span>Quick Add Assignment</span>
          </button>

          {/* WEEKLY ACADEMIC LOAD METER CARD */}
          <div className="rounded-xl bg-surface-container-low p-space-lg shadow-sm border border-outline-variant/20 space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[20px]">timelapse</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Weekly Academic Load</h3>
              </div>
              <span className="font-label-tag text-label-tag text-on-surface-variant uppercase tracking-widest">
                W6 TARGET
              </span>
            </div>

            <div className="space-y-space-xs">
              <div className="flex items-baseline justify-between">
                <span className="font-display-hero text-headline-lg text-on-surface font-bold">4.5 hrs</span>
                <span className="font-label-mono-wide text-label-mono-wide text-secondary">Remaining this week</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Estimated effort across 4 pending items. Optimal focus block recommended tomorrow afternoon.
              </p>
            </div>

            {/* Visual Distribution Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 w-full bg-surface-container-highest rounded-full flex overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '58%' }} title="Completed 6.2 hrs"></div>
                <div className="h-full bg-tertiary" style={{ width: '28%' }} title="In Progress 3.0 hrs"></div>
                <div className="h-full bg-outline-variant" style={{ width: '14%' }} title="Queued 1.5 hrs"></div>
              </div>
              <div className="flex justify-between font-label-tag text-label-tag text-on-surface-variant/80">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Done 6.2h
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Active 3.0h
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span> Queue 1.5h
                </span>
              </div>
            </div>

            {/* Academic Advisor Micro-Note */}
            <div className="p-space-sm rounded-lg bg-surface-container flex items-start gap-space-xs border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">lightbulb</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                Blocking out 40 mins before 6 PM tomorrow will safely resolve the DBMS critical path before the 11:59 PM deadline.
              </p>
            </div>
          </div>

          {/* RECENT SUBMISSIONS & GRADES CARD */}
          <div className="rounded-xl bg-surface-container-low p-space-lg shadow-sm border border-outline-variant/20 space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Submissions</h3>
              </div>
              <span className="font-label-tag text-label-tag text-primary uppercase tracking-widest font-mono">
                GRADE ARCHIVE
              </span>
            </div>

            <div className="space-y-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between gap-space-sm border border-outline-variant/20">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                    CS-301 · Prof. Sharma
                  </span>
                  <h5 className="font-body-md text-body-md text-on-surface font-semibold truncate">
                    DBMS Quiz 1: Relational Algebra
                  </h5>
                  <span className="font-label-tag text-label-tag text-on-surface-variant">Graded 2 days ago</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-mono-wide text-label-mono-wide font-bold">
                    19 / 20
                  </span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between gap-space-sm border border-outline-variant/20">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                    CS-303 · Dr. Raman
                  </span>
                  <h5 className="font-body-md text-body-md text-on-surface font-semibold truncate">
                    OS Lab 3: Page Replacement Invariants
                  </h5>
                  <span className="font-label-tag text-label-tag text-on-surface-variant">Graded 5 days ago</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-mono-wide text-label-mono-wide font-bold">
                    28 / 30
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE & AUTOGRADER SUBMISSION MODAL */}
      {activeSubmission && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-space-lg py-space-md border-b border-outline-variant/20 flex items-center justify-between bg-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-mono-wide text-label-mono-wide text-primary uppercase">
                  {activeSubmission.code} WORKSPACE
                </span>
                <span className="text-outline-variant">•</span>
                <span className="font-headline-sm text-body-md text-on-surface font-semibold truncate max-w-md">
                  {activeSubmission.title}
                </span>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-lg overflow-y-auto space-y-space-md flex-1">
              <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
                <span className="font-label-mono-wide text-label-mono-wide text-secondary uppercase">
                  PROBLEM BRIEF & SPECIFICATION
                </span>
                <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                  {activeSubmission.desc}
                </p>
                <div className="flex items-center gap-space-md text-on-surface-variant font-label-tag text-label-tag pt-1">
                  <span>Weight: {activeSubmission.weight}</span>
                  <span>Due: {activeSubmission.dueDate}</span>
                  <span>Format: {activeSubmission.type}</span>
                </div>
              </div>

              {/* Code / LaTeX Scratchpad */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-label-mono-wide text-label-mono-wide text-on-surface-variant">
                  <span>SOLUTION EDITOR / DRAFT WORKSPACE</span>
                  <span className="text-primary">AUTOSAVED TO LOCAL LEDGER</span>
                </div>
                <textarea
                  rows={8}
                  defaultValue={`-- Bernstein 3NF Synthesis Decomposition Trace\n-- Relation R(A, B, C, D, E, G)\n-- F = { AB -> C, C -> A, BC -> D, ACD -> B, D -> EG, BE -> C, CG -> BD, CE -> AG }\n\n-- Step 1: Find Minimal Canonical Cover Fc\n-- Step 2: Form Relations Ri for each X -> A in Fc\n-- Step 3: Verify Lossless Join Property with Candidate Keys`}
                  className="w-full p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-primary font-mono text-body-sm focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* Test Output Console */}
              {testOutput && (
                <div className="p-space-md rounded-xl bg-surface-container-lowest border border-primary/40 text-primary font-mono text-body-sm space-y-1">
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>AUTOGRADER SUITE EXECUTION</span>
                  </div>
                  <p className="text-on-surface text-body-sm">{testOutput}</p>
                </div>
              )}
            </div>

            <div className="px-space-lg py-space-md border-t border-outline-variant/20 bg-surface-container flex items-center justify-between">
              <button
                onClick={() => setIsRubricOpen(true)}
                className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-button-text text-button-text transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">rule</span>
                <span>View Rubric Matrix</span>
              </button>

              <div className="flex items-center gap-space-xs">
                <button
                  onClick={handleRunAutograder}
                  disabled={isTestingRun}
                  className="px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-button-text text-button-text transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">play_circle</span>
                  <span>{isTestingRun ? 'Compiling & Running...' : 'Run Autograder'}</span>
                </button>
                <button
                  onClick={() => {
                    handleMarkComplete(activeSubmission.id);
                    setActiveSubmission(null);
                  }}
                  className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-colors font-button-text text-button-text font-semibold shadow-sm"
                >
                  Final Submit & Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RUBRIC MODAL */}
      {isRubricOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-xl shadow-2xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px]">stars</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Grading Rubric Matrix (100 Pts)
                </h3>
              </div>
              <button
                onClick={() => setIsRubricOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-xs font-body-sm text-body-sm">
              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-on-surface font-medium">1. Minimal Cover Calculation (Fc)</div>
                  <div className="text-on-surface-variant text-label-tag">Extraneous attribute elimination rigor</div>
                </div>
                <span className="font-mono text-primary font-bold">25 Pts</span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-on-surface font-medium">2. 3NF Synthesis via Bernstein Algorithm</div>
                  <div className="text-on-surface-variant text-label-tag">Preservation of functional dependencies</div>
                </div>
                <span className="font-mono text-primary font-bold">25 Pts</span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-on-surface font-medium">3. B+ Tree Page Split & Concurrency Trace</div>
                  <div className="text-on-surface-variant text-label-tag">Secondary index key redistribution step trace</div>
                </div>
                <span className="font-mono text-primary font-bold">30 Pts</span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                <div>
                  <div className="text-on-surface font-medium">4. LaTeX Formatting & Test Invariants</div>
                  <div className="text-on-surface-variant text-label-tag">Mathematical elegance & clean PDF compilation</div>
                </div>
                <span className="font-mono text-primary font-bold">20 Pts</span>
              </div>
            </div>

            <div className="flex justify-end pt-space-xs">
              <button
                onClick={() => setIsRubricOpen(false)}
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
