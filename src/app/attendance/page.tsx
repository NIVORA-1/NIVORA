'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  NormalizedAttendanceRecord,
  OverallAttendanceSummary,
  calculateAttendancePercentage,
} from '@/lib/attendance/attendance-types';
import ManualAttendanceModal from '@/components/attendance/ManualAttendanceModal';

export default function AttendancePage() {
  // Data State
  const [records, setRecords] = useState<NormalizedAttendanceRecord[]>([]);
  const [overall, setOverall] = useState<OverallAttendanceSummary | null>(null);
  const [unmatched, setUnmatched] = useState<NormalizedAttendanceRecord[]>([]);
  const [knownSubjects, setKnownSubjects] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedSession, setConnectedSession] = useState<any | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  // UI Flow State
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // Modals & Drawers
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editRecordData, setEditRecordData] = useState<any | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [mappingAttendanceId, setMappingAttendanceId] = useState<string | null>(null);
  const [selectedMappingSubjectId, setSelectedMappingSubjectId] = useState<string>('');

  // Login Modal Form State (for MyConnect)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [collegeUrl, setCollegeUrl] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Absence Sandbox State
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('');
  const [simMisses, setSimMisses] = useState<number>(2);

  // Load Real Attendance from Backend
  const loadAttendance = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setSyncErrorMessage(null);

    try {
      const res = await fetch('/api/attendance');
      if (!res.ok) {
        throw new Error('Failed to retrieve attendance records.');
      }

      const data = await res.json();
      setRecords(data.records || []);
      setOverall(data.overall || null);
      setUnmatched(data.unmatched || []);
      setKnownSubjects(data.knownSubjects || []);
      setIsConnected(data.connected || false);
      setActiveProvider(data.activeProvider || null);
      setConnectedSession(data.session || null);

      if (data.records && data.records.length > 0) {
        if (!selectedSubjectCode) {
          setSelectedSubjectCode(data.records[0].subjectCode);
        }
      }
    } catch (err: any) {
      console.error('[Attendance Page] Fetch error:', err);
      setSyncErrorMessage(err.message || 'Unable to load attendance records.');
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [selectedSubjectCode]);

  useEffect(() => {
    loadAttendance(true);
  }, [loadAttendance]);

  // Sync Attendance Handler
  const handleSyncAttendance = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncErrorMessage(null);

    try {
      const res = await fetch('/api/attendance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSyncStatus('error');
        setSyncErrorMessage(data.error || 'Unable to retrieve attendance from your connected source.');
        return;
      }

      setSyncStatus('success');
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      await loadAttendance();

      setTimeout(() => {
        setSyncStatus('idle');
      }, 3500);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncErrorMessage(err?.message || 'Network error occurred during attendance sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect MyConnect Account
  const handleConnectMyConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/attendance/myconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: loginUsername.trim(),
          password: loginPassword,
          collegeUrl: collegeUrl.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowConnectModal(false);
        setLoginPassword('');
        setIsConnected(true);
        // Sync attendance after connecting
        await handleSyncAttendance();
      } else {
        setLoginError(json.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Connection error. The ERP server is unreachable.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Disconnect MyConnect Account
  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect your connected college attendance account?')) return;
    try {
      await fetch('/api/attendance/myconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      setIsConnected(false);
      setConnectedSession(null);
      await loadAttendance();
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  };

  // Subject Mapping Confirmation
  const handleConfirmMapping = async (attendanceId: string) => {
    if (!selectedMappingSubjectId) {
      alert('Please select a subject to map.');
      return;
    }

    try {
      const res = await fetch('/api/attendance/map', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId,
          subjectId: selectedMappingSubjectId,
        }),
      });

      if (res.ok) {
        setMappingAttendanceId(null);
        setSelectedMappingSubjectId('');
        await loadAttendance();
      } else {
        alert('Failed to map subject.');
      }
    } catch (err) {
      console.error('Error mapping subject:', err);
      alert('Failed to map subject.');
    }
  };

  // Delete Attendance Record
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this attendance record?')) return;

    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadAttendance();
      } else {
        alert('Failed to delete attendance record.');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete attendance record.');
    }
  };

  // Format Date for Card
  const formatLastUpdated = (dateInput?: Date | string) => {
    if (!dateInput) return 'Not yet synced';
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateInput);
    }
  };

  // Active Subject for Sandbox Simulation
  const activeSimRecord = useMemo(() => {
    if (records.length === 0) return null;
    return records.find((r) => r.subjectCode === selectedSubjectCode) || records[0];
  }, [records, selectedSubjectCode]);

  const simResult = useMemo(() => {
    if (!activeSimRecord) return null;
    const currentAttended = activeSimRecord.attendedClasses;
    const currentTotal = activeSimRecord.totalClasses;
    const simulatedTotal = currentTotal + simMisses;
    const simulatedPercentage = calculateAttendancePercentage(currentAttended, simulatedTotal);
    const drop = (activeSimRecord.attendancePercentage - simulatedPercentage).toFixed(1);
    const safeRemaining = Math.max(0, Math.floor(currentAttended / 0.75 - simulatedTotal));

    return {
      simulatedPercentage,
      drop,
      safeRemaining,
      simulatedTotal,
    };
  }, [activeSimRecord, simMisses]);

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-xl pb-space-4xl animate-in fade-in duration-200">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-xs">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant/80 tracking-widest uppercase flex-wrap">
            <span>Academic Core</span>
            <span className="text-outline-variant/60">/</span>
            <span className="text-primary font-semibold">Real Attendance System</span>
            <span className="text-outline-variant/60">•</span>
            <span className="text-tertiary">Live Verified Cadence</span>
          </div>

          <div className="flex items-baseline gap-space-md flex-wrap">
            <h1 className="font-display-quote text-display-hero text-on-surface tracking-tight font-normal">
              Attendance
            </h1>

            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 font-label-tag text-label-tag uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Source Connected ({connectedSession?.studentName || activeProvider || 'ERP'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-label-tag text-label-tag uppercase tracking-widest px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-outline-variant" />
                <span>Provider Disconnected</span>
              </span>
            )}
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
            Real student attendance compliance, mathematical absence buffers, and statutory 75% thresholds computed strictly from verified records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-space-sm self-start md:self-end flex-wrap">
          {records.length > 0 && (
            <button
              onClick={() => setShowSandbox(!showSandbox)}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright transition-all text-xs font-semibold shadow-sm border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">model_training</span>
              <span>{showSandbox ? 'Close Sandbox' : 'Absence Simulator'}</span>
            </button>
          )}

          {/* Sync Attendance Button */}
          <button
            onClick={handleSyncAttendance}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-space-md py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm ${
              syncStatus === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : syncStatus === 'error'
                ? 'bg-error text-white'
                : 'bg-primary text-on-primary hover:bg-primary/90 shadow-primary/20'
            } disabled:opacity-50`}
            title={lastSyncedTime ? `Last synced at ${lastSyncedTime}` : 'Sync latest attendance'}
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>
              {isSyncing
                ? 'Syncing...'
                : syncStatus === 'success'
                ? 'Successfully synced!'
                : syncStatus === 'error'
                ? 'Sync failed'
                : 'Sync Attendance'}
            </span>
          </button>

          {/* Add Attendance Manually */}
          <button
            onClick={() => {
              setEditRecordData(null);
              setIsManualModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high text-xs font-semibold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Manually</span>
          </button>

          {/* Connect / Disconnect Provider */}
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-error text-xs font-medium border border-error/20 transition-colors"
              title="Disconnect college ERP source"
            >
              <span className="material-symbols-outlined text-[18px]">link_off</span>
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setLoginError(null);
                setShowConnectModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high text-xs font-semibold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">school</span>
              <span>Connect College ERP</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Status / Last Synced Banner ── */}
      {lastSyncedTime && (
        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Last synced: {lastSyncedTime}</span>
        </div>
      )}

      {/* ── Sync Error / Unavailable Notice ── */}
      {syncErrorMessage && (
        <div className="p-4 rounded-xl bg-error-container/40 border border-error/20 text-error flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div>
              <strong className="font-semibold block text-sm">Attendance data unavailable</strong>
              <span>{syncErrorMessage}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleSyncAttendance}
              className="px-3 py-1.5 rounded-lg bg-error text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setSyncErrorMessage(null);
                setIsManualModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
            >
              Add Manually
            </button>
          </div>
        </div>
      )}

      {/* ── LOADING SKELETON ── */}
      {isLoading && (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-spin">
            <span className="material-symbols-outlined text-[24px]">progress_activity</span>
          </div>
          <span className="text-body-sm text-on-surface-variant font-medium">
            Fetching your latest attendance...
          </span>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!isLoading && records.length === 0 && !syncErrorMessage && (
        <div className="p-10 sm:p-16 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[40px]">how_to_reg</span>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-on-surface">No attendance data yet</h2>
            <p className="text-body-md text-on-surface-variant">
              Connect your authorized college attendance source or add attendance manually.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSyncAttendance}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary/90 font-semibold text-sm transition-all shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
              <span>Sync Attendance</span>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      )}

      {/* ── REAL ATTENDANCE DATA VIEW ── */}
      {!isLoading && records.length > 0 && (
        <>
          {/* Section: Unmatched Attendance Banner (if any) */}
          {unmatched.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>Unmatched Attendance Records ({unmatched.length})</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                The following records were imported from your attendance source but did not automatically match an enrolled NIVORA subject. Link them below to integrate them into your syllabus view.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {unmatched.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-on-surface font-medium block">
                        {item.subjectCode}: {item.subjectName}
                      </strong>
                      <span className="text-on-surface-variant text-[11px]">
                        Present: {item.attendedClasses} / {item.totalClasses} ({item.attendancePercentage}%)
                      </span>
                    </div>

                    {mappingAttendanceId === item.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedMappingSubjectId}
                          onChange={(e) => setSelectedMappingSubjectId(e.target.value)}
                          className="px-2 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs"
                        >
                          <option value="">-- Choose Subject --</option>
                          {knownSubjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.code ? `${s.code} - ` : ''}
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleConfirmMapping(item.id!)}
                          className="px-2.5 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setMappingAttendanceId(null)}
                          className="text-on-surface-variant text-xs hover:text-on-surface"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setMappingAttendanceId(item.id!);
                          setSelectedMappingSubjectId('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors self-start sm:self-center"
                      >
                        Map Subject
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Overall Attendance Summary Card */}
          {overall && (
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-mono tracking-widest text-on-surface-variant">
                    Total Institutional Ledger
                  </span>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-4xl font-extrabold text-on-surface font-mono">
                      {overall.overallPercentage}%
                    </h2>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                        overall.status === 'Optimal'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : overall.status === 'Attention'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-error-container/40 text-error border border-error/20'
                      }`}
                    >
                      {overall.status} Compliance
                    </span>
                  </div>
                </div>

                {/* Overall Telemetry Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                    <span className="text-on-surface-variant block text-[10px] uppercase">Attended</span>
                    <span className="text-base font-bold text-on-surface">{overall.totalAttended}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                    <span className="text-on-surface-variant block text-[10px] uppercase">Total Held</span>
                    <span className="text-base font-bold text-on-surface">{overall.totalClasses}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                    <span className="text-on-surface-variant block text-[10px] uppercase">Safe Bunks</span>
                    <span className="text-base font-bold text-emerald-500">{overall.safeMisses}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                    <span className="text-on-surface-variant block text-[10px] uppercase">Classes to 75%</span>
                    <span className="text-base font-bold text-tertiary">{overall.classesRequiredFor75}</span>
                  </div>
                </div>
              </div>

              {/* Real Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      overall.overallPercentage >= 75
                        ? 'bg-emerald-500'
                        : overall.overallPercentage >= 65
                        ? 'bg-amber-500'
                        : 'bg-error'
                    }`}
                    style={{ width: `${Math.min(100, overall.overallPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                  <span>Threshold: 75.0%</span>
                  <span>Calculated from {overall.subjectsCount} enrolled subject{overall.subjectsCount === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Interactive Absence Simulator Sandbox */}
          {showSandbox && activeSimRecord && simResult && (
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-primary/30 shadow-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">science</span>
                  <h3 className="font-semibold text-sm text-on-surface">Absence Simulation Sandbox</h3>
                </div>
                <button
                  onClick={() => setShowSandbox(false)}
                  className="text-on-surface-variant hover:text-on-surface text-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-on-surface-variant font-medium">Select Subject</label>
                  <select
                    value={selectedSubjectCode}
                    onChange={(e) => setSelectedSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {records.map((r) => (
                      <option key={r.subjectCode} value={r.subjectCode}>
                        {r.subjectCode} - {r.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-on-surface-variant font-medium">
                    Simulate Consecutive Absences: <span className="font-mono font-bold text-primary">{simMisses}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={simMisses}
                    onChange={(e) => setSimMisses(parseInt(e.target.value, 10))}
                    className="w-full accent-primary mt-2"
                  />
                </div>

                {/* Simulated Outcome */}
                <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col justify-center font-mono">
                  <span className="text-[10px] text-on-surface-variant uppercase">Simulated Impact</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-on-surface">{simResult.simulatedPercentage}%</span>
                    <span className="text-error font-medium">(-{simResult.drop}%)</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">
                    Safe misses remaining: {simResult.safeRemaining}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Subject-wise Real Attendance Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-lg font-bold text-on-surface">Subject-wise Attendance</h3>
              <span className="text-xs font-mono text-on-surface-variant">
                {records.length} Subject{records.length === 1 ? '' : 's'} Tracked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((record) => {
                const isOptimal = record.attendancePercentage >= 75.0;
                const isAttention = record.attendancePercentage >= 65.0 && !isOptimal;

                return (
                  <div
                    key={record.id || record.subjectCode}
                    className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/40 transition-all space-y-4 shadow-sm"
                  >
                    {/* Top Row: Subject Code, Name & Source Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary text-xs tracking-wider">
                            {record.subjectCode}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                              record.source === 'manual'
                                ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            Source: {record.source === 'manual' ? 'Manual' : 'ERP Sync'}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-on-surface line-clamp-1">
                          {record.subjectName}
                        </h4>
                      </div>

                      {/* Percentage Badge */}
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono text-xl font-extrabold ${
                            isOptimal ? 'text-emerald-500' : isAttention ? 'text-amber-500' : 'text-error'
                          }`}
                        >
                          {record.attendancePercentage}%
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                          {isOptimal ? 'Eligible' : isAttention ? 'Buffer Low' : 'Critical'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOptimal ? 'bg-emerald-500' : isAttention ? 'bg-amber-500' : 'bg-error'
                        }`}
                        style={{ width: `${Math.min(100, record.attendancePercentage)}%` }}
                      />
                    </div>

                    {/* Statistics Row: Present / Total, Absent, Last Updated */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-outline-variant/10 text-xs">
                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono block">
                          Present / Total
                        </span>
                        <span className="font-mono font-semibold text-on-surface">
                          {record.attendedClasses} / {record.totalClasses}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono block">
                          Absent
                        </span>
                        <span className="font-mono font-semibold text-on-surface">
                          {record.absentClasses}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono block">
                          Last Updated
                        </span>
                        <span className="text-[11px] text-on-surface-variant truncate block font-mono">
                          {formatLastUpdated(record.lastUpdated)}
                        </span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-xs">
                      {record.matchedSubject ? (
                        <Link
                          href={`/subjects`}
                          className="text-primary hover:underline flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <span>Enrolled Subject Linked</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      ) : (
                        <span className="text-amber-500 text-[11px] font-medium">Unlinked subject</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditRecordData({
                              subjectId: record.subjectId,
                              subjectCode: record.subjectCode,
                              subjectName: record.subjectName,
                              attendedClasses: record.attendedClasses,
                              totalClasses: record.totalClasses,
                            });
                            setIsManualModalOpen(true);
                          }}
                          className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                          title="Edit Attendance"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => record.id && handleDeleteRecord(record.id)}
                          className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors"
                          title="Delete Record"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── MANUAL ATTENDANCE MODAL ── */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditRecordData(null);
        }}
        onSuccess={loadAttendance}
        knownSubjects={knownSubjects}
        initialData={editRecordData}
      />

      {/* ── CONNECT COLLEGE ERP / MYCONNECT MODAL ── */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">school</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Connect College Attendance</h3>
                  <p className="text-xs text-on-surface-variant">Authorize access to your official student portal</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConnectMyConnect} className="p-6 space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Student Username / PRN / Roll No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2023CSB042"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Portal Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter portal password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant pt-0.5">
                  Password is authenticated via secure TLS and never stored in the database.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">
                  ERP Gateway URL <span className="text-[10px] text-on-surface-variant font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://yourcollege.servergi.com:8071/CentralLoginAPIG6"
                  value={collegeUrl}
                  onChange={(e) => setCollegeUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>{loginSubmitting ? 'Authenticating...' : 'Connect & Sync'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
