'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';
import StudyPlanTool from '@/components/ai/StudyPlanTool';
import ConceptExplainerTool from '@/components/ai/ConceptExplainerTool';
import PyqSolverTool from '@/components/ai/PyqSolverTool';
import AdaptiveQuizTool from '@/components/ai/AdaptiveQuizTool';
import AttendanceSimulatorTool from '@/components/ai/AttendanceSimulatorTool';
import CodeDebuggerTool from '@/components/ai/CodeDebuggerTool';
import IeeeCitationTool from '@/components/ai/IeeeCitationTool';

/* ── Tool types ─────────────────────────────────────── */
type ActiveTool =
  | 'none'
  | 'study-plan'
  | 'explain-concept'
  | 'solve-pyq'
  | 'quiz-me'
  | 'simulate-attendance'
  | 'debug-code'
  | 'cite-ieee';

/* ── Workspace tools metadata ────────────────────────── */
const TOOLS = [
  {
    id: 'study-plan' as ActiveTool,
    icon: 'calendar_month',
    title: 'Personalized Study Plan',
    desc: 'Generate a subject-aligned revision schedule based on your upcoming exams and weak areas.',
    badge: 'Planning',
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    id: 'explain-concept' as ActiveTool,
    icon: 'school',
    title: 'Concept Explainer',
    desc: 'Step-by-step breakdown of any academic concept, theorem, algorithm, or proof.',
    badge: 'Academic',
    color: 'text-secondary bg-secondary/10 border-secondary/20',
  },
  {
    id: 'solve-pyq' as ActiveTool,
    icon: 'quiz',
    title: 'PYQ Solver',
    desc: 'Solve previous university and GATE examination questions with full derivations.',
    badge: 'Exam Prep',
    color: 'text-tertiary bg-tertiary/10 border-tertiary/20',
  },
  {
    id: 'quiz-me' as ActiveTool,
    icon: 'psychology',
    title: 'Adaptive Quiz',
    desc: 'Test yourself with AI-generated questions calibrated to your subject and difficulty level.',
    badge: 'Revision',
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    id: 'simulate-attendance' as ActiveTool,
    icon: 'how_to_reg',
    title: 'Attendance Simulator',
    desc: 'Predict the impact of absences on your compliance percentage and statutory threshold buffer.',
    badge: 'Telemetry',
    color: 'text-secondary bg-secondary/10 border-secondary/20',
  },
  {
    id: 'debug-code' as ActiveTool,
    icon: 'terminal',
    title: 'Code Debugger & Analyser',
    desc: 'Identify bugs, memory leaks, and algorithmic invariant violations in your code.',
    badge: 'Dev Tools',
    color: 'text-tertiary bg-tertiary/10 border-tertiary/20',
  },
  {
    id: 'cite-ieee' as ActiveTool,
    icon: 'format_quote',
    title: 'IEEE Citation Generator',
    desc: 'Generate peer-reviewed IEEE format citations from paper titles, DOIs, or bibliographic details.',
    badge: 'Research',
    color: 'text-primary bg-primary/10 border-primary/20',
  },
];

export default function NivoraAiPage() {
  const { currentStream, user } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [prefilledConcept, setPrefilledConcept] = useState<string>('');

  const handleSelectTool = (id: ActiveTool) => {
    setActiveTool(id);
  };

  const handleReset = () => {
    setActiveTool('none');
  };

  const handleLearnConcept = (topicName: string) => {
    setPrefilledConcept(topicName);
    setActiveTool('explain-concept');
  };

  const selectedTool = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* ── Page Header ── */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-md pb-space-xs border-b border-outline-variant/20">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-space-xs font-label-tag text-label-tag text-on-surface-variant/80">
            <span className="text-primary font-semibold">ACADEMIC CORE</span>
            <span>/</span>
            <span>AI WORKSPACE</span>
            <span>•</span>
            <span className="text-tertiary">{streamData.name.toUpperCase()} · SEMESTER 5</span>
          </div>
          <h1 className="font-display-quote text-display-quote text-on-surface font-normal italic tracking-wide">
            Nivora AI Workspace
          </h1>
          <p className="text-body-sm text-on-surface-variant max-w-xl">
            AI-powered student tools — study planning, concept explanation, exam preparation,
            quiz generation, attendance simulation, code debugging, and research citations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-space-sm py-1.5 rounded-full bg-surface-container-low shadow-sm border border-outline-variant/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-label-tag text-label-tag text-on-surface-variant">AGENT ONLINE</span>
            <span className="text-outline-variant/60 text-xs">|</span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface font-semibold">SCHOLAR-4.5</span>
          </div>
        </div>
      </section>

      {/* ── Tool Cards Grid (shown when no tool is selected) ── */}
      {activeTool === 'none' && (
        <section>
          <div className="flex items-center justify-between mb-space-md">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest font-mono">
              Academic Core Tools
            </h2>
            <span className="text-[11px] font-mono text-on-surface-variant/70">
              7 Active Cognitive Engines
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleSelectTool(tool.id)}
                className="group text-left p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tool.color}`}>
                      <span className="material-symbols-outlined text-[22px]">{tool.icon}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tool.color}`}>
                      {tool.badge}
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {tool.title}
                  </div>
                  <div className="text-xs text-on-surface-variant leading-relaxed">
                    {tool.desc}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-[11px] font-medium text-on-surface-variant/60 group-hover:text-primary transition-colors pt-3 border-t border-outline-variant/15">
                  <span>Open tool</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Active Tool Panel ── */}
      {activeTool !== 'none' && selectedTool && (
        <section className="flex flex-col gap-space-lg">
          {/* Tool header + back + quick switcher */}
          <div className="flex flex-col gap-3 pb-2 border-b border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/20 cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Back to all tools"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>All Tools</span>
                </button>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${selectedTool.color}`}>
                  <span className="material-symbols-outlined text-[18px]">{selectedTool.icon}</span>
                </div>
                <div>
                  <div className="font-semibold text-on-surface text-sm sm:text-base">{selectedTool.title}</div>
                  <div className="text-[11px] text-on-surface-variant hidden sm:block">{selectedTool.desc}</div>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${selectedTool.color} hidden sm:inline-block`}>
                {selectedTool.badge}
              </span>
            </div>

            {/* Quick Tool Switcher Strip */}
            <div className="flex items-center gap-1 overflow-x-auto pt-1 no-scrollbar">
              <span className="text-[10px] font-mono text-on-surface-variant/60 uppercase mr-1 shrink-0">Switch:</span>
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTool(t.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer shrink-0 font-mono ${
                    activeTool === t.id
                      ? 'bg-primary text-on-primary border-primary font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tool Dynamic Workspace */}
          {activeTool === 'study-plan' && (
            <StudyPlanTool onSelectTopicForExplainer={handleLearnConcept} />
          )}

          {activeTool === 'explain-concept' && (
            <ConceptExplainerTool initialConcept={prefilledConcept} />
          )}

          {activeTool === 'solve-pyq' && (
            <PyqSolverTool />
          )}

          {activeTool === 'quiz-me' && (
            <AdaptiveQuizTool onLearnConcept={handleLearnConcept} />
          )}

          {activeTool === 'simulate-attendance' && (
            <AttendanceSimulatorTool />
          )}

          {activeTool === 'debug-code' && (
            <CodeDebuggerTool />
          )}

          {activeTool === 'cite-ieee' && (
            <IeeeCitationTool />
          )}
        </section>
      )}

      {/* ── Footer info strip ── */}
      <div className="pt-2 border-t border-outline-variant/15 flex flex-wrap items-center justify-between gap-2 text-[10px] text-on-surface-variant/50 font-mono">
        <span>Nivora AI Workspace · Academic Tools · {streamData.name}</span>
        <span>SCHOLAR-4.5 · Student ID {user?.id ? user.id.slice(-6) : '210940'}</span>
      </div>
    </div>
  );
}
