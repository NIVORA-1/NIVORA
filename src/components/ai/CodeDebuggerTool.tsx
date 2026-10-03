'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CodeDebugResult } from '@/lib/academicEngine';
import AiFallbackBanner from './AiFallbackBanner';

const SAMPLE_BUGS: Record<string, { title: string; lang: string; code: string; errorDesc: string }> = {
  c_buffer: {
    title: 'C: gets() Buffer Overflow & Missing free()',
    lang: 'C',
    code: `#include <stdio.h>
#include <stdlib.h>

void process_input() {
    char buffer[64];
    int *count = (int*)malloc(sizeof(int));
    *count = 10;
    
    printf("Enter student name: ");
    gets(buffer); // Bug: gets causes unbounded buffer overflow
    
    printf("Processed %s with id %d\\n", buffer, *count);
    // Bug: missing free(count) causes memory leak
}

int main() {
    process_input();
    return 0;
}`,
    errorDesc: 'Compiler warning about gets() and Valgrind reports memory leak on exit.',
  },
  py_mutable: {
    title: 'Python: Mutable Default Argument State Leak',
    lang: 'Python',
    code: `def append_grade(grade, history=[]):
    history.append(grade)
    return history

# Invocations retain state across calls unexpectedly:
print(append_grade("A")) # Expected: ['A']
print(append_grade("B")) # Expected: ['B'], but prints ['A', 'B']!
`,
    errorDesc: 'The history list retains previous values across independent function invocations.',
  },
  java_equals: {
    title: 'Java: String Equality & Null Pointer Hazard',
    lang: 'Java',
    code: `public class Authenticator {
    public static boolean verifyToken(String userToken, String expected) {
        // Bug: == checks reference identity, not string content
        if (userToken == expected) {
            return true;
        }
        // Bug: calling toLowerCase without null check can throw NullPointerException
        return userToken.toLowerCase().equals(expected.toLowerCase());
    }
}`,
    errorDesc: 'Authentication fails for identical string contents; throws NullPointerException if userToken is null.',
  },
};

export default function CodeDebuggerTool() {
  const { currentStream } = useApp();

  const [language, setLanguage] = useState('C');
  const [code, setCode] = useState(SAMPLE_BUGS.c_buffer.code);
  const [errorDescription, setErrorDescription] = useState(SAMPLE_BUGS.c_buffer.errorDesc);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeDebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDebug = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'debug-code',
          language,
          code,
          errorDescription,
          stream: currentStream,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || 'Failed to debug code');
      }

      setResult(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while debugging code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (key: keyof typeof SAMPLE_BUGS) => {
    const s = SAMPLE_BUGS[key];
    setLanguage(s.lang);
    setCode(s.code);
    setErrorDescription(s.errorDesc);
  };

  const handleCopyCorrected = () => {
    if (!result?.correctedCode) return;
    navigator.clipboard.writeText(result.correctedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input Form ── */}
      <form onSubmit={handleDebug} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">terminal</span>
            <h3 className="font-semibold text-on-surface text-base">Code Debugger & Invariant Analyser</h3>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
            Static & Dynamic Inspection
          </span>
        </div>

        {/* Sample Bug Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-on-surface-variant/70">Load Common Bug Scenarios:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleLoadSample('c_buffer')}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface font-mono transition-colors cursor-pointer"
            >
              C: Buffer Overflow & Leak
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('py_mutable')}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface font-mono transition-colors cursor-pointer"
            >
              Python: Mutable Default Arg
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('java_equals')}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface font-mono transition-colors cursor-pointer"
            >
              Java: Reference Equality
            </button>
          </div>
        </div>

        {/* Language & Error Observation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary font-mono"
            >
              <option value="C">C (C99 / C11)</option>
              <option value="C++">C++ (C++17 / C++20)</option>
              <option value="Java">Java (OpenJDK)</option>
              <option value="Python">Python (Python 3.x)</option>
              <option value="JavaScript">JavaScript (ES6+)</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Go">Go (Golang)</option>
              <option value="Rust">Rust</option>
              <option value="SQL">SQL (PostgreSQL / MySQL)</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Observed Symptom / Runtime Error (Optional)
            </label>
            <input
              type="text"
              value={errorDescription}
              onChange={(e) => setErrorDescription(e.target.value)}
              placeholder="e.g. Segmentation fault (core dumped), wrong output on edge cases"
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary font-mono"
            />
          </div>
        </div>

        {/* Code Editor */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono flex items-center justify-between">
            <span>Code Input</span>
            <span className="text-[10px] text-on-surface-variant/60">{code.split('\n').length} lines</span>
          </label>
          <div className="relative rounded-xl overflow-hidden border border-outline-variant/50 bg-surface">
            <textarea
              rows={9}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              className="w-full p-4 text-xs sm:text-sm font-mono bg-transparent text-on-surface focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="text-[11px] text-on-surface-variant/60">
            Detects syntax, memory leaks, algorithmic invariants, and security hazards.
          </div>
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tertiary text-on-tertiary hover:bg-tertiary/90 transition-all font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-tertiary/30 border-t-on-tertiary rounded-full animate-spin" />
                <span>Analyzing AST & Invariants…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">bug_report</span>
                <span>Debug & Analyse Code</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Error Banner ── */}
      {error && (
        <AiFallbackBanner message={error} onRetry={handleDebug} />
      )}

      {/* ── Results Display ── */}
      {result && (
        <div className="rounded-2xl bg-surface-container border border-tertiary/20 shadow-md overflow-hidden space-y-0">
          {/* Header */}
          <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    result.hasErrors ? 'text-error' : 'text-primary'
                  }`}
                >
                  {result.hasErrors ? 'error' : 'verified'}
                </span>
                <h4 className="font-semibold text-on-surface text-base">
                  {result.hasErrors ? 'Issues Detected & Remediated' : 'Verified Implementation'}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-tertiary/15 text-on-surface font-semibold border border-tertiary/30 uppercase">
                  {result.language}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">{result.explanation}</p>
            </div>

            <button
              type="button"
              onClick={handleCopyCorrected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied Code!' : 'Copy Corrected Code'}</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Detected Issues List */}
            {result.detectedIssues.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Identified Violations & Hazard Points
                </div>
                <div className="space-y-2">
                  {result.detectedIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-error/5 border border-error/20 flex items-start gap-2.5 text-xs text-on-surface leading-relaxed"
                    >
                      <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">
                        warning
                      </span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corrected Code Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                <span>Corrected & Hardened Code</span>
                <span className="text-primary font-mono lowercase">verified syntax</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-outline-variant/30 bg-surface">
                <pre className="p-4 text-xs font-mono text-on-surface overflow-x-auto leading-relaxed">
                  <code>{result.correctedCode}</code>
                </pre>
              </div>
            </div>

            {/* Line-by-Line Changes */}
            {result.lineByLineDiff && result.lineByLineDiff.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Line-by-Line Remediation Log
                </div>
                <div className="space-y-2">
                  {result.lineByLineDiff.map((diff, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1.5 text-xs font-mono"
                    >
                      <div className="font-bold text-tertiary">Line {diff.lineNum}:</div>
                      <div className="text-error line-through bg-error/10 p-1.5 rounded">
                        - {diff.original}
                      </div>
                      <div className="text-primary bg-primary/10 p-1.5 rounded font-semibold">
                        + {diff.corrected}
                      </div>
                      <div className="text-on-surface-variant pt-1 font-sans text-xs">
                        Rationale: {diff.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complexity Analysis Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
                <div className="text-[10px] font-mono uppercase text-on-surface-variant font-semibold">
                  Time Complexity (Asymptotic)
                </div>
                <div className="text-base font-bold text-on-surface font-mono">
                  {result.timeComplexity.after}
                </div>
                <div className="text-xs text-on-surface-variant/80 pt-1 leading-relaxed">
                  {result.timeComplexity.explanation}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-outline-variant/20 space-y-1">
                <div className="text-[10px] font-mono uppercase text-on-surface-variant font-semibold">
                  Space Complexity (Auxiliary)
                </div>
                <div className="text-base font-bold text-on-surface font-mono">
                  {result.spaceComplexity.after}
                </div>
                <div className="text-xs text-on-surface-variant/80 pt-1 leading-relaxed">
                  {result.spaceComplexity.explanation}
                </div>
              </div>
            </div>

            {/* Security & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.securityNotes && result.securityNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 space-y-2">
                  <div className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">security</span>
                    <span>Security & Memory Safety Invariants</span>
                  </div>
                  <ul className="space-y-1 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                    {result.securityNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.improvements && result.improvements.length > 0 && (
                <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 space-y-2">
                  <div className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">rocket_launch</span>
                    <span>Performance & Idiomatic Clean Code</span>
                  </div>
                  <ul className="space-y-1 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                    {result.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
