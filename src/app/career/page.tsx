'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface ApplicationItem {
  id: string;
  company: string;
  role: string;
  package: string;
  status: 'oa_scheduled' | 'interview_scheduled' | 'under_review' | 'offer';
  statusLabel: string;
  nextStep: string;
  urgency: string;
  matchScore: number;
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    company: 'Jane Street',
    role: 'Quantitative Software Engineer (Systems & Infrastructure)',
    package: '₹85 LPA / $220k',
    status: 'oa_scheduled',
    statusLabel: 'OA Scheduled',
    nextStep: 'Online Assessment in 21h 40m',
    urgency: 'HIGH',
    matchScore: 98,
  },
  {
    id: 'app-2',
    company: 'Google',
    role: 'Software Engineer (Systems & Cloud Infrastructure)',
    package: '₹42 LPA',
    status: 'under_review',
    statusLabel: 'Round 1 Cleared',
    nextStep: 'Systems Design Round Sep 20',
    urgency: 'MEDIUM',
    matchScore: 96,
  },
  {
    id: 'app-3',
    company: 'Goldman Sachs',
    role: 'Platform Infrastructure Engineer',
    package: '₹38 LPA',
    status: 'interview_scheduled',
    statusLabel: 'Final Superday Scheduled',
    nextStep: 'Executive Panel on Sep 24',
    urgency: 'MEDIUM',
    matchScore: 94,
  },
  {
    id: 'app-4',
    company: 'Databricks',
    role: 'Distributed Storage Engine Intern (Summer 26)',
    package: '₹2.5L/mo + PPO',
    status: 'under_review',
    statusLabel: 'Resume Shortlisted',
    nextStep: 'Take-home Systems Assignment',
    urgency: 'NORMAL',
    matchScore: 99,
  },
];

export default function CareerPage() {
  const { currentStream, user } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;
  const dossierNumber = user?.id ? `#NV-${user.id.slice(-4).toUpperCase()}` : '#NV-8492';

  const [activeTab, setActiveTab] = useState<'all' | 'oa' | 'interview' | 'review'>('all');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeInterview, setActiveInterview] = useState<any>(null);
  const [userResponse, setUserResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<{
    depth: number;
    invariants: number;
    clarity: number;
    feedback: string;
  } | null>(null);

  const [dossierUpdated, setDossierUpdated] = useState(false);

  const handleStartInterview = (interview: any) => {
    setActiveInterview(interview);
    setUserResponse(
      'Node 1 discards its uncommitted log entries because its Term (12) is stale compared to Node 3 (Term 15). The client write was only acknowledged as an uncommitted dirty read on the isolated minority partition. Node 3 accepts new writes, achieves quorum with Node 2, and forces Node 1 into Follower state once the partition heals.'
    );
    setEvaluationReport(null);
    setIsSimulatorOpen(true);
  };

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationReport({
        depth: 95,
        invariants: 94,
        clarity: 92,
        feedback:
          'Flawless technical precision. Correctly detailed the majority quorum requirement (N/2 + 1) which prevents the isolated Node 1 from committing unbacked log entries. Identified log truncation upon partition heal in Term 15.',
      });
    }, 1500);
  };

  const handleAddToDossier = () => {
    setDossierUpdated(true);
    alert(`AI Mock Interview Evaluation Report cryptographically added to your Verified Recruiter Dossier (${dossierNumber})!`);
    setIsSimulatorOpen(false);
  };

  const filteredApps = INITIAL_APPLICATIONS.filter((app) => {
    if (activeTab === 'oa') return app.status === 'oa_scheduled';
    if (activeTab === 'interview') return app.status === 'interview_scheduled';
    if (activeTab === 'review') return app.status === 'under_review';
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* 1. Top Telemetry & Breadcrumb Header */}
      <section className="flex flex-col gap-space-sm bg-surface-container-low p-space-lg rounded-xl shadow-md border border-outline-variant/20">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
            <span className="text-primary font-semibold">GROWTH ENGINE</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface">CAREER & RECRUITMENT PIPELINE</span>
            <span className="text-outline-variant">•</span>
            <span className="text-tertiary font-medium">SEM {user?.profile?.semester || 5} · FALL &apos;25</span>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface-variant/80">VERIFIED DOSSIER {dossierNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-tag text-label-tag text-on-surface-variant border border-outline-variant/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              CAMPUS DRIVE: ACTIVE
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-label-tag font-semibold">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              TIER 1 ELIGIBLE (100%)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-tag text-label-tag font-mono border border-primary/30">
              <span className="material-symbols-outlined text-[13px]">analytics</span>
              ATS SCORE: 96/100
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-space-xs">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Career & Placement Portal
              </h1>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-tertiary font-label-mono-wide text-label-mono-wide uppercase tracking-wider">
                ON-CAMPUS DRIVE 2025-26
              </span>
            </div>
            <p className="font-display-quote text-display-quote text-on-surface-variant max-w-4xl italic">
              Unified institutional recruitment pipeline, verified on-chain academic proofs, low-latency interview schedule telemetry, and peer performance benchmarks for {streamData.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs shrink-0">
            <button
              onClick={() => alert('Dossier synchronized with university placement ledger!')}
              className="flex items-center gap-space-2xs px-space-sm py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all font-button-text text-button-text border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Sync Dossier</span>
            </button>
            <button
              onClick={() => alert('Exporting Master ATS Resume formatted in LaTeX...')}
              className="flex items-center gap-space-2xs px-space-sm py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all font-button-text text-button-text border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Master Resume (ATS 96%)</span>
            </button>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-space-2xs px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-button-text text-button-text font-semibold shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>Mock AI Interview Prep</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Core Recruitment Metrics Row (4 interactive KPI cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-low hover:bg-surface-container p-space-md rounded-xl shadow-sm border border-outline-variant/20 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
                Active Applications
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                7 Applied / 3 Shortlisted
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container/40 text-tertiary font-label-tag text-label-tag font-semibold uppercase tracking-wider">
              Urgent
            </span>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant border-t border-outline-variant/20">
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Jane Street OA in 21h 40m</span>
            </div>
            <span className="font-label-tag text-label-tag text-on-surface-variant/70">Top 3% Target</span>
          </div>
        </div>

        <div className="bg-surface-container-low hover:bg-surface-container p-space-md rounded-xl shadow-sm border border-outline-variant/20 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
                Campus Eligibility Index
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-baseline gap-2">
                {user?.profile?.cgpa ? user.profile.cgpa.toFixed(2) : '9.42'} CGPA
                <span className="font-body-sm text-body-sm text-secondary font-normal">/ 10.0</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant border-t border-outline-variant/20">
            <span className="text-on-surface font-medium">Rank #4 (CS Dept)</span>
            <span className="text-secondary font-label-tag text-label-tag">Super-Dream Tier</span>
          </div>
        </div>

        <div className="bg-surface-container-low hover:bg-surface-container p-space-md rounded-xl shadow-sm border border-outline-variant/20 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
                Systems & Algorithmic Index
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-primary">
                98.4th Percentile
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant border-t border-outline-variant/20">
            <span className="truncate">LC 1,980 (Knight)</span>
            <span className="font-label-tag text-label-tag text-primary shrink-0">100/100 DBMS</span>
          </div>
        </div>

        <div className="bg-surface-container-low hover:bg-surface-container p-space-md rounded-xl shadow-sm border border-outline-variant/20 transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
                Offer Probability Score
              </span>
              <div className="font-headline-lg text-headline-lg font-bold text-tertiary">
                92% Predicted
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">insights</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant border-t border-outline-variant/20">
            <span>Systems / HFT Domain</span>
            <span className="font-label-tag text-label-tag text-on-surface-variant/80">
              Past 240 Placements
            </span>
          </div>
        </div>
      </section>

      {/* 3. Filter Tabs & View Controls */}
      <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-space-md py-1.5 rounded-lg text-body-sm font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>All Applications</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest/60 text-primary font-mono text-label-tag">
            {INITIAL_APPLICATIONS.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('oa')}
          className={`px-space-md py-1.5 rounded-lg text-body-sm font-semibold transition-colors ${
            activeTab === 'oa'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          OA Scheduled (1)
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`px-space-md py-1.5 rounded-lg text-body-sm font-semibold transition-colors ${
            activeTab === 'interview'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Superday / Interviews (1)
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-space-md py-1.5 rounded-lg text-body-sm font-semibold transition-colors ${
            activeTab === 'review'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Under Review (2)
        </button>
      </div>

      {/* 4. Applications Pipeline Grid */}
      <div className="grid grid-cols-1 gap-space-md">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md hover:border-primary/40 transition-colors"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {app.company}
                </span>
                <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                  {app.package}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-label-tag text-label-tag font-semibold ${
                    app.urgency === 'HIGH'
                      ? 'bg-error-container/40 text-error'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  {app.statusLabel}
                </span>
              </div>

              <h4 className="font-body-md text-body-md text-on-surface-variant truncate">
                {app.role}
              </h4>
              <p className="font-label-mono-wide text-label-tag text-secondary font-medium">
                Next: {app.nextStep}
              </p>
            </div>

            <div className="flex items-center gap-space-md shrink-0">
              <div className="text-right">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  {app.matchScore}%
                </span>
                <span className="block font-label-tag text-label-tag text-on-surface-variant">
                  Match Score
                </span>
              </div>

              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text transition-colors border border-outline-variant/20 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
                <span>Prepare Drill</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI MOCK INTERVIEW SIMULATOR MODAL */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-3xl shadow-2xl p-space-lg space-y-space-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">smart_toy</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    NIVORA AI Mock Interview Simulator
                  </h3>
                  <span className="font-label-mono-wide text-label-tag text-primary">
                    Domain: Distributed Systems & Raft Consensus Architecture
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Prompt Card */}
            <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <span className="font-label-mono-wide text-label-tag text-tertiary uppercase font-semibold">
                INTERVIEWER PROMPT (JANE STREET SYSTEMS DRILL)
              </span>
              <p className="font-body-md text-body-md text-on-surface font-medium leading-relaxed">
                Explain how the Raft consensus protocol guarantees safety during a 2-3 asymmetric network partition where Node 1 is isolated from Nodes 2 and 3. What prevents split-brain writes, and what happens to uncommitted logs upon network healing?
              </p>
            </div>

            {/* Candidate Response Editor */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-label-mono-wide text-label-tag text-on-surface-variant">
                <span>CANDIDATE RESPONSE</span>
                <span className="text-primary font-mono">CODE & ARCHITECTURE AUDIT ACTIVE</span>
              </div>
              <textarea
                rows={5}
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="In Raft, a write requires a majority quorum (N/2 + 1) to commit. Since Node 1 is alone in a partition of 1, it cannot obtain acknowledgments from 2 out of 3 nodes, so it cannot commit any client logs..."
                className="w-full p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono leading-relaxed"
              />
            </div>

            {/* Evaluation Report */}
            {isEvaluating && (
              <div className="p-space-md rounded-xl bg-surface-container border border-primary/30 flex items-center justify-center gap-2 text-primary font-label-mono-wide text-body-sm">
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Evaluating technical depth, distributed invariants & communication clarity...</span>
              </div>
            )}

            {evaluationReport && !isEvaluating && (
              <div className="p-space-md rounded-xl bg-surface-container border border-primary/40 space-y-3">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <span className="font-label-mono-wide text-label-tag text-primary font-bold uppercase">
                    EVALUATION & VERIFICATION REPORT
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    Score: 94 / 100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-surface-container-high">
                    <div className="font-bold text-primary">{evaluationReport.depth}%</div>
                    <div className="text-label-tag text-on-surface-variant">Technical Depth</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container-high">
                    <div className="font-bold text-secondary">{evaluationReport.invariants}%</div>
                    <div className="text-label-tag text-on-surface-variant">System Invariants</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container-high">
                    <div className="font-bold text-tertiary">{evaluationReport.clarity}%</div>
                    <div className="text-label-tag text-on-surface-variant">Clarity & Precision</div>
                  </div>
                </div>

                <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                  {evaluationReport.feedback}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleAddToDossier}
                    className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed shadow-md"
                  >
                    Add Evaluation Report to Recruiter Dossier
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/20">
              <span className="font-label-mono-wide text-label-tag text-on-surface-variant">
                Live Simulator v2.4
              </span>

              <div className="flex items-center gap-space-xs">
                <button
                  onClick={() => setIsSimulatorOpen(false)}
                  className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating}
                  className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-button-text text-button-text font-semibold shadow-sm"
                >
                  Submit for AI Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
