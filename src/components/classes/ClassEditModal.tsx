'use client';

import React, { useState, useEffect } from 'react';
import { KnownSubjectItem } from '@/lib/timetableOcrService';

interface ClassEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editClassItem?: any | null; // If provided, we are editing; otherwise adding
  knownSubjects?: KnownSubjectItem[];
  defaultDay?: string;
}

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClassEditModal({
  isOpen,
  onClose,
  onSuccess,
  editClassItem = null,
  knownSubjects = [],
  defaultDay = 'Monday',
}: ClassEditModalProps) {
  const isEditing = Boolean(editClassItem?.id);

  const [day, setDay] = useState(defaultDay);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [type, setType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');
  const [section, setSection] = useState('');
  const [notes, setNotes] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editClassItem) {
      setDay(editClassItem.dayName || DAYS_LIST[editClassItem.dayOfWeek - 1] || 'Monday');
      setStartTime(editClassItem.startTime || '09:00 AM');
      setEndTime(editClassItem.endTime || '10:00 AM');
      setSubjectName(editClassItem.subjectName || editClassItem.subject?.name || '');
      setSubjectCode(editClassItem.subjectCode || editClassItem.subject?.code || '');
      setInstructor(editClassItem.instructor || editClassItem.subject?.instructor || '');
      setRoom(editClassItem.room || editClassItem.subject?.room || '');
      setType(editClassItem.type || 'Lecture');
      setSection(editClassItem.section || '');
      setNotes(editClassItem.notes || '');
      setSubjectId(editClassItem.subjectId || null);
    } else {
      setDay(defaultDay || 'Monday');
      setStartTime('09:00 AM');
      setEndTime('10:00 AM');
      setSubjectName('');
      setSubjectCode('');
      setInstructor('');
      setRoom('');
      setType('Lecture');
      setSection('');
      setNotes('');
      setSubjectId(null);
    }
    setError(null);
  }, [editClassItem, defaultDay, isOpen]);

  if (!isOpen) return null;

  const handleSelectSubject = (id: string) => {
    const sub = knownSubjects.find((s) => s.id === id);
    if (sub) {
      setSubjectId(sub.id);
      setSubjectName(sub.name);
      setSubjectCode(sub.code);
      if (sub.instructor && !instructor) setInstructor(sub.instructor);
      if (sub.room && !room) setRoom(sub.room);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() && !subjectCode.trim()) {
      setError('Please provide a subject name or subject code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const dayIndex = DAYS_LIST.indexOf(day) + 1;

    try {
      const payload = {
        dayOfWeek: dayIndex > 0 ? dayIndex : 1,
        dayName: day,
        startTime,
        endTime,
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim(),
        instructor: instructor.trim(),
        room: room.trim(),
        type,
        section: section.trim(),
        subjectId,
        notes: notes.trim(),
        needsReview: false,
      };

      const url = isEditing ? `/api/classes/${editClassItem.id}` : '/api/classes/manual';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save class.');
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving class:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editClassItem?.id) return;
    if (!confirm('Are you sure you want to delete this class from your timetable?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/classes/${editClassItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete class.');
        setIsDeleting(false);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Network error while deleting class.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-surface-container-low border border-outline-variant/40 p-5 sm:p-6 shadow-2xl space-y-4 my-auto text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              {isEditing ? 'edit_calendar' : 'add_circle'}
            </span>
            <h3 className="font-headline-sm text-on-surface font-semibold text-lg">
              {isEditing ? 'Edit Class Schedule' : 'Add Class to Timetable'}
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
          {/* Quick Subject Link Dropdown */}
          {knownSubjects.length > 0 && (
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Autofill from Your Subjects (Optional)
              </label>
              <select
                onChange={(e) => handleSelectSubject(e.target.value)}
                value={subjectId || ''}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              >
                <option value="">-- Choose an existing subject or type below --</option>
                {knownSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code ? `[${s.code}] ` : ''}{s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="CS301"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs font-mono"
              />
            </div>
          </div>

          {/* Day & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Day of Week *
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs font-medium"
              >
                {DAYS_LIST.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Class Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Start Time *
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                End Time *
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Instructor & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Faculty / Instructor
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Dr. K. Sharma"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Room / Hall / Lab
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Hall B-204"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Section & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Section / Batch
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Batch 1"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or instructions"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-2 rounded-xl bg-error/10 hover:bg-error/20 text-error text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>{isDeleting ? 'Deleting...' : 'Delete Class'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Class'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
