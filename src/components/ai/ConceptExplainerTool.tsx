'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ConceptExplanationResult } from '@/lib/academicEngine';
import AiFallbackBanner from './AiFallbackBanner';

const SAMPLE_CONCEPTS = [
  'Bernstein 3NF Synthesis',
  'B+ Tree Fanout & Ordering',
  'Raft Distributed Consensus',
  'Dijkstra Shortest Path Algorithm',
  'Eigenvalues & Cayley-Hamilton',
  'TCP Tahoe vs Reno Congestion Control',
  'Virtual Memory & Inverted Page Tables',
];

export default function ConceptExplainerTool({ initialConcept }: { initialConcept?: string }) {
  const { currentStream } = useApp();

  const [concept, setConcept] = useState(initialConcept || 'Bernstein 3NF Synthesis');
  const [subject, setSubject] = useState('Database Management Systems');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Undergraduate' | 'Advanced' | 'Exam-Focused'>('Undergraduate');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConceptExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'examples' | 'exam'>('overview');
  const [copied, setCopied] = useState(false);

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!concept.trim()) return;

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'explain-concept',
          concept,
          subject,
          difficulty,
          stream: currentStream,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || 'Failed to explain concept');
      }

      setResult(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while explaining concept.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `# ${result.concept} (${result.difficulty} — ${result.domain})

## Intuitive Explanation
${result.simpleExplanation}

## Technical In-Depth Breakdown
${result.detailedExplanation}

## Step-by-Step Operations
${result.stepByStepBreakdown.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Examples
${result.examples.map((ex) => `- ${ex}`).join('\n')}

## Formulas & Invariants
${result.formulas.map((f) => `- ${f}`).join('\n')}

## Common Mistakes & Traps
${result.commonMistakes.map((m) => `- ${m}`).join('\n')}

## Exam High-Yield Summary
${result.examSummary}`;

    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input Panel ── */}
      <form onSubmit={handleExplain} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">school</span>
            <h3 className="font-semibold text-on-surface text-base">Academic Concept Explainer</h3>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
            Multi-Tier Rigorous Breakdown
          </span>
        </div>

        {/* Concept Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            Concept, Theorem, Algorithm, or Invariant
          </label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g. Bernstein 3NF Synthesis, B+ Tree Split Invariant, Raft Log Matching"
            className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-on-surface-variant/70 mr-1">Examples:</span>
          {SAMPLE_CONCEPTS.map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => {
                setConcept(sc);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              {sc}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Subject / Domain */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Academic Domain
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Database Systems, Algorithms, Networks"
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>

          {/* Difficulty Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Target Depth / Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            >
              <option value="Beginner">Beginner (Intuitive & Analogies)</option>
              <option value="Undergraduate">Undergraduate (Standard Semester Depth)</option>
              <option value="Advanced">Advanced (Rigorous Proofs & Boundary Invariants)</option>
              <option value="Exam-Focused">Exam-Focused (Marking Rubrics & Scoring Keywords)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="text-[11px] text-on-surface-variant/60">
            Includes analogies, step-by-step algorithms, formulas, and common exam traps.
          </div>
          <button
            type="submit"
            disabled={isLoading || !concept.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 transition-all font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-secondary/30 border-t-on-secondary rounded-full animate-spin" />
                <span>Explaining Concept…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>Explain Concept</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Error Banner ── */}
      {error && (
        <AiFallbackBanner message={error} onRetry={handleExplain} />
      )}

      {/* ── Results Display ── */}
      {result && (
        <div className="rounded-2xl bg-surface-container border border-secondary/20 shadow-md overflow-hidden space-y-0">
          {/* Header */}
          <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary text-[22px]">lightbulb</span>
                <h4 className="font-semibold text-on-surface text-base sm:text-lg">{result.concept}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary/15 text-on-surface font-semibold border border-secondary/30">
                  {result.difficulty.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono">{result.domain}</p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-5 border-b border-outline-variant/20 bg-surface overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 text-xs font-mono font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-secondary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Overview & Intuition
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('breakdown')}
              className={`py-3 px-3 text-xs font-mono font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'breakdown'
                  ? 'border-secondary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Step-by-Step Breakdown
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('examples')}
              className={`py-3 px-3 text-xs font-mono font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'examples'
                  ? 'border-secondary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Worked Examples & Formulas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exam')}
              className={`py-3 px-3 text-xs font-mono font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'exam'
                  ? 'border-secondary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Exam Scoring & Pitfalls
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Intuitive Mental Model */}
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface font-mono uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
                    <span>The Intuitive Mental Model & Analogy</span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">{result.simpleExplanation}</p>
                </div>

                {/* Technical In-Depth Explanation */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                    Rigorous Technical Explanation
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm text-on-surface leading-relaxed">
                    {result.detailedExplanation}
                  </div>
                </div>

                {/* Key Points */}
                {result.keyPoints && result.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                      Core Invariants & Takeaways
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.keyPoints.map((kp, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 p-3 rounded-lg bg-surface border border-outline-variant/20 text-xs text-on-surface"
                        >
                          <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 shrink-0">
                            check_circle
                          </span>
                          <span className="leading-relaxed">{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP-BY-STEP TAB ── */}
            {activeTab === 'breakdown' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Algorithmic / Operational Procedure
                </div>
                <div className="space-y-3">
                  {result.stepByStepBreakdown.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-secondary/15 text-on-surface border border-secondary/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="text-sm text-on-surface leading-relaxed pt-0.5">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── EXAMPLES & FORMULAS TAB ── */}
            {activeTab === 'examples' && (
              <div className="space-y-5">
                {/* Formulas & Invariants */}
                {result.formulas && result.formulas.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                      Governing Formulas, Complexity & Invariants
                    </div>
                    <div className="space-y-2">
                      {result.formulas.map((f, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-surface font-mono text-xs text-primary border border-outline-variant/25 leading-relaxed overflow-x-auto"
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worked Examples */}
                {result.examples && result.examples.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                      Concrete Worked Examples
                    </div>
                    <div className="space-y-3">
                      {result.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs sm:text-sm text-on-surface whitespace-pre-wrap font-mono leading-relaxed"
                        >
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── EXAM SCORING & PITFALLS TAB ── */}
            {activeTab === 'exam' && (
              <div className="space-y-5">
                {/* Exam High-Yield Summary */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary font-mono uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[18px]">grade</span>
                    <span>High-Yield Semester Exam Summary</span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">{result.examSummary}</p>
                </div>

                {/* Common Mistakes */}
                {result.commonMistakes && result.commonMistakes.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                      Common Traps & Where Students Lose Marks
                    </div>
                    <div className="space-y-2.5">
                      {result.commonMistakes.map((cm, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-error/5 border border-error/20 flex items-start gap-3"
                        >
                          <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">
                            warning
                          </span>
                          <span className="text-xs text-on-surface leading-relaxed">{cm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
