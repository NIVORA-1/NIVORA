'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { QuizResult, QuizQuestion } from '@/lib/academicEngine';
import AiFallbackBanner from './AiFallbackBanner';

interface AdaptiveQuizToolProps {
  onLearnConcept?: (concept: string) => void;
}

export default function AdaptiveQuizTool({ onLearnConcept }: AdaptiveQuizToolProps) {
  const { currentStream } = useApp();

  // Setup Form State
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [topic, setTopic] = useState('AVL Trees & Heap Invariants');
  const [initialDifficulty, setInitialDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);

  // Quiz Engine State
  const [stage, setStage] = useState<'setup' | 'in_progress' | 'completed'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quizData, setQuizData] = useState<QuizResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Handle Quiz Generation
  const handleStartQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'quiz-me',
          subject,
          topic,
          difficulty: initialDifficulty,
          numQuestions,
          stream: currentStream,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data || !json.data.questions?.length) {
        throw new Error(json.error || 'Failed to generate quiz questions');
      }

      setQuizData(json.data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setRevealedQuestions({});
      setCurrentDifficulty(initialDifficulty);
      setStage('in_progress');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generating quiz';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Option Selection
  const handleSelectOption = (optionIndex: number) => {
    if (!quizData) return;
    if (revealedQuestions[currentIndex]) return; // already answered

    const currentQ = quizData.questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;

    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setRevealedQuestions((prev) => ({ ...prev, [currentIndex]: true }));

    // Adaptive difficulty adjustment:
    if (isCorrect) {
      if (currentDifficulty === 'easy') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('hard');
    } else {
      if (currentDifficulty === 'hard') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('easy');
    }
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStage('completed');
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealedQuestions({});
    setCurrentDifficulty(initialDifficulty);
    setStage('in_progress');
  };

  const handleNewQuiz = () => {
    setStage('setup');
    setQuizData(null);
    setSelectedAnswers({});
    setRevealedQuestions({});
  };

  // Calculations for Completed Stage
  const questions = quizData?.questions || [];
  const totalAnswered = Object.keys(selectedAnswers).length;
  const correctCount = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  // Weak Topics Detection
  const weakTopics = questions
    .filter((q, idx) => selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== q.correctIndex)
    .map((q) => q.topic);
  const uniqueWeakTopics = Array.from(new Set(weakTopics));

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* ── STAGE 1: SETUP ── */}
      {stage === 'setup' && (
        <form onSubmit={handleStartQuiz} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
              <h3 className="font-semibold text-on-surface text-base">Adaptive Quiz Generator</h3>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
              Real-Time Dynamic Difficulty
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Academic Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms, DBMS"
                className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Syllabus Topic / Sub-Area
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AVL Trees, Normalization, Process Deadlocks"
                className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Starting Difficulty
              </label>
              <select
                value={initialDifficulty}
                onChange={(e) => setInitialDifficulty(e.target.value as any)}
                className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="easy">Easy (Foundational Concepts)</option>
                <option value="medium">Medium (Standard Exam Standard)</option>
                <option value="hard">Hard (GATE / High-Cognitive Invariants)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value={3}>3 Questions (Quick Check)</option>
                <option value={5}>5 Questions (Standard Quiz)</option>
                <option value={10}>10 Questions (Comprehensive Test)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant/60">
              Difficulty recalibrates in real time based on your consecutive answers.
            </div>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-auto"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Generating Questions…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Start Adaptive Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <AiFallbackBanner message={error} onRetry={handleStartQuiz} />
      )}

      {/* ── STAGE 2: IN PROGRESS QUIZ RUNNER ── */}
      {stage === 'in_progress' && currentQ && (
        <div className="rounded-2xl bg-surface-container border border-primary/20 shadow-md overflow-hidden space-y-0">
          {/* Quiz Top Bar */}
          <div className="p-4 sm:p-5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
              <span className="text-xs font-mono text-on-surface-variant hidden sm:inline">
                {quizData?.subject} · {currentQ.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">
                Current Difficulty:
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  currentDifficulty === 'hard'
                    ? 'bg-error/10 text-error border border-error/30'
                    : currentDifficulty === 'medium'
                    ? 'bg-secondary/15 text-on-surface border border-secondary/30'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}
              >
                {currentDifficulty}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container-high h-1.5">
            <div
              className="bg-primary h-1.5 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Body */}
          <div className="p-5 sm:p-6 space-y-5">
            <h4 className="text-base sm:text-lg font-semibold text-on-surface leading-snug">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIndex] === oIdx;
                const isRevealed = Boolean(revealedQuestions[currentIndex]);
                const isCorrect = oIdx === currentQ.correctIndex;

                let btnStyles =
                  'bg-surface hover:bg-surface-container border-outline-variant/30 text-on-surface';

                if (isRevealed) {
                  if (isCorrect) {
                    btnStyles = 'bg-primary/15 border-primary text-primary font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnStyles = 'bg-error/15 border-error text-error font-semibold';
                  } else {
                    btnStyles = 'opacity-40 border-outline-variant/20 text-on-surface-variant';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isRevealed}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${btnStyles}`}
                  >
                    <span className="w-6 h-6 rounded-md bg-surface-container border border-outline-variant/30 flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="leading-relaxed pt-0.5 flex-1">{opt}</span>

                    {isRevealed && isCorrect && (
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                        check_circle
                      </span>
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <span className="material-symbols-outlined text-error text-[20px] shrink-0">
                        cancel
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {revealedQuestions[currentIndex] && (
              <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 space-y-1.5 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                  <span>Explanation & Conceptual Proof</span>
                </div>
                <div className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {currentQ.explanation}
                </div>
              </div>
            )}

            {/* Next Button */}
            {revealedQuestions[currentIndex] && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all font-semibold text-sm shadow-sm cursor-pointer"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Performance Report'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STAGE 3: COMPLETED RESULTS SUMMARY ── */}
      {stage === 'completed' && (
        <div className="rounded-2xl bg-surface-container border border-primary/20 shadow-md overflow-hidden space-y-0">
          {/* Result Header */}
          <div className="p-6 bg-surface-container-low border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                Adaptive Assessment Completed
              </div>
              <h3 className="text-xl font-bold text-on-surface mt-1">
                {quizData?.subject} — Performance Summary
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Topic: {quizData?.topic}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>Retake Quiz</span>
              </button>
              <button
                type="button"
                onClick={handleNewQuiz}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors text-xs font-semibold shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New Quiz</span>
              </button>
            </div>
          </div>

          {/* Metrics KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-outline-variant/20 bg-surface">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Final Score</div>
              <div className="text-2xl font-bold text-primary font-mono mt-1">
                {correctCount} / {questions.length}
              </div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Correctly Answered</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Accuracy Rate</div>
              <div className="text-2xl font-bold text-on-surface font-mono mt-1">{accuracy}%</div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Overall Precision</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Mastery Band</div>
              <div className="text-sm font-bold text-secondary font-mono mt-2 uppercase">
                {accuracy >= 80 ? 'Mastery Achieved' : accuracy >= 60 ? 'Proficient' : 'Revision Required'}
              </div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Based on Invariants</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Terminal Level</div>
              <div className="text-sm font-bold text-tertiary font-mono mt-2 uppercase">
                {currentDifficulty}
              </div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Adapted Level</div>
            </div>
          </div>

          {/* Weak Topics Detection */}
          {uniqueWeakTopics.length > 0 ? (
            <div className="p-5 border-b border-outline-variant/20 bg-error/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[20px]">flag</span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
                  Weak Topics Detected — Targeted Revision Needed
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                You missed questions related to the following concepts. We recommend running them through the Concept Explainer:
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueWeakTopics.map((wt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-error/30 text-xs font-semibold text-on-surface"
                  >
                    <span>{wt}</span>
                    {onLearnConcept && (
                      <button
                        type="button"
                        onClick={() => onLearnConcept(wt)}
                        className="text-[11px] text-primary hover:underline font-mono ml-1 cursor-pointer"
                      >
                        Explain &rarr;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 border-b border-outline-variant/20 bg-primary/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
              <div>
                <div className="text-xs font-bold text-on-surface font-mono uppercase">
                  Flawless Syllabus Coverage
                </div>
                <div className="text-xs text-on-surface-variant">
                  No conceptual weak spots detected across this evaluation set.
                </div>
              </div>
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="p-5 sm:p-6 space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Detailed Question Review
            </h5>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      isCorrect
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-error/30 bg-error/5'
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-on-surface">Question {idx + 1}</span>
                      <span
                        className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                          isCorrect
                            ? 'bg-primary/20 text-primary'
                            : 'bg-error/20 text-error'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-on-surface">{q.question}</div>
                    <div className="text-xs space-y-1 pt-1">
                      <div className="text-on-surface-variant">
                        Your answer: <span className="font-semibold text-on-surface">{userAns !== undefined ? q.options[userAns] : 'Not answered'}</span>
                      </div>
                      {!isCorrect && (
                        <div className="text-primary font-medium">
                          Correct answer: <span className="font-semibold">{q.options[q.correctIndex]}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant/80 pt-1 border-t border-outline-variant/15 leading-relaxed">
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
