'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { StudyPlanResult, StudyPlanDay } from '@/lib/academicEngine';
import AiFallbackBanner from './AiFallbackBanner';

interface StudyPlanToolProps {
  onSelectTopicForExplainer?: (topic: string) => void;
}

const COMMON_SUBJECTS = [
  { code: 'CS-301', name: 'Database Management Systems', defaultTopics: 'ER Modeling, Relational Algebra, SQL, Normalization (3NF/BCNF), Transactions & 2PL, Indexing & B+ Trees' },
  { code: 'CS-302', name: 'Data Structures & Algorithms', defaultTopics: 'Asymptotic Notation, Trees & AVL Rotations, Heaps, Graph BFS/DFS, Dijkstra, Dynamic Programming' },
  { code: 'CS-303', name: 'Operating Systems & Concurrency', defaultTopics: 'Process Scheduling, Deadlocks & Banker Algorithm, Semaphore & Mutex, Virtual Memory & Paging, File Systems' },
  { code: 'CS-304', name: 'Computer Networks', defaultTopics: 'OSI/TCP-IP Models, Sliding Window Protocols, Subnetting & CIDR, Routing (OSPF/BGP), TCP Flow & Congestion Control' },
  { code: 'MAT201', name: 'Discrete Mathematical Structures', defaultTopics: 'Propositional Logic, Set Theory, Recurrence Relations, Graph Theory & Trees, Group Theory' },
];

export default function StudyPlanTool({ onSelectTopicForExplainer }: StudyPlanToolProps) {
  const { user, currentStream } = useApp();

  // Form State
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS-301');
  const [customSubject, setCustomSubject] = useState('');
  const [topics, setTopics] = useState(COMMON_SUBJECTS[0].defaultTopics);
  
  // Default exam date: 14 days from today
  const defaultExamDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const [examDate, setExamDate] = useState(defaultExamDate);
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Revision Mode'>('Intermediate');
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [weakTopics, setWeakTopics] = useState('B+ Trees, 3NF Synthesis');

  // Execution & UI State
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'failed'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  const currentSubjectName = selectedSubjectCode === 'custom'
    ? customSubject || 'Custom Subject'
    : COMMON_SUBJECTS.find((s) => s.code === selectedSubjectCode)?.name || 'Computer Science';

  const handleSubjectChange = (code: string) => {
    setSelectedSubjectCode(code);
    if (code !== 'custom') {
      const found = COMMON_SUBJECTS.find((s) => s.code === code);
      if (found) {
        setTopics(found.defaultTopics);
      }
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'study-plan',
          subject: currentSubjectName,
          topics,
          examDate,
          currentLevel,
          dailyHours,
          weakTopics,
          stream: currentStream,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || 'Failed to generate study plan');
      }

      setPlan(json.data);
      setCompletedTasks({});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while generating study plan.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleSyncToPlanner = async () => {
    if (!plan || plan.schedule.length === 0) return;
    setSyncStatus('syncing');
    setSyncMessage('');

    try {
      const payloadTasks = plan.schedule.map((day) => ({
        title: `[Study] ${day.focusTopic}`,
        description: day.tasks.join('\n'),
        category: 'deepwork',
        date: day.date,
        startTime: '09:00 AM',
        endTime: `1${day.durationHours}:00 ${day.durationHours > 2 ? 'PM' : 'AM'}`,
        priority: day.isWeakTopic ? 'high' : 'medium',
        relatedSubjectCode: selectedSubjectCode !== 'custom' ? selectedSubjectCode : undefined,
      }));

      const res = await fetch('/api/ai/sync-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: payloadTasks }),
      });

      const json = await res.json();
      if (res.ok) {
        setSyncStatus('synced');
        setSyncMessage(json.message || 'Synced to Nivora Planner!');
      } else {
        // If unauthenticated or failed
        setSyncStatus('failed');
        setSyncMessage(json.error || 'Could not sync. Please ensure you are logged in.');
      }
    } catch {
      setSyncStatus('failed');
      setSyncMessage('Network error while syncing with planner.');
    }
  };

  const handleCopyMarkdown = () => {
    if (!plan) return;
    let md = `# Personalized Study Plan: ${plan.subject}\n`;
    md += `Exam Date: ${plan.examDate} (${plan.daysLeft} days remaining) | Daily Hours: ${plan.dailyHours} hrs\n\n`;
    md += `## Daily Timetable\n`;
    plan.schedule.forEach((day) => {
      md += `### Day ${day.day} (${day.date}) — ${day.focusTopic} [${day.durationHours} hrs]\n`;
      day.tasks.forEach((t) => {
        md += `- [ ] ${t}\n`;
      });
      md += '\n';
    });
    md += `## Strategy\n${plan.weakTopicStrategy}\n\n`;
    md += `## Tips\n${plan.tips.map((t) => `- ${t}`).join('\n')}\n`;

    navigator.clipboard.writeText(md).catch(() => {});
    alert('Study plan copied as Markdown to clipboard!');
  };

  const totalTasks = plan ? plan.schedule.reduce((acc, d) => acc + d.tasks.length, 0) : 0;
  const doneTasksCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasksCount / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Form Section ── */}
      <form onSubmit={handleGenerate} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
            <h3 className="font-semibold text-on-surface text-base">Study Plan Parameters</h3>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
            Adaptive Syllabus Pacing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Target Subject
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            >
              {COMMON_SUBJECTS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
              <option value="custom">+ Enter Custom Subject</option>
            </select>
          </div>

          {/* Custom Subject Name if selected */}
          {selectedSubjectCode === 'custom' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Custom Subject Title
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems & Fault Tolerance"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Exam Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Current Preparation Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Current Preparation Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as any)}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="Beginner">Beginner (Starting from scratch)</option>
              <option value="Intermediate">Intermediate (Attended lectures, need practice)</option>
              <option value="Advanced">Advanced (Syllabus covered, high-scoring prep)</option>
              <option value="Revision Mode">Revision Mode (Final sprint & mock tests)</option>
            </select>
          </div>

          {/* Daily Available Study Time */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Daily Study Capacity
              </label>
              <span className="text-xs font-bold text-primary font-mono">{dailyHours} hours/day</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/60 font-mono">
              <span>1 hr (Light)</span>
              <span>4 hrs (Target)</span>
              <span>8 hrs (Intense)</span>
            </div>
          </div>
        </div>

        {/* Topics Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            Syllabus Topics (comma or line separated)
          </label>
          <textarea
            rows={2}
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g. Relational Normalization, B+ Trees, 2PL Concurrency, Recovery Logging"
            className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Weak Topics */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Weak / High-Difficulty Topics (Prioritized 2x)
            </label>
            <span className="text-[11px] text-tertiary">Optional</span>
          </div>
          <input
            type="text"
            value={weakTopics}
            onChange={(e) => setWeakTopics(e.target.value)}
            placeholder="e.g. B+ Tree node split proofs, Bernstein synthesis"
            className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="text-[11px] text-on-surface-variant/60 hidden sm:block">
            Generates day-by-day revision slots, practice sets, and mock tests.
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                <span>Synthesizing Plan…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>Generate Study Plan</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Error Banner ── */}
      {error && (
        <AiFallbackBanner message={error} onRetry={handleGenerate} />
      )}

      {/* ── Results Display ── */}
      {plan && (
        <div className="rounded-2xl bg-surface-container border border-primary/20 shadow-md overflow-hidden space-y-0">
          {/* Header Bar */}
          <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                <h4 className="font-semibold text-on-surface text-base">
                  Study Plan: {plan.subject}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                  {plan.daysLeft} DAYS SPRINT
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Exam on <span className="font-medium text-on-surface">{plan.examDate}</span> · Commitment:{' '}
                <span className="font-medium text-on-surface">{plan.dailyHours} hrs/day</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncToPlanner}
                disabled={syncStatus === 'syncing' || syncStatus === 'synced'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer"
                title="Save tasks into Nivora Planner"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {syncStatus === 'synced' ? 'check_circle' : 'sync'}
                </span>
                <span>{syncStatus === 'synced' ? 'Added to Planner' : syncStatus === 'syncing' ? 'Syncing…' : 'Sync to Planner'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer"
                title="Copy markdown"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy Plan</span>
              </button>
            </div>
          </div>

          {/* Sync status message if present */}
          {syncMessage && (
            <div
              className={`px-5 py-2 text-xs font-medium border-b ${
                syncStatus === 'synced'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-error/10 text-error border-error/20'
              }`}
            >
              {syncMessage}
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-outline-variant/20 bg-surface">
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Syllabus Progress</div>
              <div className="text-lg font-bold text-primary font-mono mt-0.5">{progressPercent}%</div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">
                {doneTasksCount} of {totalTasks} tasks completed
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Total Study Days</div>
              <div className="text-lg font-bold text-on-surface font-mono mt-0.5">{plan.schedule.length} Days</div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Until Exam Day</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Revision Cycles</div>
              <div className="text-lg font-bold text-secondary font-mono mt-0.5">{plan.revisionSessionsCount} Cycles</div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Spaced Active Recall</div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Practice Drills</div>
              <div className="text-lg font-bold text-tertiary font-mono mt-0.5">{plan.practiceSessionsCount} Sets</div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">PYQs & Mock Papers</div>
            </div>
          </div>

          {/* Weak Topic Strategy Banner */}
          {plan.weakTopicStrategy && (
            <div className="p-4 mx-5 my-4 rounded-xl bg-secondary/10 border border-secondary/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">lightbulb</span>
              <div>
                <div className="text-xs font-semibold text-on-surface mb-0.5 font-mono uppercase tracking-wide">
                  Strategic Weak-Topic Allocation
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  {plan.weakTopicStrategy}
                </div>
              </div>
            </div>
          )}

          {/* Schedule List */}
          <div className="p-5 space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Day-by-Day Implementation Roadmap
            </h5>

            <div className="space-y-3">
              {plan.schedule.map((day) => {
                const dayId = `day-${day.day}`;
                return (
                  <div
                    key={dayId}
                    className={`rounded-xl border transition-all ${
                      day.isWeakTopic
                        ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                        : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/40'
                    } p-4`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-outline-variant/15">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded border border-outline-variant/20">
                          DAY {day.day}
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono">{day.date}</span>
                        {day.isWeakTopic && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold uppercase">
                            Weak Area Focus
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                        <span className="material-symbols-outlined text-[15px]">schedule</span>
                        <span>{day.durationHours} hrs</span>
                        <span className="text-outline-variant/40">•</span>
                        <span className="capitalize">{day.sessionType.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="font-semibold text-sm text-on-surface mb-2">
                      {day.focusTopic}
                    </div>

                    {/* Task checklist */}
                    <div className="space-y-1.5 pl-1">
                      {day.tasks.map((task, tIdx) => {
                        const taskId = `${dayId}-task-${tIdx}`;
                        const isDone = Boolean(completedTasks[taskId]);
                        return (
                          <label
                            key={taskId}
                            className="flex items-start gap-2.5 text-xs text-on-surface cursor-pointer select-none group"
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleTask(taskId)}
                              className="mt-0.5 rounded text-primary focus:ring-primary accent-primary"
                            />
                            <span
                              className={`leading-relaxed transition-all ${
                                isDone
                                  ? 'line-through text-on-surface-variant/50'
                                  : 'text-on-surface group-hover:text-primary'
                              }`}
                            >
                              {task}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips Footer */}
          {plan.tips && plan.tips.length > 0 && (
            <div className="p-5 bg-surface-container-low border-t border-outline-variant/20 space-y-2">
              <div className="text-xs font-semibold text-on-surface uppercase tracking-wider font-mono">
                Academic Advisor Notes
              </div>
              <ul className="space-y-1 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                {plan.tips.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
