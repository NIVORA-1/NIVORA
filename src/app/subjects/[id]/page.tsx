'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SubjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'notes' | 'resources' | 'quizzes'>('overview');
  const [showSqlDrawer, setShowSqlDrawer] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT r.id, r.name, COUNT(a.id) AS assignments_due\nFROM Relations r\nLEFT JOIN Assignments a ON r.id = a.rel_id\nGROUP BY r.id;\n');
  const [sqlResults, setSqlResults] = useState<{ id: number; name: string; assignments_due: number }[]>([
    { id: 101, name: 'Relational Schema R(A,B,C,D)', assignments_due: 2 },
    { id: 102, name: 'B+ Tree Leaf Page Split Invariant', assignments_due: 1 },
    { id: 103, name: 'Two-Phase Locking (2PL) Protocol', assignments_due: 0 },
  ]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string>('');

  const subjectCode = params.id || 'CS-301';

  const executeSql = () => {
    // Interactive mock query execution
    setSqlResults([
      { id: 101, name: 'Bernstein 3NF Minimal Cover', assignments_due: 1 },
      { id: 102, name: 'BCNF Lossless Preservation Check', assignments_due: 2 },
      { id: 104, name: 'Multi-Version Concurrency (MVCC)', assignments_due: 1 },
    ]);
  };

  const submitQuiz = () => {
    if (quizAnswer === 'C') {
      setQuizScore(100);
    } else {
      setQuizScore(50);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto space-y-space-lg pb-space-3xl animate-in fade-in duration-200">
      {/* Top Control Bar */}
      <div className="bg-surface-container-low p-space-lg rounded-xl shadow-md space-y-space-md border border-outline-variant/30">
        {/* Breadcrumb & Code Tag */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
            <Link href="/subjects" className="hover:text-primary transition-colors">
              ACADEMIC CORE
            </Link>
            <span className="text-outline-variant">/</span>
            <Link href="/subjects" className="hover:text-primary transition-colors">
              SUBJECTS
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold tracking-wider">
              {subjectCode}
            </span>
          </div>

          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-on-surface">SYLLABUS ACTIVE</span>
            <span className="text-outline-variant">•</span>
            <span>TERM V (AUTUMN 2025)</span>
          </div>
        </div>

        {/* Title + Quick Actions Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-2xs">
          <div className="space-y-space-2xs">
            <div className="flex items-baseline gap-space-sm flex-wrap">
              <h1 className="font-display-quote text-display-hero text-on-surface italic tracking-normal">
                Database Management Systems
              </h1>
              <span className="font-label-mono-wide text-body-sm text-secondary font-medium">
                4.0 CREDITS
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant flex flex-wrap items-center gap-x-space-md gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">school</span>
                Core Theory &amp; Practical Lab
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                Dr. K. Sharma
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">meeting_room</span>
                Block C, Hall B-204
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <Link
              href="/resources"
              className="flex items-center gap-space-xs px-space-sm py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all font-button-text text-button-text"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">slideshow</span>
              <span>Lecture Slides</span>
            </Link>
            <button
              onClick={() => setShowSqlDrawer(true)}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-button-text text-button-text transition-all shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>Launch SQL Scratchpad</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs pt-space-xs font-label-tag text-label-tag">
          <div className="flex items-center gap-space-xs p-space-xs px-space-sm rounded-lg bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
            <span className="text-on-surface-variant uppercase tracking-wider">Attendance:</span>
            <span className="text-on-surface font-semibold font-label-mono-wide">84.6%</span>
            <span className="text-secondary">(Safe • 6 miss left)</span>
          </div>
          <div className="flex items-center gap-space-xs p-space-xs px-space-sm rounded-lg bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-tertiary">grade</span>
            <span className="text-on-surface-variant uppercase tracking-wider">Projected Grade:</span>
            <span className="text-tertiary font-semibold font-label-mono-wide">Grade A (88%)</span>
          </div>
          <div className="flex items-center gap-space-xs p-space-xs px-space-sm rounded-lg bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-secondary">pending_actions</span>
            <span className="text-on-surface-variant uppercase tracking-wider">Pending Work:</span>
            <span className="text-on-surface font-semibold font-label-mono-wide">2 Deliverables</span>
          </div>
          <div className="flex items-center gap-space-xs p-space-xs px-space-sm rounded-lg bg-surface-container">
            <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
            <span className="text-on-surface-variant uppercase tracking-wider">Next Session:</span>
            <span className="text-primary font-semibold font-label-mono-wide">Tomorrow 10:00 AM</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-space-2xs overflow-x-auto pb-1 text-on-surface-variant font-button-text text-button-text">
        {[
          { id: 'overview', label: 'Overview', icon: 'overview' },
          { id: 'topics', label: 'Topics & Units (5)', icon: 'menu_book' },
          { id: 'notes', label: 'Notes & Cheatsheets (18)', icon: 'sticky_note_2' },
          { id: 'resources', label: 'Vault Resources', icon: 'folder_special' },
          { id: 'quizzes', label: 'Quizzes & Practice', icon: 'psychology' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-space-md py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                : 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-space-lg">
          {/* Immediate Deliverable Alert */}
          <div className="rounded-xl bg-surface-container-low border border-outline-variant/30 p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">assignment</span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-sm text-body-lg text-on-surface font-semibold">
                    CS-301 DBMS Assignment 03: Normalization &amp; B+ Tree Indexing
                  </h3>
                  <span className="px-2 py-0.2 rounded-full bg-tertiary-container text-on-tertiary-container font-label-tag text-[9px] uppercase font-semibold">
                    Due in 35h
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant">
                  Formal decomposition of relations into 3NF and BCNF with minimal functional dependency cover.
                </p>
              </div>
            </div>
            <Link
              href="/assignments"
              className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors shadow-sm shrink-0"
            >
              Open Submission Workspace
            </Link>
          </div>

          {/* Syllabus Breakdown by Units */}
          <div className="space-y-space-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Syllabus Breakdown by Units
            </h2>

            <div className="space-y-space-sm">
              {[
                { unit: 1, title: 'Relational Model & Relational Algebra', progress: 100, status: 'Completed', isWeak: false },
                { unit: 2, title: 'SQL Engine, Subqueries & Window Functions', progress: 94, status: 'Completed', isWeak: false },
                { unit: 3, title: 'Bernstein 3NF Synthesis & BCNF Decomposition', progress: 68, status: 'Active Focus', isWeak: true },
                { unit: 4, title: 'Transaction & Concurrency Control (2PL, MVCC)', progress: 30, status: 'Upcoming', isWeak: false },
                { unit: 5, title: 'Storage Engines & B+ Tree Indexing', progress: 15, status: 'Upcoming', isWeak: false },
              ].map((u) => (
                <div
                  key={u.unit}
                  className="rounded-xl bg-surface-container-low border border-outline-variant/30 p-space-md space-y-2 hover:border-outline-variant/60 transition-colors"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-mono-wide text-xs text-primary font-semibold">
                        UNIT 0{u.unit}
                      </span>
                      <h4 className="font-headline-sm text-body-md text-on-surface font-semibold">
                        {u.title}
                      </h4>
                      {u.isWeak && (
                        <span className="px-2 py-0.5 rounded-full bg-error-container/40 text-error font-label-tag text-[9px] uppercase font-semibold">
                          Deficit Identified
                        </span>
                      )}
                    </div>
                    <span className="font-label-mono-wide text-xs text-on-surface font-semibold">
                      {u.progress}% Mastered
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        u.isWeak ? 'bg-tertiary' : 'bg-primary'
                      }`}
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOPICS & UNITS TAB */}
      {activeTab === 'topics' && (
        <div className="space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Detailed Unit Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
              <span className="font-label-mono-wide text-xs text-primary">UNIT 3 • MODULE 3.1</span>
              <h4 className="font-headline-sm text-on-surface font-semibold">
                Functional Dependencies &amp; Attribute Closure
              </h4>
              <p className="text-body-sm text-on-surface-variant">
                Algorithms for finding $X^+$ attribute closure, extraneous attributes, and computing minimal canonical covers.
              </p>
              <button
                onClick={() => setShowSqlDrawer(true)}
                className="text-primary font-button-text text-body-sm hover:underline"
              >
                Practice in SQL Scratchpad →
              </button>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
              <span className="font-label-mono-wide text-xs text-primary">UNIT 3 • MODULE 3.2</span>
              <h4 className="font-headline-sm text-on-surface font-semibold">
                Bernstein 3NF Synthesis
              </h4>
              <p className="text-body-sm text-on-surface-variant">
                Synthesizing relations from canonical covers guaranteeing both dependency preservation and lossless join property.
              </p>
              <Link href="/nivora-ai?q=/explain-concept+Bernstein+3NF" className="text-primary font-button-text text-body-sm hover:underline">
                Ask Copilot to Derivate →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Curated Notes &amp; Cheatsheets
          </h2>
          <div className="space-y-2">
            {[
              { title: "Prof. Sharma's DBMS Master Pack (Units 1–4)", type: 'PDF Note', size: '18.4 MB', downloads: 312 },
              { title: 'Relational Normalization Decision Matrix Cheatsheet', type: 'Cheatsheet', size: '2.1 MB', downloads: 540 },
              { title: 'B+ Tree Splitting & Merge Algorithm Quick Reference', type: 'Formula Sheet', size: '1.4 MB', downloads: 198 },
            ].map((n, i) => (
              <div key={i} className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[22px]">description</span>
                  <div>
                    <h4 className="font-headline-sm text-body-md text-on-surface font-semibold">{n.title}</h4>
                    <span className="font-label-mono-wide text-[10px] text-on-surface-variant">{n.type} • {n.size} • {n.downloads} downloads</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-tag text-xs">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESOURCES TAB */}
      {activeTab === 'resources' && (
        <div className="space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Past Papers &amp; Exam Rubrics
          </h2>
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <h4 className="font-headline-sm text-on-surface font-semibold">
              DBMS 2020–2024 Mid-Term Papers with Marking Scheme
            </h4>
            <p className="text-body-sm text-on-surface-variant">
              Full collection of solved exam papers with professor grading rubric notes.
            </p>
            <Link href="/resources" className="inline-block text-primary font-button-text text-body-sm hover:underline">
              Open in Resource Vault →
            </Link>
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md shadow-md">
          <div className="space-y-1">
            <span className="font-label-tag text-label-tag text-primary uppercase tracking-widest">
              Interactive Retrieval Quiz
            </span>
            <h3 className="font-headline-md text-on-surface font-semibold">
              Module 03: Normalization &amp; Functional Dependencies
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Test your understanding of prime attributes and 3NF conditions.
            </p>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-space-sm">
            <p className="font-body-md text-on-surface font-medium">
              Consider relation $R(A, B, C, D)$ with FDs: $A \\rightarrow B$, $B \\rightarrow C$, and $C \\rightarrow D$. What is the highest normal form of $R$?
            </p>

            <div className="space-y-2">
              {[
                { key: 'A', label: 'First Normal Form (1NF)' },
                { key: 'B', label: 'Second Normal Form (2NF)' },
                { key: 'C', label: 'Third Normal Form (3NF) — because candidate key is A, but transitive dependencies exist' },
                { key: 'D', label: 'Boyce-Codd Normal Form (BCNF)' },
              ].map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => setQuizAnswer(opt.key)}
                  className={`p-space-sm rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
                    quizAnswer === opt.key
                      ? 'bg-secondary-container/60 border-primary text-on-surface'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="font-label-mono-wide text-xs font-bold text-primary">{opt.key}</span>
                  <span className="font-body-sm text-sm">{opt.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={submitQuiz}
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors"
              >
                Submit Answer
              </button>

              {quizScore !== null && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="font-headline-sm text-sm text-primary font-semibold">
                    Score: {quizScore}% — Mastery updated in your profile!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SQL Scratchpad Drawer Modal */}
      {showSqlDrawer && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSqlDrawer(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-space-lg space-y-space-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">terminal</span>
                <h3 className="font-headline-sm text-on-surface font-semibold">
                  SQL Query Scratchpad (In-Memory Engine)
                </h3>
              </div>
              <button
                onClick={() => setShowSqlDrawer(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-label-tag text-xs uppercase text-on-surface-variant block">
                SQL Statement
              </label>
              <textarea
                rows={4}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-label-mono-wide text-[10px] text-on-surface-variant">
                Query execution cost: 0.04ms • Buffer Hit 100%
              </span>
              <button
                onClick={executeSql}
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Execute Query</span>
              </button>
            </div>

            {/* Results Table */}
            <div className="space-y-1 pt-2">
              <span className="font-label-tag text-xs uppercase text-on-surface-variant block">
                Result Set ({sqlResults.length} rows returned)
              </span>
              <div className="overflow-x-auto rounded-lg border border-outline-variant/20">
                <table className="w-full text-left font-body-sm text-xs">
                  <thead className="bg-surface-container text-on-surface-variant font-label-mono-wide uppercase">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Relation Name</th>
                      <th className="p-2.5">Assignments Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {sqlResults.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-container/50">
                        <td className="p-2.5 font-mono text-primary">{row.id}</td>
                        <td className="p-2.5 text-on-surface">{row.name}</td>
                        <td className="p-2.5 text-on-surface-variant">{row.assignments_due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
