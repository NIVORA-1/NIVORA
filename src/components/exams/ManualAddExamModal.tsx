'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { KnownSubjectItem } from '@/lib/examOcrService';

interface ManualAddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  knownSubjects?: KnownSubjectItem[];
}

export default function ManualAddExamModal({
  isOpen,
  onClose,
  onSuccess,
  knownSubjects = [],
}: ManualAddExamModalProps) {
  const [subjectId, setSubjectId] = useState<string>('');
  const [examType, setExamType] = useState<string>('Mid-Term');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:30 AM');
  const [endTime, setEndTime] = useState<string>('12:30 PM');
  const [room, setRoom] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!date) {
      setErrorMessage('Please select an examination date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subjectId || null,
          examType,
          date,
          startTime,
          endTime,
          room,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to schedule exam.');
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
      console.error('[Manual Exam Add] Error:', err);
      setErrorMessage(err?.message || 'Network error occurred while saving the exam.');
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
              <span className="material-symbols-outlined text-[22px]">event</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Add Examination</h2>
              <p className="text-xs text-on-surface-variant">
                Manually record an upcoming exam into your schedule
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

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
              <span>Subject</span>
              <span className="text-[10px] text-on-surface-variant font-normal">Optional if general test</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- General Examination / Unassigned --</option>
              {knownSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code ? `${sub.code} - ` : ''}
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Exam Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Mid-Term">Mid-Term</option>
                <option value="End-Term">End-Term</option>
                <option value="Quiz">Quiz / Unit Test</option>
                <option value="Practical">Practical Examination</option>
                <option value="Lab">Lab Assessment</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Timing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Start Time</label>
              <input
                type="text"
                placeholder="e.g. 09:30 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">End Time</label>
              <input
                type="text"
                placeholder="e.g. 12:30 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Room / Hall */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Room / Examination Hall</label>
            <input
              type="text"
              placeholder="e.g. Hall C, East Academic Block"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Notes / Syllabus Scope</label>
            <textarea
              rows={2}
              placeholder="e.g. Units 1–3, scientific calculator permitted"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
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
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{isSubmitting ? 'Saving...' : 'Save Exam'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
