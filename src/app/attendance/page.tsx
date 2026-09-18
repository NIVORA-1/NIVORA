'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AttendancePage() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [targetSubject, setTargetSubject] = useState('CS-301');
  const [simMisses, setSimMisses] = useState(2);
  const [synced, setSynced] = useState(false);

  // Subject attendance states
  const [modules, setModules] = useState([
    {
      code: 'CS-301',
      name: 'Database Management Systems (DBMS)',
      instructor: 'Dr. K. Sharma',
      attended: 38,
      conducted: 45,
      rate: 84.6,
      safeMisses: 6,
      status: 'Optimal',
    },
    {
      code: 'CS-302',
      name: 'Data Structures & Algorithms (DSA)',
      instructor: 'Prof. A. Bannerjee',
      attended: 41,
      conducted: 46,
      rate: 89.2,
      safeMisses: 8,
      status: 'Optimal',
    },
    {
      code: 'CS-303',
      name: 'Operating Systems & Concurrency',
      instructor: 'Dr. V. Raman',
      attended: 37,
      conducted: 45,
      rate: 82.2,
      safeMisses: 4,
      status: 'Attention',
    },
    {
      code: 'CS-304',
      name: 'Computer Networks & Protocols',
      instructor: 'Prof. S. Sengupta',
      attended: 43,
      conducted: 47,
      rate: 91.5,
      safeMisses: 9,
      status: 'Optimal',
    },
  ]);

  // Simulation calculation
  const selectedMod = modules.find((m) => m.code === targetSubject) || modules[0];
  const simNewTotal = selectedMod.conducted + simMisses;
  const simNewRate = ((selectedMod.attended / simNewTotal) * 100).toFixed(1);
  const simDelta = (parseFloat(simNewRate) - selectedMod.rate).toFixed(1);
  const simSafeRemaining = Math.max(0, Math.floor(selectedMod.attended / 0.75 - simNewTotal));

  const syncBiometrics = () => {
    setSynced(true);
    setTimeout(() => setSynced(false), 2000);
  };

  const logSession = (code: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.code === code) {
          const newAtt = m.attended + 1;
          const newCond = m.conducted + 1;
          const newRate = parseFloat(((newAtt / newCond) * 100).toFixed(1));
          return {
            ...m,
            attended: newAtt,
            conducted: newCond,
            rate: newRate,
            safeMisses: Math.floor(newAtt / 0.75 - newCond),
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-xl pb-space-4xl animate-in fade-in duration-200">
      {/* Top Breadcrumb & Metadata Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-xs">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant/80 tracking-widest uppercase">
            <span>Academic Core</span>
            <span className="text-outline-variant/60">/</span>
            <span className="text-primary font-semibold">Attendance Cadence</span>
            <span className="text-outline-variant/60">•</span>
            <span className="text-tertiary">Semester 5</span>
            <span className="text-outline-variant/60">•</span>
            <span className="text-on-surface-variant/60">Fall &apos;25</span>
          </div>
          <div className="flex items-baseline gap-space-md">
            <h1 className="font-display-quote text-display-hero text-on-surface tracking-tight font-normal">
              Attendance
            </h1>
            <span className="font-label-tag text-label-tag uppercase tracking-widest px-2.5 py-1 rounded-full bg-surface-container-high text-primary shadow-sm">
              Telemetry Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
            Real-time compliance telemetry, algorithmic absence buffers, and predictive exam eligibility modeling.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-space-sm self-start md:self-end">
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-all text-button-text font-button-text shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">model_training</span>
            <span>{showDrawer ? 'Hide Sandbox' : 'Simulate Absence Impact'}</span>
          </button>
          <button
            onClick={syncBiometrics}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-all text-button-text font-button-text shadow-sm cursor-pointer font-semibold"
          >
            <span className={`material-symbols-outlined text-[18px] ${synced ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{synced ? 'Synced ERP!' : 'Sync Biometric / ERP'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulation Drawer */}
      {showDrawer && (
        <div className="p-space-lg rounded-2xl bg-surface-container-low border border-primary/30 shadow-2xl space-y-space-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between border-b border-outline-variant/20 pb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">science</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Predictive Absence Simulation Sandbox
              </span>
            </div>
            <button
              onClick={() => setShowDrawer(false)}
              className="text-on-surface-variant hover:text-on-surface text-body-sm font-label-tag uppercase"
            >
              Close [ESC]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md pt-space-xs">
            <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/30">
              <span className="font-label-tag text-label-tag uppercase text-on-surface-variant">
                Target Subject
              </span>
              <select
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-body-sm outline-none border border-outline-variant/40"
              >
                {modules.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.code} {m.name.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/30">
              <span className="font-label-tag text-label-tag uppercase text-on-surface-variant">
                Hypothetical Missed Sessions
              </span>
              <div className="flex items-center gap-space-xs mt-2">
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={simMisses}
                  onChange={(e) => setSimMisses(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="font-label-mono-wide text-label-mono-wide text-primary px-2.5 py-1 rounded bg-surface-container-high font-semibold">
                  {simMisses}
                </span>
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/30">
              <span className="font-label-tag text-label-tag uppercase text-on-surface-variant">
                Projected Compliance
              </span>
              <div className="mt-1 flex items-baseline gap-space-xs">
                <span
                  className={`font-headline-lg text-headline-lg font-bold ${
                    parseFloat(simNewRate) >= 75 ? 'text-primary' : 'text-error'
                  }`}
                >
                  {simNewRate}%
                </span>
                <span className="font-label-tag text-label-tag text-on-surface-variant">
                  ({simDelta}% shift)
                </span>
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col justify-center">
              <span className="font-label-tag text-label-tag uppercase text-on-surface-variant">
                Advisory Output
              </span>
              <span className="font-body-sm text-body-sm text-tertiary mt-0.5 font-medium">
                Leaves safe buffer at strictly {simSafeRemaining} lecture(s).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Bar Metric Cards (4 Bento KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
              Cumulative Attendance
            </span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-display-hero text-display-hero text-primary tracking-tight font-semibold">
              86.8%
            </span>
            <span className="font-label-tag text-label-tag text-primary-container px-2 py-0.5 rounded-full bg-secondary-container">
              Optimal
            </span>
          </div>
          <p className="mt-space-2xs font-body-sm text-body-sm text-on-surface-variant">
            +11.8% over statutory 75.0% requirement
          </p>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
              Conducted Lectures
            </span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">
              event_available
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-display-hero text-on-surface font-semibold">
              242
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">total sessions</span>
          </div>
          <p className="mt-space-2xs font-body-sm text-body-sm text-on-surface-variant">
            210 sessions physically attended
          </p>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
              Total Missed
            </span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">
              event_busy
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-display-hero text-on-surface font-semibold">
              32
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">absences</span>
          </div>
          <p className="mt-space-2xs font-body-sm text-body-sm text-on-surface-variant">
            24 casual + 8 medical certified
          </p>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
              Statutory Buffer
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">
              security
            </span>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-display-hero text-primary font-semibold">
              +14
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">safe misses</span>
          </div>
          <p className="mt-space-2xs font-body-sm text-body-sm text-on-surface-variant">
            Zero risk of semester debarment
          </p>
        </div>
      </div>

      {/* Registered Academic Modules Table & Actions */}
      <section className="space-y-space-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Registered Academic Modules
          </h2>
          <span className="font-label-tag text-xs text-on-surface-variant">
            Statutory Threshold: 75.0%
          </span>
        </div>

        <div className="space-y-space-sm">
          {modules.map((m) => (
            <div
              key={m.code}
              className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-mono-wide text-xs text-primary font-semibold">
                    {m.code}
                  </span>
                  <h3 className="font-headline-sm text-body-lg text-on-surface font-semibold truncate">
                    {m.name}
                  </h3>
                  <span
                    className={`px-2 py-0.2 rounded-full font-label-tag text-[9px] uppercase font-semibold ${
                      m.status === 'Optimal'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-tertiary-container text-on-tertiary-container'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Instructor: {m.instructor} • {m.attended} of {m.conducted} sessions attended
                </p>

                {/* Progress Bar with 75% threshold marker */}
                <div className="relative pt-2">
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.rate >= 75 ? 'bg-primary' : 'bg-error'
                      }`}
                      style={{ width: `${m.rate}%` }}
                    />
                  </div>
                  {/* Marker line at 75% */}
                  <div
                    className="absolute top-1 bottom-0 w-0.5 bg-error/70 pointer-events-none"
                    style={{ left: '75%' }}
                    title="75% Minimum Statutory Limit"
                  />
                </div>
              </div>

              {/* Right: Rate & Action buttons */}
              <div className="flex items-center gap-space-md shrink-0">
                <div className="text-right">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    {m.rate}%
                  </div>
                  <span className="text-xs text-secondary font-label-mono-wide">
                    {m.safeMisses} safe misses left
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => logSession(m.code)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-button-text transition-colors"
                  >
                    + Log Present
                  </button>
                  <Link
                    href={`/subjects/${m.code}`}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-xs font-button-text font-semibold transition-colors"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
