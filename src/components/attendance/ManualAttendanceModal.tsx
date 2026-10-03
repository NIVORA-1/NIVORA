'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { calculateAttendancePercentage } from '@/lib/attendance/attendance-types';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  knownSubjects?: Array<{ id: string; name: string; code: string }>;
  initialData?: {
    id?: string;
    subjectId?: string | null;
    subjectCode?: string;
    subjectName?: string;
    attendedClasses?: number;
    totalClasses?: number;
  };
}

export default function ManualAttendanceModal({
  isOpen,
  onClose,
  onSuccess,
  knownSubjects = [],
  initialData,
}: ManualAttendanceModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialData?.subjectId || '');
  const [subjectCode, setSubjectCode] = useState<string>(initialData?.subjectCode || '');
  const [subjectName, setSubjectName] = useState<string>(initialData?.subjectName || '');
  const [attendedClasses, setAttendedClasses] = useState<number | ''>(
    initialData?.attendedClasses !== undefined ? initialData.attendedClasses : ''
  );
  const [totalClasses, setTotalClasses] = useState<number | ''>(
    initialData?.totalClasses !== undefined ? initialData.totalClasses : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubjectSelect = (id: string) => {
    setSelectedSubjectId(id);
    const sub = knownSubjects.find((s) => s.id === id);
    if (sub) {
      setSubjectCode(sub.code || '');
      setSubjectName(sub.name || '');
    }
  };

  const attendedNum = typeof attendedClasses === 'number' ? attendedClasses : 0;
  const totalNum = typeof totalClasses === 'number' ? totalClasses : 0;
  const absentNum = Math.max(0, totalNum - attendedNum);
  const previewPercentage = calculateAttendancePercentage(attendedNum, totalNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalCode = (subjectCode || subjectName).trim();
    const finalName = (subjectName || subjectCode).trim();

    if (!finalCode && !finalName) {
      setErrorMessage('Please enter a subject code or name.');
      return;
    }

    if (totalNum <= 0) {
      setErrorMessage('Total classes must be greater than 0.');
      return;
    }

    if (attendedNum > totalNum) {
      setErrorMessage('Attended classes cannot exceed total classes.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId || null,
          subjectCode: finalCode,
          subjectName: finalName,
          attendedClasses: attendedNum,
          totalClasses: totalNum,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to save attendance record.');
        setIsSubmitting(false);
        return;
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[Manual Attendance] Error:', err);
      setErrorMessage(err?.message || 'Network error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Record Attendance Manually</h2>
              <p className="text-xs text-on-surface-variant">
                Log verified attendance numbers for your enrolled subjects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Select from Enrolled Subjects */}
          {knownSubjects.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Select Enrolled Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose from your enrolled subjects --</option>
                {knownSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code ? `${sub.code} - ` : ''}
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Subject Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-semibold text-on-surface">Subject Code *</label>
              <input
                type="text"
                placeholder="e.g. CS-301"
                required
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-on-surface">Subject Name *</label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Attended & Total Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Attended / Present *</label>
              <input
                type="number"
                min="0"
                required
                placeholder="0"
                value={attendedClasses}
                onChange={(e) =>
                  setAttendedClasses(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))
                }
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Total Classes *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="0"
                value={totalClasses}
                onChange={(e) =>
                  setTotalClasses(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))
                }
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Live Calculated Telemetry Preview */}
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Calculated Percentage:</span>
              <span
                className={`font-bold font-mono text-sm ${
                  previewPercentage >= 75
                    ? 'text-emerald-500'
                    : previewPercentage >= 65
                    ? 'text-amber-500'
                    : 'text-error'
                }`}
              >
                {previewPercentage}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>Absent Classes: {absentNum}</span>
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                Source: Manual
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>{isSubmitting ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
