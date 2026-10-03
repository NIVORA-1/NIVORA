'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface TaskItem {
  id: string;
  num: string;
  title: string;
  sub: string;
  completed: boolean;
  action: string;
  link: string;
}

export interface ScheduleEvent {
  time: string;
  timeHighlight?: boolean;
  title: string;
  sub: string;
}

export interface StudentContextInfo {
  priorityTitle: string;
  progress: number;
  semester: string;
  deadline: string;
  goal: string;
  project: string;
}

export interface StreamProfile {
  id: string;
  label: string;
  badge: string;
  description: string;
  adaptationSummary: string;
  tasks: TaskItem[];
  schedule: ScheduleEvent[];
  activeContext: StudentContextInfo;
}

export const STREAM_PROFILES: Record<string, StreamProfile> = {
  common: {
    id: 'common',
    label: 'Universal (All Streams)',
    badge: 'COMMON INTERFACE',
    description: 'The core Nivora interface is identical for every student. Content adapts dynamically to your enrolled stream.',
    adaptationSummary: 'Demonstrates the universal layout before profile-specific academic data is loaded.',
    tasks: [
      {
        id: '1',
        num: '01',
        title: 'Assignment / Coursework',
        sub: 'Due tomorrow • Est. 35 min',
        completed: false,
        action: 'Start',
        link: '/assignments',
      },
      {
        id: '2',
        num: '02',
        title: 'Study Session',
        sub: 'Priority topic • Est. 45 min',
        completed: false,
        action: 'Start',
        link: '/learning',
      },
      {
        id: '3',
        num: '03',
        title: 'Project Work',
        sub: '4:30 PM • Team session',
        completed: false,
        action: 'Join',
        link: '/planner',
      },
    ],
    schedule: [
      {
        time: '10:00 AM',
        timeHighlight: true,
        title: 'Class / Lecture',
        sub: 'Department Lecture • Core Session',
      },
      {
        time: '02:00 PM',
        timeHighlight: false,
        title: 'Practical / Lab',
        sub: 'Practical Workspace • Hands-on Lab',
      },
      {
        time: '04:30 PM',
        timeHighlight: false,
        title: 'Project / Study Session',
        sub: 'Collaborative Workspace • Team Sync',
      },
    ],
    activeContext: {
      priorityTitle: 'Semester Coursework',
      progress: 72,
      semester: 'Current Term',
      deadline: 'Due in 2 Days',
      goal: 'Target Distinction',
      project: 'Capstone Phase 1',
    },
  },
  cse: {
    id: 'cse',
    label: 'B.Tech Comp Sci',
    badge: 'COMPUTER SCIENCE',
    description: 'Your Nivora workspace adapts subjects, practical work, projects and career goals to Computer Science.',
    adaptationSummary: 'Adapts algorithms, distributed systems, compiler architecture, and systems engineering.',
    tasks: [
      {
        id: '1',
        num: '01',
        title: 'Distributed Systems Normalization',
        sub: 'Due tomorrow • Est. 35 min',
        completed: false,
        action: 'Start',
        link: '/assignments',
      },
      {
        id: '2',
        num: '02',
        title: 'Compiler IR Optimization Revision',
        sub: 'Weakest topic in quiz • Est. 45 min',
        completed: false,
        action: 'Start',
        link: '/learning',
      },
      {
        id: '3',
        num: '03',
        title: 'Raft Cluster Architecture Sync',
        sub: '4:30 PM • Team session',
        completed: false,
        action: 'Join',
        link: '/planner',
      },
    ],
    schedule: [
      {
        time: '10:00 AM',
        timeHighlight: true,
        title: 'Distributed Systems & Consensus',
        sub: 'Systems Hall • Core Systems Lecture',
      },
      {
        time: '02:00 PM',
        timeHighlight: false,
        title: 'Compiler Design Lab (LLVM AST)',
        sub: 'Computing Facility • Bare-Metal Lab',
      },
      {
        time: '04:30 PM',
        timeHighlight: false,
        title: 'Capstone Distributed Storage Sync',
        sub: 'Collaborative Workspace • Team Discord',
      },
    ],
    activeContext: {
      priorityTitle: 'Distributed Systems & Algorithms',
      progress: 86,
      semester: 'Semester 4',
      deadline: 'Due in 2 Days',
      goal: 'Target GPA 3.8',
      project: 'Raft Consensus Engine',
    },
  },
  mech: {
    id: 'mech',
    label: 'Mechanical Engineering',
    badge: 'MECHANICAL ENG',
    description: 'Your Nivora workspace adapts subjects, practical work, projects and career goals to Mechanical Engineering.',
    adaptationSummary: 'Adapts thermodynamics, FEA structural simulation, robotics, and kinematics.',
    tasks: [
      {
        id: '1',
        num: '01',
        title: 'Thermodynamics Heat Transfer Problem Set',
        sub: 'Due tomorrow • Est. 35 min',
        completed: false,
        action: 'Start',
        link: '/assignments',
      },
      {
        id: '2',
        num: '02',
        title: 'Kinematics 4-Bar Linkage Synthesis',
        sub: 'Priority revision • Est. 45 min',
        completed: false,
        action: 'Start',
        link: '/learning',
      },
      {
        id: '3',
        num: '03',
        title: 'Robotics Inverse Kinematics Sync',
        sub: '4:30 PM • Team session',
        completed: false,
        action: 'Join',
        link: '/planner',
      },
    ],
    schedule: [
      {
        time: '10:00 AM',
        timeHighlight: true,
        title: 'Applied Thermodynamics & Heat Transfer',
        sub: 'Thermal Wing • Core Fluid Lecture',
      },
      {
        time: '02:00 PM',
        timeHighlight: false,
        title: 'Finite Element Analysis (FEA Simulation)',
        sub: 'Simulation Lab • ANSYS Mesh Convergence',
      },
      {
        time: '04:30 PM',
        timeHighlight: false,
        title: 'Robotic Actuator Capstone Design',
        sub: 'Robotics Workshop • Hardware Lab',
      },
    ],
    activeContext: {
      priorityTitle: 'Finite Element Analysis (FEA)',
      progress: 88,
      semester: 'Semester 4',
      deadline: 'Due in 2 Days',
      goal: 'FEA Certification',
      project: 'Robotic Arm Synthesis',
    },
  },
  ds: {
    id: 'ds',
    label: 'Data Science',
    badge: 'DATA SCIENCE',
    description: 'Your Nivora workspace adapts subjects, practical work, projects and career goals to Data Science.',
    adaptationSummary: 'Adapts statistical inference, deep learning architectures, big data streaming, and telemetry.',
    tasks: [
      {
        id: '1',
        num: '01',
        title: 'Bayesian Inference Problem Set',
        sub: 'Due tomorrow • Est. 35 min',
        completed: false,
        action: 'Start',
        link: '/assignments',
      },
      {
        id: '2',
        num: '02',
        title: 'Transformer Attention Mechanics Revision',
        sub: 'Priority topic • Est. 45 min',
        completed: false,
        action: 'Start',
        link: '/learning',
      },
      {
        id: '3',
        num: '03',
        title: 'Big Data Pipeline Architecture Sync',
        sub: '4:30 PM • Team session',
        completed: false,
        action: 'Join',
        link: '/planner',
      },
    ],
    schedule: [
      {
        time: '10:00 AM',
        timeHighlight: true,
        title: 'Statistical Inference & Probability',
        sub: 'Data Center Hall • Math Foundation Lecture',
      },
      {
        time: '02:00 PM',
        timeHighlight: false,
        title: 'Deep Learning & PyTorch Distributed Lab',
        sub: 'GPU Cluster Lab • Attention Tuning',
      },
      {
        time: '04:30 PM',
        timeHighlight: false,
        title: 'Kafka & Spark Telemetry Capstone',
        sub: 'Cloud Streaming Lab • Distributed Sync',
      },
    ],
    activeContext: {
      priorityTitle: 'Deep Learning & Neural Architectures',
      progress: 81,
      semester: 'Semester 4',
      deadline: 'Due in 2 Days',
      goal: 'Target GPA 3.9',
      project: 'Distributed Pipeline Engine',
    },
  },
  ee: {
    id: 'ee',
    label: 'Electronics Engineering',
    badge: 'ELECTRONICS ENG',
    description: 'Your Nivora workspace adapts subjects, practical work, projects and career goals to Electronics Engineering.',
    adaptationSummary: 'Adapts VLSI CMOS chip layout, DSP signals, embedded microcontrollers, and RF communications.',
    tasks: [
      {
        id: '1',
        num: '01',
        title: 'CMOS Timing & DRC Layout Verification',
        sub: 'Due tomorrow • Est. 35 min',
        completed: false,
        action: 'Start',
        link: '/assignments',
      },
      {
        id: '2',
        num: '02',
        title: 'Fast Fourier Transform DSP Revision',
        sub: 'Priority topic • Est. 45 min',
        completed: false,
        action: 'Start',
        link: '/learning',
      },
      {
        id: '3',
        num: '03',
        title: 'Bare-Metal ARM Firmware Sync',
        sub: '4:30 PM • Team session',
        completed: false,
        action: 'Join',
        link: '/planner',
      },
    ],
    schedule: [
      {
        time: '10:00 AM',
        timeHighlight: true,
        title: 'VLSI Design & CMOS Circuits',
        sub: 'Silicon Wing • Circuit Design Lecture',
      },
      {
        time: '02:00 PM',
        timeHighlight: false,
        title: 'Digital Signal Processing (DSP Lab)',
        sub: 'Hardware Lab • Audio Spectral Analysis',
      },
      {
        time: '04:30 PM',
        timeHighlight: false,
        title: 'Microcontroller DMA Architecture Sync',
        sub: 'Embedded Lab • ARM Cortex Prototyping',
      },
    ],
    activeContext: {
      priorityTitle: 'VLSI Design & CMOS Circuits',
      progress: 84,
      semester: 'Semester 4',
      deadline: 'Due in 2 Days',
      goal: 'VLSI Silicon Certification',
      project: 'FPGA Synthesis Module',
    },
  },
  bba: {
    id: 'bba',
    label: 'Business Administration',
    badge: 'MANAGEMENT & BBA',
    description: 'Your Nivora workspace adapts subjects, practical work, projects and career goals to Business Administration.',
    adaptationSummary: 'Adapts corporate finance, marketing strategy, operations management, and market research.',
    tasks: [
      {
        id: '1',
        num: '01',
        title: 'Corporate Valuation DCF Model',
        sub: 'Due tomorrow • Est. 35 min',
        completed: false,
        action: 'Start',
        link: '/assignments',
      },
      {
        id: '2',
        num: '02',
        title: 'Brand Positioning Strategy Revision',
        sub: 'Priority topic • Est. 45 min',
        completed: false,
        action: 'Start',
        link: '/learning',
      },
      {
        id: '3',
        num: '03',
        title: 'Market Expansion Capstone Sync',
        sub: '4:30 PM • Team session',
        completed: false,
        action: 'Join',
        link: '/planner',
      },
    ],
    schedule: [
      {
        time: '10:00 AM',
        timeHighlight: true,
        title: 'Financial Management & Corporate Risk',
        sub: 'Executive Hall • Case Study Lecture',
      },
      {
        time: '02:00 PM',
        timeHighlight: false,
        title: 'Business Analytics & Decision Science Lab',
        sub: 'Decision Lab • Quantitative Modeling',
      },
      {
        time: '04:30 PM',
        timeHighlight: false,
        title: 'Product Strategy & Market Review',
        sub: 'Innovation Lounge • Team Case Prep',
      },
    ],
    activeContext: {
      priorityTitle: 'Corporate Finance & Valuation',
      progress: 79,
      semester: 'Semester 4',
      deadline: 'Due in 2 Days',
      goal: 'Target Distinction',
      project: 'Market Expansion Dossier',
    },
  },
};

export interface StudentContextDashboardProps {
  tasks?: TaskItem[];
  schedule?: ScheduleEvent[];
  activeContext?: StudentContextInfo;
}

/**
 * Common, reusable student context dashboard component.
 * Communicates: "One platform for every student."
 * Profile-driven data adapts after authentication without changing the interface.
 */
export function StudentContextDashboard({
  tasks: initialTasks,
  schedule,
  activeContext,
}: StudentContextDashboardProps) {
  const currentProfile = STREAM_PROFILES.common;
  const activeTasks = initialTasks || currentProfile.tasks;
  const activeSchedule = schedule || currentProfile.schedule;
  const activeCtx = activeContext || currentProfile.activeContext;

  const [taskList, setTaskList] = useState<TaskItem[]>(activeTasks);

  // Sync state when props change
  React.useEffect(() => {
    setTaskList(activeTasks);
  }, [activeTasks]);

  const toggleTask = (id: string) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="rounded-2xl bg-surface-container border border-border p-5 sm:p-7 shadow-2xl">
      {/* Workspace Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-border gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-deep-coral" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-sand" />
          <span className="w-2.5 h-2.5 rounded-full bg-coral" />
          <span className="ml-3 font-sans text-xs text-on-surface-variant font-semibold tracking-wide">
            COMMON STUDENT INTERFACE • DYNAMIC PROFILE CONTEXT
          </span>
        </div>
        <div className="flex items-center gap-2 font-sans text-[11px] text-primary font-bold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-coral" />
          <span>ADAPTS TO ALL STREAMS</span>
        </div>
      </div>

      {/* The 3 Common Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Today's Focus (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-surface-container-low border border-border p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 w-full">
              <span className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                TODAY&apos;S FOCUS
              </span>
              <span className="font-sans text-[10px] px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
                3 items
              </span>
            </div>

            <div className="space-y-2.5">
              {taskList.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg bg-surface-container border border-border flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 text-left flex-1">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                        task.completed
                          ? 'bg-primary border-primary text-white'
                          : 'border-border'
                      }`}
                      aria-label={`Toggle ${task.title}`}
                    >
                      {task.completed && (
                        <span className="material-symbols-outlined text-[12px]">check</span>
                      )}
                    </button>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          task.completed ? 'text-on-surface-variant line-through' : 'text-on-surface'
                        }`}
                      >
                        <span className="font-sans text-[11px] text-on-surface-variant mr-1.5 font-bold">
                          {task.num}
                        </span>
                        {task.title}
                      </div>
                      <div className="text-[10px] text-on-surface-variant truncate font-normal">{task.sub}</div>
                    </div>
                  </div>

                  <Link
                    href={task.link}
                    className="shrink-0 px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface font-sans text-[11px] font-bold inline-block"
                  >
                    {task.action}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-sans text-on-surface-variant font-medium">
            <span>PRIORITY QUEUE</span>
            <Link href="/planner" className="text-primary hover:text-coral transition-colors font-bold">
              View Planner →
            </Link>
          </div>
        </div>

        {/* Column 2: Schedule & Timeline (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-surface-container-low border border-border p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 w-full">
              <span className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                SCHEDULE &amp; TIMELINE
              </span>
              <span className="font-sans text-[10px] px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
                Today
              </span>
            </div>

            <div className="space-y-3 relative pl-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {activeSchedule.map((item, idx) => (
                <div key={idx} className="relative pl-3 text-left">
                  <span
                    className={`absolute -left-[14px] top-1 w-2 h-2 rounded-full ${
                      item.timeHighlight ? 'bg-primary' : 'bg-warm-gray'
                    }`}
                  />
                  <span
                    className={`font-sans text-[11px] ${
                      item.timeHighlight ? 'text-primary font-bold' : 'text-on-surface-variant font-medium'
                    }`}
                  >
                    {item.time}
                  </span>
                  <h4 className="text-xs font-bold text-on-surface mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-normal">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-sans text-on-surface-variant font-medium">
            <span>DAILY CADENCE</span>
            <Link href="/classes" className="text-primary hover:text-coral transition-colors font-bold">
              Full Timetable →
            </Link>
          </div>
        </div>

        {/* Column 3: Active Student Context (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-surface-container-low border border-border p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 w-full">
              <span className="font-sans text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                ACTIVE STUDENT CONTEXT
              </span>
              <span className="font-sans text-[10px] px-2 py-0.5 rounded bg-coral/10 text-coral border border-coral/30 font-bold">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="text-left">
                <div className="text-[10px] font-sans text-on-surface-variant uppercase tracking-wider font-bold">
                  CURRENT PRIORITY
                </div>
                <div className="text-xs font-bold text-on-surface mt-0.5 flex items-center justify-between">
                  <span>{activeCtx.priorityTitle}</span>
                  <span className="font-sans text-primary text-xs font-bold">
                    Progress: {activeCtx.progress}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-surface-container h-1.5 rounded-full mt-1.5 overflow-hidden border border-border">
                  <div
                    className="bg-coral h-full rounded-full transition-all duration-300"
                    style={{ width: `${activeCtx.progress}%` }}
                  />
                </div>
              </div>

              {/* Generic Contextual Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-[10px]">
                <div className="p-2 rounded bg-surface-container border border-border text-left">
                  <div className="text-on-surface-variant font-semibold uppercase tracking-wider text-[9px]">SEMESTER</div>
                  <div className="text-on-surface font-bold truncate mt-0.5">
                    {activeCtx.semester}
                  </div>
                </div>

                <div className="p-2 rounded bg-surface-container border border-border text-left">
                  <div className="text-on-surface-variant font-semibold uppercase tracking-wider text-[9px]">UPCOMING DEADLINE</div>
                  <div className="text-primary font-bold truncate mt-0.5">
                    {activeCtx.deadline}
                  </div>
                </div>

                <div className="p-2 rounded bg-surface-container border border-border text-left">
                  <div className="text-on-surface-variant font-semibold uppercase tracking-wider text-[9px]">ACTIVE GOAL</div>
                  <div className="text-on-surface font-bold truncate mt-0.5">
                    {activeCtx.goal}
                  </div>
                </div>

                <div className="p-2 rounded bg-surface-container border border-border text-left">
                  <div className="text-on-surface-variant font-semibold uppercase tracking-wider text-[9px]">CURRENT PROJECT</div>
                  <div className="text-on-surface font-bold truncate mt-0.5">
                    {activeCtx.project}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
            <span className="font-sans text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">PROFILE-ADAPTED</span>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-coral transition-colors font-sans text-xs font-bold inline-block shadow-sm"
            >
              Open Workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdaptationSection() {
  const activeProfile = STREAM_PROFILES.common;

  return (
    <section id="adaptation" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-4">
      {/* Header Label */}
      <div data-stream-heading className="text-center space-y-3 mb-8 sm:mb-10">
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold">
          STREAM PERSONALIZATION &amp; ADAPTATION
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-normal tracking-tight text-on-surface leading-[1.1]">
          One interface. Your{' '}
          <span className="italic text-primary">
            context.
          </span>
        </h2>
        <p className="mt-4 font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          One student ecosystem for every stream. Nivora adapts the content, schedule, subjects, projects, and goals around you.
        </p>
      </div>

      {/* 3-Column Common Student Interface Component */}
      <div data-stream-dashboard className="w-full">
        <StudentContextDashboard
          tasks={activeProfile.tasks}
          schedule={activeProfile.schedule}
          activeContext={activeProfile.activeContext}
        />
      </div>

      {/* Subtle Principle Note */}
      <div className="mt-8 text-center">
        <span className="font-sans text-[11px] tracking-[0.16em] text-on-surface-variant uppercase font-semibold">
          ONE UNIFIED INTERFACE • CONTEXTUALLY POPULATED FOR EVERY STREAM
        </span>
      </div>
    </section>
  );
}
