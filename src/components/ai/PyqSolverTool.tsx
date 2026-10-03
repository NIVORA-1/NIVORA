'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PyqSolverResult } from '@/lib/academicEngine';
import AiFallbackBanner from './AiFallbackBanner';

const SAMPLE_PYQS = [
  {
    title: 'GATE 2024: B+ Tree Fan-out & Order',
    subject: 'Database Management Systems',
    examType: 'GATE / University End-Sem',
    text: 'A B+ Tree file organization has disk block size of 4096 bytes. The search key size is 12 bytes and block pointer size is 8 bytes. What is the maximum order (fan-out) of an internal node? If record pointers are 8 bytes, what is the maximum number of record entries in a leaf node?',
  },
  {
    title: 'Semester Exam: 3NF & Candidate Key',
    subject: 'Database Management Systems',
    examType: 'University Semester Examination',
    text: 'Consider relation R(A, B, C, D, E) with Functional Dependencies F = { A -> BC, CD -> E, B -> D, E -> A }. (i) Find all Candidate Keys of R. (ii) Determine the highest Normal Form of R with justification.',
  },
  {
    title: 'GATE: Banker Algorithm Safe State',
    subject: 'Operating Systems',
    examType: 'GATE CS',
    text: 'Consider a system with 5 processes P0 through P4 and 3 resource types A (10 instances), B (5 instances), C (7 instances). At time T0, Allocation matrix and Max matrix are given. Determine whether the system is in a safe state and compute the safe execution sequence.',
  },
];

export default function PyqSolverTool() {
  const { currentStream } = useApp();

  const [question, setQuestion] = useState(SAMPLE_PYQS[0].text);
  const [subject, setSubject] = useState(SAMPLE_PYQS[0].subject);
  const [examType, setExamType] = useState('GATE / University End-Sem');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PyqSolverResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSolve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'solve-pyq',
          question,
          subject,
          examType,
          stream: currentStream,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || 'Failed to solve examination question');
      }

      setResult(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while solving question.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_PYQS[0]) => {
    setQuestion(sample.text);
    setSubject(sample.subject);
    setExamType(sample.examType);
  };

  const handleCopySolution = () => {
    if (!result) return;
    const text = `# Solved Examination Question (${result.subject} — ${result.examType})

## Problem
${result.question}

## Question Analysis & Classification
${result.questionAnalysis}
- Topic: ${result.relevantTopic}
- Evaluation Level: ${result.difficultyLevel}

## Step-by-Step Solution
${result.stepByStepSolution.join('\n\n')}

## Final Answer
${result.finalAnswer}

## Conceptual Explanation
${result.explanation}

## Exam Marking Tips & Common Traps
${result.examTips.map((t) => `- ${t}`).join('\n')}`;

    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input Form ── */}
      <form onSubmit={handleSolve} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">quiz</span>
            <h3 className="font-semibold text-on-surface text-base">Previous Year Exam Question (PYQ) Solver</h3>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
            Full Derivation & Marking Rubric
          </span>
        </div>

        {/* Sample Question Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-on-surface-variant/70">Load Verified Exam Problem:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PYQS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-left"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Exam Framework
            </label>
            <input
              type="text"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="e.g. University End-Sem, GATE 2024, Mid-Sem"
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Subject Name / Code
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Database Management Systems, CS-301"
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary"
            />
          </div>
        </div>

        {/* Question Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            Exam Question (Paste full problem statement, numerical values, or code)
          </label>
          <textarea
            rows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Paste university or GATE question here..."
            className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="text-[11px] text-on-surface-variant/60">
            Computes step-by-step mathematical working, highlights final answer, and gives examiner tips.
          </div>
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tertiary text-on-tertiary hover:bg-tertiary/90 transition-all font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-tertiary/30 border-t-on-tertiary rounded-full animate-spin" />
                <span>Solving Question…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">calculate</span>
                <span>Solve PYQ</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Error Banner ── */}
      {error && (
        <AiFallbackBanner message={error} onRetry={handleSolve} />
      )}

      {/* ── Result Panel ── */}
      {result && (
        <div className="rounded-2xl bg-surface-container border border-tertiary/20 shadow-md overflow-hidden space-y-0">
          {/* Header */}
          <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                <h4 className="font-semibold text-on-surface text-base">Solved University Problem</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-tertiary/15 text-on-surface font-semibold border border-tertiary/30">
                  {result.difficultyLevel}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono">
                {result.subject} · {result.relevantTopic}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySolution}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied Solution!' : 'Copy Full Solution'}</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Final Answer Callout Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-tertiary/10 border-2 border-tertiary/30 space-y-1.5">
              <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Final Exam Result / Verified Answer</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-on-surface font-mono">
                {result.finalAnswer}
              </div>
            </div>

            {/* Problem Analysis */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Problem Decomposition & Parameters
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs sm:text-sm text-on-surface leading-relaxed">
                {result.questionAnalysis}
              </div>
            </div>

            {/* Step-by-Step Derivation */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Step-by-Step Derivation & Calculations
              </div>
              <div className="space-y-3">
                {result.stepByStepSolution.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-surface border border-outline-variant/20 space-y-1 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-on-surface"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Conceptual Foundation */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Theoretical Concept & Theorem Mapping
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs sm:text-sm text-on-surface leading-relaxed">
                {result.explanation}
              </div>
            </div>

            {/* Exam Tips & Traps */}
            {result.examTips && result.examTips.length > 0 && (
              <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 space-y-2">
                <div className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">tips_and_updates</span>
                  <span>Evaluator Scoring Rubric & Common Traps</span>
                </div>
                <ul className="space-y-1.5 text-xs text-on-surface-variant list-disc pl-5 leading-relaxed">
                  {result.examTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
