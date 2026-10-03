'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getSubjectByCode } from '@/lib/curriculumData';

export default function SubjectDetailPage({ params }: { params: { id: string } }) {
  const { setIsAiAssistOpen } = useApp();
  const subjectCode = params.id ? decodeURIComponent(params.id) : 'CS301';
  const subject = getSubjectByCode(subjectCode);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'topics' | 'notes' | 'resources' | 'tasks'
  >('overview');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [completedTopics, setCompletedTopics] = useState<Record<number, boolean>>({});

  // If code is not found in curriculum data, show a clean generic template
  const subName = subject?.name || `${subjectCode} Academic Module`;
  const subCode = subject?.code || subjectCode;
  const subCredits = subject?.credits ?? 4;
  const subType = subject?.type || 'Core';
  const subSemester = subject?.semester ?? 3;
  const subDescription =
    subject?.description ||
    'Comprehensive syllabus module encompassing theoretical principles, analytical methods, and practical computing applications.';
  const subTopics = subject?.topics || [
    'Fundamental Principles & Definitions',
    'Mathematical Modeling & Algorithmic Analysis',
    'System Implementations & Architectures',
    'Evaluation, Benchmarking & Practical Applications',
  ];
  const subInstructor = subject?.instructor || 'Department Faculty Lead';
  const subRoom = subject?.room || 'Academic Block Hall';

  const toggleTopic = (index: number) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const completedCount = Object.values(completedTopics).filter(Boolean).length;

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto space-y-space-lg pb-space-3xl animate-in fade-in duration-200">
      {/* ── Top Navigation / Breadcrumbs Bar ── */}
      <div className="bg-surface-container-low p-space-lg rounded-2xl shadow-sm space-y-space-md border border-outline-variant/30">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant flex-wrap">
            <Link href="/subjects" className="hover:text-primary transition-colors">
              ACADEMIC CORE
            </Link>
            <span className="text-outline-variant">/</span>
            <Link
              href={`/subjects?sem=${subSemester}`}
              className="hover:text-primary transition-colors"
            >
              SEMESTER {subSemester}
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-bold tracking-wider">
              {subCode}
            </span>
          </div>

          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-tag text-label-tag">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-on-surface font-semibold">{subType.toUpperCase()} MODULE</span>
            <span className="text-outline-variant">•</span>
            <span>B.TECH CSE SEMESTER {subSemester}</span>
          </div>
        </div>

        {/* Title & Quick Actions Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-2xs">
          <div className="space-y-space-2xs">
            <div className="flex items-baseline gap-space-sm flex-wrap">
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold">
                {subName}
              </h1>
              <span className="font-label-mono-wide text-body-sm text-secondary font-bold">
                {subCredits} CREDITS
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant flex flex-wrap items-center gap-x-space-md gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">school</span>
                {subType} Academic Module
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                {subInstructor}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">meeting_room</span>
                {subRoom}
              </span>
            </p>
          </div>

          {/* AI Companion Prompt Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiAssistOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-deep-coral text-white hover:bg-deep-coral/90 transition-all font-button-text text-button-text font-semibold shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Ask Nivora AI about {subCode}</span>
            </button>
            <Link
              href={`/subjects?sem=${subSemester}`}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-button-text text-button-text text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Semester {subSemester}</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-space-xs border-t border-outline-variant/20 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Syllabus', icon: 'menu_book' },
            { id: 'topics', label: `Topics (${subTopics.length})`, icon: 'checklist' },
            { id: 'notes', label: 'Study Notes', icon: 'edit_note' },
            { id: 'resources', label: 'Resources & Reference', icon: 'folder_open' },
            { id: 'tasks', label: 'Planner & Tasks', icon: 'calendar_today' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-button-text text-button-text transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content Areas ── */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          <div className="lg:col-span-2 space-y-space-md">
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3 shadow-xs">
              <h3 className="font-headline-sm text-body-lg text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                <span>Course Synopsis &amp; Objectives</span>
              </h3>
              <p className="font-body-md text-on-surface leading-relaxed">{subDescription}</p>
            </div>

            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3 shadow-xs">
              <h3 className="font-headline-sm text-body-lg text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">format_list_bulleted</span>
                <span>Syllabus Key Modules</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {subTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface"
                  >
                    <span className="font-mono text-primary font-bold shrink-0">Unit 0{i + 1}</span>
                    <span className="font-medium leading-snug">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Parameters & Specifications */}
          <div className="space-y-space-md">
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3 shadow-xs">
              <h3 className="font-headline-sm text-body-md text-on-surface font-bold uppercase tracking-wider font-mono text-xs">
                Academic Specifications
              </h3>
              <div className="space-y-2 text-xs divide-y divide-outline-variant/20">
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Course Code</span>
                  <span className="font-mono font-bold text-on-surface">{subCode}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Credit Allocation</span>
                  <span className="font-mono font-bold text-on-surface">{subCredits} Credits</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Module Classification</span>
                  <span className="font-bold text-primary">{subType}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Curriculum Term</span>
                  <span className="text-on-surface font-medium">Semester {subSemester}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Assigned Faculty</span>
                  <span className="text-on-surface font-medium">{subInstructor}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Lecture Location</span>
                  <span className="text-on-surface font-medium">{subRoom}</span>
                </div>
              </div>
            </div>

            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 shadow-xs text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
              <p className="font-medium text-on-surface">Institutional Adaptation Notice</p>
              <p>
                Syllabus topics follow the standardized B.Tech CSE model curriculum. Topic sequencing may be tailored to your university examination guidelines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOPICS */}
      {activeTab === 'topics' && (
        <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-headline-sm text-body-lg text-on-surface font-bold">
                Syllabus Units &amp; Coverage
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Check off topics as you review them to track your personal revision milestone.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-mono text-on-surface">
              {completedCount} of {subTopics.length} reviewed
            </span>
          </div>

          <div className="space-y-2">
            {subTopics.map((topic, i) => {
              const isChecked = !!completedTopics[i];
              return (
                <div
                  key={i}
                  onClick={() => toggleTopic(i)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-surface-container/60 border-primary/40 text-on-surface-variant'
                      : 'bg-surface-container border-outline-variant/30 hover:border-outline-variant text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${
                        isChecked ? 'text-primary' : 'text-outline-variant'
                      }`}
                    >
                      {isChecked ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] text-primary font-bold uppercase tracking-wider">
                        Unit 0{i + 1}
                      </div>
                      <div
                        className={`text-sm font-semibold truncate ${
                          isChecked ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {topic}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-on-surface-variant font-medium shrink-0">
                    {isChecked ? 'Reviewed' : 'Pending Review'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: NOTES */}
      {activeTab === 'notes' && (
        <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-body-lg text-on-surface font-bold">
                Student Notebook: {subCode}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Capture quick derivations, lecture takeaways, and exam hints for this subject.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('Notes saved to your student workspace.')}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text text-xs font-semibold cursor-pointer"
            >
              Save Notes
            </button>
          </div>

          <textarea
            value={studentNotes}
            onChange={(e) => setStudentNotes(e.target.value)}
            placeholder={`Jot down personal study notes, formula derivations, or questions for ${subName}...`}
            rows={10}
            className="w-full p-4 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-xs text-on-surface leading-relaxed placeholder:text-on-surface-variant/50 resize-y"
          />
        </div>
      )}

      {/* TAB 4: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-body-lg text-on-surface font-bold">
                Study Materials &amp; Syllabi
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Curated lecture decks, reference books, and past question archives.
              </p>
            </div>
            <Link
              href="/resources"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>Explore Central Repository</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: `${subCode} Model Syllabus & Course Outline`,
                type: 'PDF Document',
                size: '2.4 MB',
                icon: 'picture_as_pdf',
              },
              {
                title: `${subCode} Core Lecture Slides (Units 1–4)`,
                type: 'Presentation Deck',
                size: '14.8 MB',
                icon: 'slideshow',
              },
              {
                title: `${subCode} Previous 5-Year Question Papers (PYQ)`,
                type: 'Exam Archive',
                size: '6.1 MB',
                icon: 'history_edu',
              },
              {
                title: `${subCode} Reference Formula & Derivation Sheet`,
                type: 'Cheat Sheet',
                size: '1.2 MB',
                icon: 'menu_book',
              },
            ].map((res, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-3 hover:border-outline-variant transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-primary text-[24px] shrink-0">
                    {res.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-on-surface truncate">{res.title}</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5 font-mono">
                      {res.type} · {res.size}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Downloading ${res.title}...`)}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface font-semibold shrink-0 cursor-pointer"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TASKS */}
      {activeTab === 'tasks' && (
        <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-body-lg text-on-surface font-bold">
                Subject Study Planner
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Block revision hours and link assignments directly to your personal academic calendar.
              </p>
            </div>
            <Link
              href="/planner"
              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text text-xs font-semibold"
            >
              Open Full Planner
            </Link>
          </div>

          <div className="p-6 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-center space-y-2">
            <span className="material-symbols-outlined text-[28px] text-secondary">
              calendar_month
            </span>
            <p className="text-body-sm font-medium text-on-surface">
              Schedule focused study blocks for {subCode}
            </p>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Plan your weekly revision sessions for {subName} to stay ahead of upcoming internal evaluations.
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline pt-1"
            >
              <span>Schedule Study Block in Planner</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
