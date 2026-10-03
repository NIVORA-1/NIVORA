'use client';

import React, { useState } from 'react';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Array<{ id: string; name: string; code: string }>;
}

export default function AddAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
}: AddAssignmentModalProps) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('11:59 PM');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL'>('NORMAL');
  const [description, setDescription] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an assignment title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedSubject = subjects.find((s) => s.id === subjectId);

      let deadlineIso: string | null = null;
      if (dueDate) {
        deadlineIso = new Date(`${dueDate}T23:59:59`).toISOString();
      }

      const payload = {
        title: title.trim(),
        subjectId: subjectId || null,
        code: selectedSubject?.code || 'ASG',
        description: description.trim(),
        deadline: deadlineIso,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        priority,
        maxScore: parseFloat(maxScore) || 100,
        source: 'manual',
      };

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create assignment.');
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Create assignment error:', err);
      setError('Network error while saving assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 p-5 sm:p-6 shadow-2xl space-y-4 my-auto text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">add_task</span>
            <h3 className="font-headline-sm text-on-surface font-semibold text-base sm:text-lg">
              Add Manual Assignment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DBMS Assignment 03: Normalization"
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              >
                <option value="NORMAL">Normal</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Due Time
              </label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="11:59 PM"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
              Instructions / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe requirements or questions..."
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
            />
          </div>

          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-button-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-button-text font-semibold flex items-center gap-1 shadow-md transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{isSubmitting ? 'Saving...' : 'Add Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
