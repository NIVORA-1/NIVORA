'use client';

import React, { useState } from 'react';

interface CourseMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unmappedCourses: Array<{ id: string; googleCourseId: string; name: string }>;
  subjects: Array<{ id: string; name: string; code: string }>;
}

export default function CourseMappingModal({
  isOpen,
  onClose,
  onSuccess,
  unmappedCourses,
  subjects,
}: CourseMappingModalProps) {
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || unmappedCourses.length === 0) return null;

  const currentCourse = unmappedCourses[selectedCourseIndex] || unmappedCourses[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        googleCourseId: currentCourse.googleCourseId,
      };

      if (isCreatingNew) {
        if (!newSubjectName.trim()) {
          setError('Please provide a subject name.');
          setIsSubmitting(false);
          return;
        }
        payload.createNewSubject = true;
        payload.subjectName = newSubjectName.trim();
        payload.subjectCode = newSubjectCode.trim() || newSubjectName.slice(0, 6).toUpperCase();
      } else {
        if (!selectedSubjectId) {
          setError('Please select a NIVORA Subject from the list.');
          setIsSubmitting(false);
          return;
        }
        payload.subjectId = selectedSubjectId;
      }

      const res = await fetch('/api/classroom/map-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to map course.');
        setIsSubmitting(false);
        return;
      }

      // If more unmapped courses remain, advance to next
      if (selectedCourseIndex < unmappedCourses.length - 1) {
        setSelectedCourseIndex((prev) => prev + 1);
        setSelectedSubjectId('');
        setIsCreatingNew(false);
        setNewSubjectName('');
        setNewSubjectCode('');
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Course mapping error:', err);
      setError('Network error while saving mapping.');
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
            <span className="material-symbols-outlined text-primary text-[22px]">link</span>
            <div>
              <h3 className="font-headline-sm text-on-surface font-semibold text-base sm:text-lg">
                Link Google Classroom Course
              </h3>
              <p className="text-[11px] text-on-surface-variant font-label-mono-wide">
                Course {selectedCourseIndex + 1} of {unmappedCourses.length}
              </p>
            </div>
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

        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-1">
          <span className="text-[10px] text-on-surface-variant uppercase font-label-tag">
            Google Classroom Course Found:
          </span>
          <h4 className="font-headline-md font-semibold text-on-surface text-base">
            {currentCourse.name}
          </h4>
          <p className="text-[11px] text-on-surface-variant">
            Connect this course to a NIVORA Subject so imported assignments appear under your course roster.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors text-xs ${
                !isCreatingNew
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Select Existing Subject
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(true);
                if (!newSubjectName) setNewSubjectName(currentCourse.name);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors text-xs ${
                isCreatingNew
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              + Create New Subject
            </button>
          </div>

          {!isCreatingNew ? (
            <div>
              <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                Choose Corresponding NIVORA Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
              >
                <option value="">-- Select a subject --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                  New Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-on-surface-variant font-label-tag uppercase block mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  placeholder="e.g. CS301"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs font-mono"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-button-text transition-colors"
            >
              Skip For Now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-button-text font-semibold flex items-center gap-1 shadow-md transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>{isSubmitting ? 'Saving...' : 'Save Mapping'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
