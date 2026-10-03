'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AttendanceSimulationResult, calculateAttendanceTelemetry } from '@/lib/academicEngine';

const ENROLLED_SUBJECT_PRESETS = [
  { code: 'CS-301', name: 'Database Management Systems', total: 45, attended: 38, required: 75 },
  { code: 'CS-302', name: 'Data Structures & Algorithms', total: 42, attended: 35, required: 75 },
  { code: 'CS-303', name: 'Operating Systems & Concurrency', total: 38, attended: 26, required: 75 },
  { code: 'CS-304', name: 'Computer Networks', total: 40, attended: 36, required: 80 },
];

export default function AttendanceSimulatorTool() {
  const [selectedPreset, setSelectedPreset] = useState<string>('CS-301');
  const [subjectName, setSubjectName] = useState('Database Management Systems');
  const [totalClasses, setTotalClasses] = useState<number>(45);
  const [classesAttended, setClassesAttended] = useState<number>(38);
  const [requiredPct, setRequiredPct] = useState<number>(75);
  const [plannedFutureClasses, setPlannedFutureClasses] = useState<number>(10);
  const [plannedFutureAbsences, setPlannedFutureAbsences] = useState<number>(2);

  const [result, setResult] = useState<AttendanceSimulationResult | null>(null);

  // Compute telemetry
  const computeTelemetry = () => {
    const res = calculateAttendanceTelemetry({
      totalClasses,
      classesAttended,
      requiredPct,
      plannedFutureClasses,
      plannedFutureAbsences,
      subjectName,
    });
    setResult(res);
  };

  // Re-run computation automatically whenever inputs change
  useEffect(() => {
    computeTelemetry();
  }, [totalClasses, classesAttended, requiredPct, plannedFutureClasses, plannedFutureAbsences, subjectName]);

  const handleSelectPreset = (code: string) => {
    setSelectedPreset(code);
    const found = ENROLLED_SUBJECT_PRESETS.find((p) => p.code === code);
    if (found) {
      setSubjectName(found.name);
      setTotalClasses(found.total);
      setClassesAttended(found.attended);
      setRequiredPct(found.required);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input Form ── */}
      <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">how_to_reg</span>
            <h3 className="font-semibold text-on-surface text-base">Attendance Telemetry & Simulator</h3>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
            Statutory Threshold Modeling
          </span>
        </div>

        {/* Enrolled Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
            Quick-Select Enrolled Course
          </label>
          <div className="flex flex-wrap gap-2">
            {ENROLLED_SUBJECT_PRESETS.map((preset) => (
              <button
                key={preset.code}
                type="button"
                onClick={() => handleSelectPreset(preset.code)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors cursor-pointer ${
                  selectedPreset === preset.code
                    ? 'bg-secondary/20 border-secondary text-on-surface font-semibold'
                    : 'bg-surface hover:bg-surface-container border-outline-variant/30 text-on-surface-variant'
                }`}
              >
                {preset.code} ({preset.attended}/{preset.total})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Total Classes Conducted
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={totalClasses}
              onChange={(e) => setTotalClasses(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Classes Attended
            </label>
            <input
              type="number"
              min={0}
              max={totalClasses}
              value={classesAttended}
              onChange={(e) => setClassesAttended(Math.min(totalClasses, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Required Minimum (%)
            </label>
            <select
              value={requiredPct}
              onChange={(e) => setRequiredPct(parseInt(e.target.value))}
              className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-mono"
            >
              <option value={75}>75% (Standard University Statutory)</option>
              <option value={80}>80% (Strict Academic Criterion)</option>
              <option value={85}>85% (Distinction Criterion)</option>
              <option value={65}>65% (Medical Exemption Threshold)</option>
            </select>
          </div>
        </div>

        {/* What-If Planning Interactive Sliders */}
        <div className="p-4 rounded-xl bg-surface border border-outline-variant/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface font-mono uppercase tracking-wider">
            <span className="material-symbols-outlined text-secondary text-[18px]">query_stats</span>
            <span>Interactive What-If Simulation Sandbox</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-on-surface-variant">Planned Upcoming Classes:</span>
                <span className="font-bold text-on-surface">+{plannedFutureClasses} sessions</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={plannedFutureClasses}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setPlannedFutureClasses(val);
                  if (plannedFutureAbsences > val) setPlannedFutureAbsences(val);
                }}
                className="w-full accent-secondary cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-on-surface-variant">Planned Absences / Bunks:</span>
                <span className="font-bold text-error">-{plannedFutureAbsences} misses</span>
              </div>
              <input
                type="range"
                min={0}
                max={plannedFutureClasses}
                value={plannedFutureAbsences}
                onChange={(e) => setPlannedFutureAbsences(parseInt(e.target.value))}
                className="w-full accent-error cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Results Telemetry Display ── */}
      {result && (
        <div className="rounded-2xl bg-surface-container border border-secondary/20 shadow-md overflow-hidden space-y-0">
          {/* Status Banner */}
          <div
            className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              result.projectedStatus === 'safe'
                ? 'bg-primary/10 border-primary/20 text-primary'
                : result.projectedStatus === 'warning'
                ? 'bg-secondary/15 border-secondary/30 text-on-surface'
                : 'bg-error/10 border-error/20 text-error'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px]">
                {result.projectedStatus === 'safe'
                  ? 'verified'
                  : result.projectedStatus === 'warning'
                  ? 'warning'
                  : 'dangerous'}
              </span>
              <div>
                <div className="font-bold text-base font-mono uppercase tracking-wide">
                  {result.projectedStatus === 'safe'
                    ? 'Compliance Buffer Safe'
                    : result.projectedStatus === 'warning'
                    ? 'Marginal Threshold Warning'
                    : 'Debarment Risk Alert'}
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  {result.advice}
                </div>
              </div>
            </div>

            <div className="text-right sm:shrink-0 font-mono">
              <div className="text-[10px] text-on-surface-variant uppercase">Projected Rate</div>
              <div className="text-2xl font-bold">{result.projectedPct}%</div>
            </div>
          </div>

          {/* Metrics KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-outline-variant/20 bg-surface">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Current Attendance</div>
              <div className="text-2xl font-bold text-on-surface font-mono mt-0.5">
                {result.currentPct}%
              </div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">
                {result.classesAttended} / {result.totalClasses} attended
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Permissible Misses</div>
              <div className="text-2xl font-bold text-secondary font-mono mt-0.5">
                {result.maxMissesAllowed}
              </div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Safe Bunks Remaining</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Recovery Requirement</div>
              <div className="text-2xl font-bold text-error font-mono mt-0.5">
                {result.classesNeeded}
              </div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Consecutive Attendances</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase">Statutory Threshold</div>
              <div className="text-2xl font-bold text-on-surface font-mono mt-0.5">
                {result.requiredPct}%
              </div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5">Mandatory Minimum</div>
            </div>
          </div>

          {/* Mathematical Proof & Derivations */}
          <div className="p-5 sm:p-6 space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">functions</span>
              <span>Transparent Mathematical Proof & Formulas</span>
            </h5>

            <div className="space-y-2.5">
              {result.calculationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface border border-outline-variant/20 font-mono text-xs sm:text-sm text-on-surface leading-relaxed"
                >
                  {step}
                </div>
              ))}
            </div>

            {/* Attendance Progress Visualizer */}
            <div className="pt-3 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-on-surface-variant">Statutory Compliance Line ({result.requiredPct}%)</span>
                <span className="font-semibold text-on-surface">
                  {result.projectedPct >= result.requiredPct
                    ? `+${(result.projectedPct - result.requiredPct).toFixed(1)}% above buffer`
                    : `-${(result.requiredPct - result.projectedPct).toFixed(1)}% below threshold`}
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    result.projectedStatus === 'safe'
                      ? 'bg-primary'
                      : result.projectedStatus === 'warning'
                      ? 'bg-secondary'
                      : 'bg-error'
                  }`}
                  style={{ width: `${Math.min(result.projectedPct, 100)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-on-surface z-10"
                  style={{ left: `${result.requiredPct}%` }}
                  title={`Statutory limit: ${result.requiredPct}%`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
