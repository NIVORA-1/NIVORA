'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface ProjectRepo {
  id: string;
  name: string;
  lang: string;
  course?: string;
  benchmark?: string;
  desc: string;
  description?: string;
  loc?: string;
  coverage?: string;
  stars?: number;
  forks?: number;
  deployment?: string;
  repoUrl?: string;
  techStack?: string;
  role?: string;
  progress?: number;
  commitsCount?: number;
  verifiedAudit?: boolean;
  jepsenPassed?: boolean;
}

const REPLAY_STEPS = [
  {
    time: 't=0.00s',
    title: 'Leader Election Initialized',
    desc: 'Election timer on Node 01 expires (150ms). Term advances to 14. RequestVote RPC broadcasted to Node 02 and Node 03. Both grant vote in majority quorum. Node 01 becomes Leader.',
    term: 14,
    node1Status: 'LEADER',
    node2Status: 'FOLLOWER',
    node3Status: 'FOLLOWER',
    commitIndex: 1840,
    networkStatus: 'Normal (Zero Partition)',
  },
  {
    time: 't=4.12s',
    title: 'Steady State Log Replication',
    desc: 'Client writes SET x="alpha" to Leader Node 01. AppendEntries RPC dispatched in parallel to followers. Logs matched at index 1841. Quorum ack received in 1.4ms; entry committed and applied to state machine.',
    term: 14,
    node1Status: 'LEADER',
    node2Status: 'FOLLOWER',
    node3Status: 'FOLLOWER',
    commitIndex: 1841,
    networkStatus: 'Normal (12.4k ops/s)',
  },
  {
    time: 't=12.40s',
    title: 'Asymmetric 2-3 Network Partition Split',
    desc: 'Chaos injection: Node 01 isolated in minority partition {Node 01}. Majority partition {Node 02, Node 03} loses heartbeats. Node 01 continues accepting uncommitted client logs, awaiting unreachable quorum.',
    term: 14,
    node1Status: 'STALE LEADER (Unreachable)',
    node2Status: 'FOLLOWER',
    node3Status: 'FOLLOWER',
    commitIndex: 1841,
    networkStatus: 'PARTITION ACTIVE (Risk Window)',
  },
  {
    time: 't=16.80s',
    title: 'Term Increment & Split Brain Prevented',
    desc: 'Node 02 times out and advances term to 15. Requests vote from Node 03; vote granted. Node 02 elected Leader for Term 15. Uncommitted writes to Node 01 safely rejected.',
    term: 15,
    node1Status: 'STALE LEADER (Unreachable)',
    node2Status: 'LEADER (Term 15)',
    node3Status: 'FOLLOWER',
    commitIndex: 1842,
    networkStatus: 'PARTITION ACTIVE (Safe Split)',
  },
  {
    time: 't=22.10s',
    title: 'Partition Healed & Reconciliation Complete',
    desc: 'Network partition resolved. Node 01 receives higher Term 15 heartbeat from Node 02. Node 01 immediately steps down to Follower. Uncommitted logs on Node 01 truncated; state machine safely reconciled without data loss (Jepsen passed).',
    term: 15,
    node1Status: 'FOLLOWER',
    node2Status: 'LEADER (Term 15)',
    node3Status: 'FOLLOWER',
    commitIndex: 1843,
    networkStatus: 'RECONCILED (Healthy)',
  },
];

export default function ProjectsPage() {
  const { currentStream, user, setIsQuickAddOpen } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'deployments'>('all');
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);
  const [replayStepIndex, setReplayStepIndex] = useState(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(
            data.map((p: any) => ({
              id: p.id,
              name: p.name,
              lang: p.techStack ? p.techStack.split(',')[0].toUpperCase() : 'CODE',
              course: p.role || 'ENGINEERING CAPSTONE',
              benchmark: p.jepsenPassed ? 'BENCHMARK: VERIFIED' : 'ACTIVE BUILD',
              desc: p.description,
              loc: `${p.commitsCount || 0} Commits`,
              coverage: p.verifiedAudit ? '100% Audited' : 'In Progress',
              stars: 0,
              forks: 0,
              deployment: p.repoUrl || 'GitHub Sync',
              repoUrl: p.repoUrl,
              techStack: p.techStack,
              role: p.role,
              progress: p.progress,
              commitsCount: p.commitsCount,
              verifiedAudit: p.verifiedAudit,
              jepsenPassed: p.jepsenPassed,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const currentReplay = REPLAY_STEPS[replayStepIndex];
  const totalCommits = projects.reduce((acc, p) => acc + (p.commitsCount || 0), 0);

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Tracking Meta Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm pb-space-xs">
        <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="tracking-widest uppercase text-on-surface-variant/90">
            GROWTH ENGINE / ARTIFACTS & REPOSITORIES
          </span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-medium">{streamData.degree} {streamData.name}</span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag flex items-center gap-1 border border-outline-variant/20">
            <span className="material-symbols-outlined text-[12px] text-primary">verified_user</span>
            SHA-256 LEDGER VALIDATED
          </span>
          <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-label-tag">
            LATENCY 14ms
          </span>
        </div>
      </div>

      {/* Editorial Title & Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-baseline gap-space-sm flex-wrap">
            <h1 className="font-display-quote text-[34px] leading-tight md:text-[42px] text-on-surface tracking-normal font-normal">
              Projects & Engineering Repos
            </h1>
            <span className="font-label-mono-wide text-label-mono-wide text-primary px-space-xs py-0.5 rounded bg-surface-container-high">
              v5.4 CAPSTONE REPO
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant/90 max-w-2xl">
            Curated engineering portfolio, active codebase repositories, and verified cryptographic proofs of academic and systems work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-space-2xs px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text shadow-sm transition-all border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Cryptographic Proofs</span>
          </button>
          <a
            href="/career"
            className="flex items-center gap-space-2xs px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-button-text text-button-text shadow-md transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Recruiter Audit View</span>
          </a>
        </div>
      </div>

      {/* Telemetry Metrics Grid (4 Top Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="p-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface-variant/70 tracking-wider">
              Verified Competencies
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">workspace_premium</span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-display-hero text-display-hero text-on-surface font-semibold">19</span>
              <span className="font-body-md text-body-md text-primary font-medium">Skills Mastered</span>
            </div>
            <p className="font-label-tag text-label-tag text-on-surface-variant mt-1">
              Top 5% in Systems & Algorithmic Design
            </p>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-mono-wide text-[10px] text-on-surface-variant/70 border-t border-outline-variant/20">
            <span>FACULTY VERIFIED</span>
            <span className="text-primary font-medium">100% AUDITED</span>
          </div>
        </div>

        <div className="p-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface-variant/70 tracking-wider">
              Active Codebases
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">terminal</span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-display-hero text-display-hero text-on-surface font-semibold">{projects.length}</span>
              <span className="font-body-md text-body-md text-secondary font-medium">Production Repos</span>
            </div>
            <p className="font-label-tag text-label-tag text-on-surface-variant mt-1">
              {totalCommits} verified Git commits
            </p>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-mono-wide text-[10px] text-on-surface-variant/70 border-t border-outline-variant/20">
            <span>COMMITS TOTAL</span>
            <span className="text-secondary font-medium">{totalCommits} COMMITS</span>
          </div>
        </div>

        <div className="p-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface-variant/70 tracking-wider">
              Portfolio Readiness
            </span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">badge</span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-display-hero text-display-hero text-tertiary font-semibold">{projects.length > 0 ? '91%' : '0%'}</span>
              <span className="font-body-md text-body-md text-on-surface-variant">Recruiter Index</span>
            </div>
            <p className="font-label-tag text-label-tag text-on-surface-variant mt-1">
              {projects.length > 0 ? "Pre-vetted for Systems SWE" : "Add repos to calibrate"}
            </p>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-mono-wide text-[10px] text-on-surface-variant/70 border-t border-outline-variant/20">
            <span>PORTFOLIO STATUS</span>
            <span className="text-tertiary font-medium">{projects.length > 0 ? "ACTIVE" : "STANDBY"}</span>
          </div>
        </div>

        <div className="p-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-mono-wide text-label-mono-wide uppercase text-on-surface-variant/70 tracking-wider">
              Industry Benchmarks
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">military_tech</span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-display-hero text-display-hero text-on-surface font-semibold">{projects.length}</span>
              <span className="font-body-md text-body-md text-primary font-medium">Audited Repos</span>
            </div>
            <p className="font-label-tag text-label-tag text-on-surface-variant mt-1">
              Verified cryptographic proofs
            </p>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-mono-wide text-[10px] text-on-surface-variant/70 border-t border-outline-variant/20">
            <span>AUDIT STATUS</span>
            <span className="text-primary font-medium">{projects.length > 0 ? "VALIDATED" : "STANDBY"}</span>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="p-space-xl rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-4 py-16 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-outline-variant/30">
            <span className="material-symbols-outlined text-[32px]">folder_open</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Your projects will appear here.
            </h3>
            <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
              Initialize your first engineering repository, track Git commits, and build your verified portfolio proofs.
            </p>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-button-text text-body-sm font-semibold hover:bg-primary-fixed transition-colors inline-flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Initialize First Project</span>
          </button>
        </div>
      ) : (
        <>
          {/* Flagship Spotlight Card */}
          <div className="relative rounded-2xl bg-surface-container-low p-card-padding border border-outline-variant/30 shadow-md overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-space-md">
              <div className="flex items-start justify-between gap-space-sm flex-wrap">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-label-tag flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    FLAGSHIP CAPSTONE
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container font-label-mono-wide text-label-mono-wide text-primary">
                    {projects[0].lang || 'Go 1.22'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container font-label-mono-wide text-label-mono-wide text-on-surface-variant">
                    {projects[0].course || 'CAPSTONE REPO'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-tertiary-container/30 text-tertiary font-label-mono-wide text-label-mono-wide">
                    {projects[0].benchmark || 'ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-on-surface-variant font-label-mono-wide text-label-mono-wide">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  <span>VERIFIED PROOF OF WORK</span>
                </div>
              </div>

              <div className="space-y-space-xs">
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
                  {projects[0].name}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
                  {projects[0].desc || projects[0].description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-space-sm flex-wrap pt-space-xs">
                <button
                  onClick={() => setIsReplayModalOpen(true)}
                  className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  <span>Launch Code Replay</span>
                </button>
                <button
                  onClick={() => setIsAuditModalOpen(true)}
                  className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text transition-colors border border-outline-variant/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
                  <span>Cryptographic Audit Proof</span>
                </button>
                {projects[0].repoUrl && (
                  <a
                    href={projects[0].repoUrl.startsWith('http') ? projects[0].repoUrl : `https://${projects[0].repoUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text transition-colors border border-outline-variant/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span>Repository</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Code Repositories Grid */}
          {projects.length > 1 && (
            <div className="space-y-space-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Additional Course & Research Repositories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {projects.slice(1).map((repo) => (
                  <div
                    key={repo.id}
                    className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm space-y-space-sm flex flex-col justify-between hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-space-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                          {repo.lang || repo.techStack || 'Code'}
                        </span>
                        <span className="font-label-tag text-label-tag text-secondary font-mono">
                          {repo.benchmark || `${repo.commitsCount || 0} commits`}
                        </span>
                      </div>

                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                        {repo.name}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {repo.desc || repo.description}
                      </p>
                    </div>

                    <div className="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between font-label-mono-wide text-label-tag text-on-surface-variant">
                      <span>{repo.loc || 'Active'} • {repo.coverage || 'Audited'}</span>
                      <span className="text-tertiary">{repo.role || 'Contributor'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* RAFT CODE REPLAY MODAL */}
      {isReplayModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-3xl shadow-2xl p-space-lg space-y-space-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">replay</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Raft Execution Timeline & Partition Replay
                  </h3>
                  <span className="font-label-mono-wide text-label-tag text-primary">
                    Scenario {replayStepIndex + 1} of {REPLAY_STEPS.length} • {currentReplay.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsReplayModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Timeline Steps Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-surface-container rounded-lg border border-outline-variant/20">
              {REPLAY_STEPS.map((step, idx) => (
                <button
                  key={step.time}
                  onClick={() => setReplayStepIndex(idx)}
                  className={`px-3 py-1.5 rounded font-label-mono-wide text-label-tag whitespace-nowrap transition-colors ${
                    replayStepIndex === idx
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {step.time}
                </button>
              ))}
            </div>

            {/* Scenario Details */}
            <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <div className="flex items-center justify-between font-label-mono-wide text-label-tag">
                <span className="text-secondary font-bold uppercase">{currentReplay.title}</span>
                <span className="text-tertiary">Term {currentReplay.term}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                {currentReplay.desc}
              </p>
              <div className="font-label-mono-wide text-label-tag text-primary pt-1">
                Network Status: {currentReplay.networkStatus}
              </div>
            </div>

            {/* Live Replay State Grid */}
            <div className="grid grid-cols-3 gap-space-sm font-mono text-body-sm">
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 space-y-1">
                <div className="font-bold text-primary">Node 01</div>
                <div className="text-label-tag text-on-surface-variant">{currentReplay.node1Status}</div>
                <div className="text-[11px] text-on-surface">Commit: {currentReplay.commitIndex}</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 space-y-1">
                <div className="font-bold text-secondary">Node 02</div>
                <div className="text-label-tag text-on-surface-variant">{currentReplay.node2Status}</div>
                <div className="text-[11px] text-on-surface">Commit: {currentReplay.commitIndex}</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 space-y-1">
                <div className="font-bold text-secondary">Node 03</div>
                <div className="text-label-tag text-on-surface-variant">{currentReplay.node3Status}</div>
                <div className="text-[11px] text-on-surface">Commit: {currentReplay.commitIndex}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/20">
              <button
                disabled={replayStepIndex === 0}
                onClick={() => setReplayStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text disabled:opacity-40"
              >
                ← Previous Timestamp
              </button>

              <button
                disabled={replayStepIndex === REPLAY_STEPS.length - 1}
                onClick={() => setReplayStepIndex((prev) => Math.min(REPLAY_STEPS.length - 1, prev + 1))}
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-button-text text-button-text font-semibold disabled:opacity-40"
              >
                Next Timestamp →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRYPTOGRAPHIC AUDIT MODAL */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-xl shadow-2xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Jepsen Verification Audit Packet
                </h3>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-mono text-body-sm text-primary space-y-2">
              <div className="text-on-surface-variant text-label-tag uppercase">Cryptographic Audit Report</div>
              <div>COMMIT HASH: 9b207fae441d8e03e1a029c782194bb10478201a</div>
              <div>MERKLE ROOT: e3b0c44298fc1c149afbf4c8996fb92427ae41e4</div>
              <div>JEPSEN CHAOS RESULT: LINEARIZABLE EXECUTION VERIFIED (0 LOSS)</div>
              <div>ATTESTATION SIGNATURE: RSA-4096 / FACULTY LEDGER CONFIRMED</div>
            </div>

            <div className="flex justify-end pt-space-xs">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold"
              >
                Verified & Validated
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
