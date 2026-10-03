'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import confetti from 'canvas-confetti';
import { ExtractedExamEntry, KnownSubjectItem } from '@/lib/examOcrService';

interface ExamUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  knownSubjects?: KnownSubjectItem[];
}

export default function ExamUploadModal({
  isOpen,
  onClose,
  onSuccess,
  knownSubjects = [],
}: ExamUploadModalProps) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review' | 'saving'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [entries, setEntries] = useState<ExtractedExamEntry[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<KnownSubjectItem[]>(knownSubjects);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setFilePreview(null);
    setIsPdf(false);
    setEntries([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.pdf'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    const isPdfFile = file.type === 'application/pdf' || lowerName.endsWith('.pdf');

    if (!file.type.startsWith('image/') && !isPdfFile && !hasValidExt) {
      setErrorMessage('Please upload a valid exam timetable image (JPG, PNG, WEBP, HEIC) or PDF document.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size is too large. Please upload a file under 20MB.');
      return;
    }

    setFileName(file.name);
    setIsPdf(isPdfFile);

    if (!isPdfFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    setStep('analyzing');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/exams/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to extract exam timetable. Please try a clearer image.');
        setStep('upload');
        return;
      }

      if (Array.isArray(data.knownSubjects) && data.knownSubjects.length > 0) {
        setAvailableSubjects(data.knownSubjects);
      }

      const extractedEntries: ExtractedExamEntry[] = data.entries || [];
      if (extractedEntries.length === 0) {
        setErrorMessage('No exams could be extracted from this document. Please check the timetable file.');
        setStep('upload');
        return;
      }

      setEntries(extractedEntries);
      setStep('review');
    } catch (err: any) {
      console.error('[Exam OCR Upload] Error:', err);
      setErrorMessage(err?.message || 'Network error occurred while analyzing the timetable.');
      setStep('upload');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUpdateEntry = (index: number, updates: Partial<ExtractedExamEntry>) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleSelectSubject = (index: number, subjectId: string) => {
    const selected = availableSubjects.find((s) => s.id === subjectId);
    if (selected) {
      handleUpdateEntry(index, {
        matchedSubjectId: selected.id,
        matchedSubjectName: selected.name,
        subjectName: selected.name,
        subjectCode: selected.code || '',
        subjectMatched: true,
      });
    } else {
      handleUpdateEntry(index, {
        matchedSubjectId: null,
        matchedSubjectName: null,
        subjectMatched: false,
      });
    }
  };

  const handleDeleteEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBlankRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: ExtractedExamEntry = {
      id: `manual-entry-${Date.now()}`,
      subjectCode: '',
      subjectName: '',
      examType: 'Mid-Term',
      date: today,
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      room: '',
      notes: '',
      subjectMatched: false,
      matchedSubjectId: null,
      matchedSubjectName: null,
      confidence: 1.0,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleConfirmSave = async () => {
    if (entries.length === 0) return;

    setStep('saving');
    setErrorMessage(null);

    try {
      const payload = {
        entries: entries.map((entry) => ({
          subjectCode: entry.subjectCode,
          subjectName: entry.subjectName,
          examType: entry.examType,
          date: entry.date,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room,
          notes: entry.notes,
          subjectId: entry.matchedSubjectId || null,
        })),
        mode,
      };

      const res = await fetch('/api/exams/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to save confirmed exams.');
        setStep('review');
        return;
      }

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[Exam Confirm] Error:', err);
      setErrorMessage(err?.message || 'Failed to save exams. Please try again.');
      setStep('review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">upload_file</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                Import Exam Timetable
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  AI OCR Vision
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant">
                Upload your exam schedule screenshot or PDF. Extracted exams match with your subjects.
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

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-error-container/40 border border-error/20 flex items-start gap-3 text-error">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="text-xs flex-1">
              <strong className="font-semibold block">Import Notice</strong>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-error hover:opacity-75"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Body content based on step */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                  dragActive
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : 'border-outline-variant/40 hover:border-primary/60 bg-surface-container/30 hover:bg-surface-container/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined text-[32px]">document_scanner</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-on-surface">
                    Drop your exam timetable here, or <span className="text-primary hover:underline">browse files</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-md">
                    Supports high-resolution camera photos, official timetable PDFs, and portal screenshots.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-[11px] font-mono text-on-surface-variant border border-outline-variant/20">
                    PNG
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-[11px] font-mono text-on-surface-variant border border-outline-variant/20">
                    JPG / JPEG
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-[11px] font-mono text-on-surface-variant border border-outline-variant/20">
                    PDF
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-[11px] font-mono text-on-surface-variant border border-outline-variant/20">
                    WEBP
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-[11px] font-mono text-on-surface-variant border border-outline-variant/20">
                    Max 20MB
                  </span>
                </div>
              </div>

              {/* Guidelines */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">verified</span>
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">Automatic Extraction</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Detects subject code, exam dates, slots, rooms, and exam type.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">link</span>
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">Subject Linking</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Auto-matched with your enrolled subjects without inventing fake ones.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">edit_calendar</span>
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">Preview & Review</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Review all dates and slots before anything is saved to your calendar.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Analyzing */}
          {step === 'analyzing' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-surface-container border border-primary/40 flex items-center justify-center text-primary shadow-xl">
                  <span className="material-symbols-outlined text-[36px] animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-on-surface">Reading Exam Timetable...</h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Gemini OCR is analyzing dates, session timings, and matching subjects against your syllabus.
                </p>
              </div>
              <div className="w-48 h-1.5 rounded-full bg-surface-container overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Edit */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                    Review Extracted Exams
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono">
                      {entries.length} Exam{entries.length === 1 ? '' : 's'} Detected
                    </span>
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Verify each subject, exam type, date, and room. Adjust any unmatched subjects before saving.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddBlankRow}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-medium border border-outline-variant/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Exam
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Re-upload
                  </button>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-3">
                {entries.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      !entry.subjectMatched
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-surface-container border-outline-variant/20'
                    }`}
                  >
                    {/* Top status bar of card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-outline-variant/10">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-mono flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {entry.subjectMatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Matched: {entry.matchedSubjectName || entry.subjectName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Subject not matched
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteEntry(idx)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1 rounded"
                        title="Remove this exam"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                      {/* Subject Selection (Col 1-5) */}
                      <div className="md:col-span-5 space-y-1">
                        <label className="font-medium text-on-surface-variant flex items-center justify-between">
                          <span>Subject</span>
                          {!entry.subjectMatched && (
                            <span className="text-[10px] text-amber-500 font-semibold">Select existing subject</span>
                          )}
                        </label>
                        <select
                          value={entry.matchedSubjectId || ''}
                          onChange={(e) => handleSelectSubject(idx, e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg bg-surface-container-low border text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary ${
                            !entry.subjectMatched ? 'border-amber-500/40 bg-amber-500/5' : 'border-outline-variant/30'
                          }`}
                        >
                          <option value="">
                            {entry.subjectName
                              ? `Detected: "${entry.subjectName}" (Choose existing subject)`
                              : '-- Select an existing subject --'}
                          </option>
                          {availableSubjects.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.code ? `${sub.code} - ` : ''}
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Exam Type (Col 6-7) */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="font-medium text-on-surface-variant">Exam Type</label>
                        <select
                          value={entry.examType}
                          onChange={(e) => handleUpdateEntry(idx, { examType: e.target.value as any })}
                          className="w-full px-2.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="Mid-Term">Mid-Term</option>
                          <option value="End-Term">End-Term</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Practical">Practical</option>
                          <option value="Lab">Lab</option>
                        </select>
                      </div>

                      {/* Date (Col 8-10) */}
                      <div className="md:col-span-3 space-y-1">
                        <label className="font-medium text-on-surface-variant">Date</label>
                        <input
                          type="date"
                          value={entry.date}
                          onChange={(e) => handleUpdateEntry(idx, { date: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        />
                      </div>

                      {/* Room (Col 11-12) */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="font-medium text-on-surface-variant">Room / Hall</label>
                        <input
                          type="text"
                          value={entry.room || ''}
                          placeholder="e.g. Hall C"
                          onChange={(e) => handleUpdateEntry(idx, { room: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Row 2: Timing & Notes */}
                      <div className="md:col-span-3 space-y-1">
                        <label className="font-medium text-on-surface-variant">Start Time</label>
                        <input
                          type="text"
                          value={entry.startTime || ''}
                          placeholder="e.g. 09:30 AM"
                          onChange={(e) => handleUpdateEntry(idx, { startTime: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <label className="font-medium text-on-surface-variant">End Time</label>
                        <input
                          type="text"
                          value={entry.endTime || ''}
                          placeholder="e.g. 12:30 PM"
                          onChange={(e) => handleUpdateEntry(idx, { endTime: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        />
                      </div>

                      <div className="md:col-span-6 space-y-1">
                        <label className="font-medium text-on-surface-variant">Notes / Instructions</label>
                        <input
                          type="text"
                          value={entry.notes || ''}
                          placeholder="e.g. Calculators allowed, closed book"
                          onChange={(e) => handleUpdateEntry(idx, { notes: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode Toggle */}
              <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-on-surface-variant">
                  Import Action:
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-on-surface">
                    <input
                      type="radio"
                      name="saveMode"
                      value="append"
                      checked={mode === 'append'}
                      onChange={() => setMode('append')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Add to existing schedule</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-on-surface">
                    <input
                      type="radio"
                      name="saveMode"
                      value="replace"
                      checked={mode === 'replace'}
                      onChange={() => setMode('replace')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Replace all scheduled exams</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Saving */}
          {step === 'saving' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-spin">
                <span className="material-symbols-outlined text-[24px]">progress_activity</span>
              </div>
              <h3 className="text-base font-semibold text-on-surface">Saving your exam schedule...</h3>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>

          {step === 'review' && (
            <button
              onClick={handleConfirmSave}
              disabled={entries.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-semibold text-xs shadow-md shadow-primary/20 disabled:opacity-50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              <span>Confirm & Save {entries.length} Exam{entries.length === 1 ? '' : 's'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
