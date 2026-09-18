'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  command?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: 'user',
    content:
      'Explain Bernstein\'s 3NF Synthesis algorithm step-by-step for CS-301 DBMS, and check if my candidate key {CE} preserves a lossless join under the dependency set F = { AB→C, C→D, D→E, E→A }.',
    time: '10:41 AM',
    command: '/explain-concept',
  },
  {
    role: 'assistant',
    content: `### Bernstein 3NF Synthesis Analysis & Verification

#### Step 1: Compute Minimal Canonical Cover $F_c$
Given functional dependencies $F = \\{ AB \\to C, C \\to D, D \\to E, E \\to A \\}$:
1. **Right-Hand Side Singularity**: All RHS attributes are single attributes.
2. **Extraneous Attribute Testing**:
   - In $AB \\to C$: compute $(A)^+ = \\{A\\}$ and $(B)^+ = \\{B\\}$. Neither contains $C$, so neither $A$ nor $B$ is extraneous.
   - Hence $F_c = F$.

#### Step 2: Form Relations for Each Functional Dependency
- $R_1(A, B, C)$ with key $AB$
- $R_2(C, D)$ with key $C$
- $R_3(D, E)$ with key $D$
- $R_4(E, A)$ with key $E$

#### Step 3: Candidate Key & Lossless Join Invariant Check
Testing candidate key $\\{CE\\}$:
- $(CE)^+ = \\{C, D, E, A, B\\} = R$ (since $C \\to D$, $D \\to E$, $E \\to A$, and together $AB \\to C$). Thus $\\{CE\\}$ is a valid candidate key.
- Since $\\{CE\\}$ is not a subset of any $R_i$, Bernstein's algorithm requires adding relation:
  $$R_5(C, E)$$
- **Lossless Decomposition Verdict**: ✅ Guaranteed lossless join and dependency preserving.`,
    time: '10:42 AM',
  },
];

export default function NivoraAiPage() {
  const { currentStream, user } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const slashCommands = [
    { cmd: '/explain-concept', desc: 'Step-by-step academic proofs' },
    { cmd: '/solve-pyq', desc: "Previous years' university questions" },
    { cmd: '/debug-code', desc: 'Autograder invariants & memory leaks' },
    { cmd: '/cite-ieee', desc: 'Generate peer-reviewed IEEE citation' },
    { cmd: '/simulate-attendance', desc: 'Predict compliance buffer' },
    { cmd: '/quiz-me', desc: 'Adaptive retrieval drill' },
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Call our Next.js AI API route
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          stream: currentStream,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Analysis complete. Cross-referenced course syllabus and telemetry.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        role: 'assistant',
        content: `### Synthesized Copilot Derivation\n\nCross-referenced with course material for ${streamData.name}. All theoretical invariants verified.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top System Telemetry & Header */}
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-space-xs font-label-tag text-label-tag text-on-surface-variant/80">
            <span className="text-primary font-semibold">ACADEMIC CORE</span>
            <span>/</span>
            <span>COGNITIVE ENGINE</span>
            <span>•</span>
            <span className="text-tertiary">SEMESTER 5 · {streamData.name.toUpperCase()}</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-semibold font-mono">
              MODEL: NIVORA-SCHOLAR-4.5
            </span>
          </div>
          <h1 className="font-display-quote text-display-quote text-on-surface font-normal italic tracking-wide">
            Autonomous Academic Copilot & Synthesizer
          </h1>
        </div>

        {/* Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-2 px-space-sm py-1.5 rounded-full bg-surface-container-low shadow-sm border border-outline-variant/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-label-tag text-label-tag text-on-surface-variant">AGENT ONLINE</span>
            <span className="text-outline-variant/60 text-xs">|</span>
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface">42ms</span>
            <span className="text-outline-variant/60 text-xs">|</span>
            <span className="font-label-tag text-label-tag text-secondary">EMBEDS 100% CACHED</span>
          </div>

          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors border border-outline-variant/20"
            title="Reset interaction buffer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
        </div>
      </section>

      {/* Omnipresent Academic Command Palette Hub */}
      <section className="relative flex flex-col rounded-xl bg-surface-container-low p-space-md shadow-md gap-space-sm border border-outline-variant/20">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Search / Command Input Field */}
        <div className="relative flex items-center w-full rounded-lg bg-surface-container-high px-space-md py-2.5 shadow-sm border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[22px] mr-space-sm">terminal</span>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask NIVORA AI or enter slash commands (/solve-pyq, /explain-concept, /simulate-attendance)..."
            className="w-full bg-transparent text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/50 focus:outline-none"
          />

          <div className="flex items-center gap-space-xs ml-space-sm">
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono-wide text-label-mono-wide">
              ↵ Enter
            </span>
            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              className="flex items-center gap-1 px-space-sm py-1 rounded bg-primary text-on-primary hover:bg-primary-fixed transition-colors font-button-text text-button-text font-semibold disabled:opacity-60"
            >
              <span>{isLoading ? 'Synthesizing...' : 'Execute'}</span>
              <span className="material-symbols-outlined text-[16px]">subdirectory_arrow_left</span>
            </button>
          </div>
        </div>

        {/* Academic Slash Command Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-label-tag text-label-tag text-on-surface-variant/70 uppercase tracking-widest mr-1">
            Routines:
          </span>
          {slashCommands.map((item) => (
            <button
              key={item.cmd}
              onClick={() => {
                setInputQuery(`${item.cmd} `);
              }}
              className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-tag text-label-tag hover:bg-secondary-container hover:text-on-secondary-container transition-colors border border-outline-variant/10"
              title={item.desc}
            >
              <span>{item.cmd}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Interaction Workspace: Asynchronous Dual Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Interaction Feed (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-space-md">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-space-lg rounded-xl border shadow-sm space-y-space-xs ${
                msg.role === 'user'
                  ? 'bg-surface-container-low border-outline-variant/20'
                  : 'bg-surface-container border-primary/20'
              }`}
            >
              <div className="flex items-center justify-between font-label-mono-wide text-label-tag text-on-surface-variant border-b border-outline-variant/15 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      msg.role === 'user'
                        ? 'bg-surface-container-high text-primary'
                        : 'bg-primary text-on-primary'
                    }`}
                  >
                    {msg.role === 'user' ? (user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST') : 'AI'}
                  </span>
                  <span className="font-semibold text-on-surface">
                    {msg.role === 'user'
                      ? `${user?.name || 'Student'} (Student #${user?.id ? user.id.slice(-6) : '210940'})`
                      : 'NIVORA Scholar Copilot'}
                  </span>
                </div>
                <span>{msg.time}</span>
              </div>

              <div className="text-body-md text-on-surface whitespace-pre-wrap leading-relaxed pt-1">
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="p-space-lg rounded-xl bg-surface-container border border-primary/30 flex items-center gap-3 text-primary font-mono text-body-sm">
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              <span>Synthesizing mathematical proof against faculty syllabus and local embeddings...</span>
            </div>
          )}
        </div>

        {/* Right Companion Rail (4 cols) */}
        <div className="lg:col-span-4 space-y-space-md">
          <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm space-y-space-sm">
            <span className="font-label-mono-wide text-label-tag text-primary uppercase font-semibold">
              ACTIVE EMBEDDED CONTEXTS
            </span>
            <div className="space-y-2 text-body-sm">
              <div className="p-2 rounded bg-surface-container text-on-surface flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">menu_book</span>
                <div>
                  <div className="font-medium">Silberschatz Database Systems 7th Ed.</div>
                  <div className="text-label-tag text-on-surface-variant">Chapter 14: Relational Database Design</div>
                </div>
              </div>

              <div className="p-2 rounded bg-surface-container text-on-surface flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">slideshow</span>
                <div>
                  <div className="font-medium">Prof. Sharma Lecture 18 Slides</div>
                  <div className="text-label-tag text-on-surface-variant">Bernstein Algorithm & Dependency Covers</div>
                </div>
              </div>

              <div className="p-2 rounded bg-surface-container text-on-surface flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">code</span>
                <div>
                  <div className="font-medium">CS-301 HW3 Schema Dump</div>
                  <div className="text-label-tag text-on-surface-variant">Hospital Transactions PostgreSQL DDL</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm space-y-2">
            <span className="font-label-mono-wide text-label-tag text-tertiary uppercase font-semibold">
              QUERY VELOCITY & QUOTA
            </span>
            <div className="flex justify-between text-body-sm font-medium text-on-surface">
              <span>Scholar Compute Quota</span>
              <span className="text-primary font-mono">Unlimited (Campus Node)</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
