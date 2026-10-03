'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import confetti from 'canvas-confetti';
import { ExtractedClassEntry, KnownSubjectItem } from '@/lib/timetableOcrService';

interface TimetableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingCount?: number;
  knownSubjects?: KnownSubjectItem[];
}

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const OCR_FAILURE_MSG = "We couldn't read this timetable. Please upload a clearer image or PDF.";

export default function TimetableUploadModal({
  isOpen,
  onClose,
  onSuccess,
  existingCount = 0,
  knownSubjects = [],
}: TimetableUploadModalProps) {
  // Steps: 'upload' | 'analyzing' | 'review' | 'saving'
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review' | 'saving'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPdfFile, setIsPdfFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [entries, setEntries] = useState<ExtractedClassEntry[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<KnownSubjectItem[]>(knownSubjects);
  const [selectedDayTab, setSelectedDayTab] = useState<string>('Monday');
  const [replaceMode, setReplaceMode] = useState<'replace' | 'merge'>('replace');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setImagePreview(null);
    setIsPdfFile(false);
    setUploadedFile(null);
    setEntries([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    // Validate mime type or extension
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');

    if (!file.type.startsWith('image/') && !isPdf && !hasValidExt) {
      setErrorMessage('Please upload a valid timetable file (PDF, JPG, PNG, WEBP, or HEIC).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size is too large. Please upload a file under 15MB.');
      return;
    }

    setUploadedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setIsPdfFile(isPdf);

    // Handle preview
    if (isPdf) {
      setImagePreview(null);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    setStep('analyzing');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/classes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const errorText = data?.error || OCR_FAILURE_MSG;
        setErrorMessage(errorText);
        setStep('upload');
        return;
      }

      if (Array.isArray(data.knownSubjects) && data.knownSubjects.length > 0) {
        setAvailableSubjects(data.knownSubjects);
      }

      const extractedEntries: ExtractedClassEntry[] = data.entries || [];

      if (extractedEntries.length === 0) {
        setErrorMessage(OCR_FAILURE_MSG);
        setStep('upload');
        return;
      }

      setEntries(extractedEntries);

      // Default selected tab to first day that has entries
      const firstActiveDay = DAYS_LIST.find((d) => extractedEntries.some((e) => e.day === d)) || 'Monday';
      setSelectedDayTab(firstActiveDay);

      setStep('review');
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(OCR_FAILURE_MSG);
      setStep('upload');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Entry modification functions
  const handleUpdateEntry = (id: string, field: keyof ExtractedClassEntry, value: any) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updated = { ...entry, [field]: value };

        // If user manually edited a flagged field, clear needsReview or update
        if (field === 'subject' || field === 'startTime' || field === 'endTime') {
          if (updated.needsReview && (!updated.reviewReason || updated.reviewReason.includes(field))) {
            updated.needsReview = false;
            updated.reviewReason = null;
          }
        }

        // If day changed, also update dayOfWeek
        if (field === 'day') {
          const dayIndex = DAYS_LIST.indexOf(value) + 1;
          if (dayIndex > 0) updated.dayOfWeek = dayIndex;
        }

        // If subject changed, check against availableSubjects
        if (field === 'subject') {
          const match = availableSubjects.find(
            (s) =>
              s.name.toLowerCase() === String(value).toLowerCase() ||
              s.code.toLowerCase() === String(value).toLowerCase()
          );
          if (match) {
            updated.matchedSubjectId = match.id;
            updated.matchedSubjectName = match.name;
            if (!updated.subjectCode) updated.subjectCode = match.code;
          } else {
            updated.matchedSubjectId = null;
            updated.matchedSubjectName = null;
          }
        }

        return updated;
      })
    );
  };

  const handleLinkSubject = (entryId: string, subject: KnownSubjectItem) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          subject: subject.name,
          subjectCode: subject.code,
          matchedSubjectId: subject.id,
          matchedSubjectName: subject.name,
          suggestedSubject: null,
          needsReview: false,
          reviewReason: null,
        };
      })
    );
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddEntryForDay = (day: string) => {
    const dayOfWeek = DAYS_LIST.indexOf(day) + 1;
    const newEntry: ExtractedClassEntry = {
      id: `manual-entry-${Date.now()}`,
      day,
      dayOfWeek: dayOfWeek > 0 ? dayOfWeek : 1,
      startTime: '09:00',
      endTime: '10:00',
      start_time: '09:00',
      end_time: '10:00',
      subject: '',
      subjectCode: '',
      faculty: '',
      room: '',
      classType: 'Lecture',
      type: 'LECTURE',
      section: '',
      needsReview: false,
      confidence: 1.0,
      matchedSubjectId: null,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleConfirmAndSave = async () => {
    if (entries.length === 0) {
      setErrorMessage('Please ensure there is at least one class entry to save.');
      return;
    }

    setStep('saving');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/classes/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries,
          mode: replaceMode,
          fileName,
          fileSize,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to save timetable schedule.');
        setStep('review');
        return;
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage('Failed to connect to server. Please try again.');
      setStep('review');
    }
  };

  const currentDayEntries = entries.filter((e) => e.day === selectedDayTab);
  const totalNeedsReviewCount = entries.filter((e) => e.needsReview).length;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={step === 'analyzing' || step === 'saving' ? undefined : onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-surface-container-low border border-outline-variant/40 p-4 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col overflow-hidden text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-on-surface font-semibold">
                  {step === 'upload' && 'Import Timetable'}
                  {step === 'analyzing' && 'Analyzing Timetable...'}
                  {step === 'review' && 'Preview & Review Timetable'}
                  {step === 'saving' && 'Saving Your Timetable...'}
                </h2>
                {step === 'review' && totalNeedsReviewCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-label-tag text-[10px] border border-amber-500/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">warning</span>
                    <span>{totalNeedsReviewCount} Needs Review</span>
                  </span>
                )}
              </div>
              <p className="font-body-sm text-on-surface-variant text-xs">
                {step === 'upload' &&
                  'Upload your college timetable as PDF, mobile screenshot, or photo to automatically generate your schedule.'}
                {step === 'analyzing' &&
                  'Self-hosted OCR engine is scanning time slots, subjects, instructors, and rooms.'}
                {step === 'review' &&
                  'Verify extracted classes, correct any uncertain cells, and confirm before saving.'}
                {step === 'saving' && 'Finalizing your classes and linking to your student schedule.'}
              </p>
            </div>
          </div>

          {step !== 'analyzing' && step !== 'saving' && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-start gap-2.5 flex-1">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <p className="font-medium">{errorMessage}</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {uploadedFile && (
                <button
                  type="button"
                  onClick={() => processFile(uploadedFile)}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Retry OCR</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="hover:opacity-75 p-1"
                aria-label="Dismiss error"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Upload Dropzone Screen */}
        {step === 'upload' && (
          <div className="space-y-5 overflow-y-auto py-2">
            {uploadedFile && (
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-outline-variant/40 shrink-0 bg-black/20 flex items-center justify-center">
                    {isPdfFile ? (
                      <span className="material-symbols-outlined text-[32px] text-error">picture_as_pdf</span>
                    ) : imagePreview ? (
                      <img src={imagePreview} alt="Uploaded Timetable" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[32px] text-primary">image</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-on-surface truncate max-w-xs">{fileName}</p>
                    <p className="text-[11px] text-on-surface-variant font-label-mono-wide">
                      {(fileSize / 1024).toFixed(1)} KB • {isPdfFile ? 'PDF Document' : 'Image'}
                    </p>
                    <p className="text-[11px] text-primary font-medium mt-0.5">Ready to process with PaddleOCR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Choose Different File
                  </button>
                  <button
                    type="button"
                    onClick={() => processFile(uploadedFile)}
                    className="px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Retry Extraction</span>
                  </button>
                </div>
              </div>
            )}

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                dragActive
                  ? 'border-primary bg-primary/10 scale-[0.99]'
                  : 'border-outline-variant/40 hover:border-primary/60 hover:bg-surface-container-high/40 bg-surface-container-low'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf, application/pdf, image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif, .heic, .heif"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-20 h-20 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined text-[44px]">upload_file</span>
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="font-headline-sm text-on-surface font-semibold text-base sm:text-lg">
                  Drop your timetable PDF or image here, or <span className="text-primary underline">browse</span>
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Supports PDF timetables, screenshots, camera photos of printed sheets, JPG, PNG, &amp; WEBP.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-on-surface-variant font-label-mono-wide flex-wrap justify-center">
                <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30">
                  📑 PDF Timetable
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30">
                  📱 Screenshot
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30">
                  📷 Printed Photo
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30">
                  ⚡ 100% Free Self-Hosted OCR
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/20 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px]">document_scanner</span>
                <div>
                  <h4 className="font-semibold text-on-surface">Automatic Extraction</h4>
                  <p className="text-on-surface-variant text-[11px]">
                    Reads days, times, subject codes, faculty, and room numbers.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/20 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                <div>
                  <h4 className="font-semibold text-on-surface">Preview &amp; Edit First</h4>
                  <p className="text-on-surface-variant text-[11px]">
                    Review, edit, add, or delete entries before saving to your schedule.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/20 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-tertiary text-[18px]">lock</span>
                <div>
                  <h4 className="font-semibold text-on-surface">Private &amp; Self-Hosted</h4>
                  <p className="text-on-surface-variant text-[11px]">
                    Processed securely on-premises without paid external OCR APIs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Analyzing Loading Screen */}
        {step === 'analyzing' && (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px] animate-pulse">document_scanner</span>
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="font-headline-sm text-on-surface font-semibold text-lg">
                Extracting Timetable Schedule...
              </h3>
              <p className="text-xs text-on-surface-variant">
                Parsing table rows, time intervals, course codes, faculty names, and classrooms from{' '}
                <span className="text-on-surface font-medium">{fileName || 'your timetable'}</span>.
              </p>
            </div>

            <div className="w-full max-w-xs h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* STEP 3: Preview & Review Screen */}
        {step === 'review' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-hidden">
            {/* Action Subheader */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              {/* Day Selection Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-xs">
                {DAYS_LIST.map((day) => {
                  const count = entries.filter((e) => e.day === day).length;
                  const dayHasReview = entries.some((e) => e.day === day && e.needsReview);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayTab(day)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        selectedDayTab === day
                          ? 'bg-primary text-on-primary font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-label-mono-wide ${
                          selectedDayTab === day
                            ? 'bg-on-primary/20 text-on-primary'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {count}
                      </span>
                      {dayHasReview && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Contains entries needing review" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add Entry + Re-upload Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddEntryForDay(selectedDayTab)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-primary flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Class to {selectedDayTab.slice(0, 3)}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  <span>Upload Another</span>
                </button>
              </div>
            </div>

            {/* Editable Entries Table Container */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface-container/20 divide-y divide-outline-variant/20 p-2 sm:p-3 space-y-3">
              {currentDayEntries.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">event_busy</span>
                  <p className="text-xs text-on-surface-variant">No classes scheduled for {selectedDayTab}.</p>
                  <button
                    onClick={() => handleAddEntryForDay(selectedDayTab)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                  >
                    + Add a Class for {selectedDayTab}
                  </button>
                </div>
              ) : (
                currentDayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                      entry.needsReview
                        ? 'border-amber-500/60 bg-amber-500/10'
                        : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/60'
                    }`}
                  >
                    {/* Header Row: Review Warning + Actions */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        {entry.needsReview ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-label-tag text-[10px] border border-amber-500/40 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            <span>Needs review: {entry.reviewReason || 'Please verify details'}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-label-tag text-[10px] border border-emerald-500/30 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            <span>Confidence: {Math.round(entry.confidence * 100)}%</span>
                          </span>
                        )}

                        {entry.matchedSubjectId && (
                          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-label-tag text-[10px] border border-primary/30 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">link</span>
                            <span>Matched existing subject: {entry.matchedSubjectName || 'Course'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete this class"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                      {/* Time Slots */}
                      <div className="sm:col-span-3 flex items-center gap-1">
                        <div className="flex-1">
                          <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">Start</label>
                          <input
                            type="text"
                            value={entry.startTime}
                            onChange={(e) => handleUpdateEntry(entry.id, 'startTime', e.target.value)}
                            placeholder="09:00"
                            className={`w-full px-2 py-1.5 rounded-lg bg-surface-container border text-on-surface focus:border-primary text-xs ${
                              entry.needsReview && (!entry.startTime || entry.startTime === '09:00')
                                ? 'border-amber-500'
                                : 'border-outline-variant/30'
                            }`}
                          />
                        </div>
                        <span className="pt-4 text-on-surface-variant font-bold">–</span>
                        <div className="flex-1">
                          <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">End</label>
                          <input
                            type="text"
                            value={entry.endTime}
                            onChange={(e) => handleUpdateEntry(entry.id, 'endTime', e.target.value)}
                            placeholder="10:00"
                            className={`w-full px-2 py-1.5 rounded-lg bg-surface-container border text-on-surface focus:border-primary text-xs ${
                              entry.needsReview && (!entry.endTime || entry.endTime === '10:00')
                                ? 'border-amber-500'
                                : 'border-outline-variant/30'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Subject Name & Select/Link */}
                      <div className="sm:col-span-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">
                            Subject Name
                          </label>
                          {availableSubjects.length > 0 && (
                            <select
                              onChange={(e) => {
                                const selected = availableSubjects.find((s) => s.id === e.target.value);
                                if (selected) handleLinkSubject(entry.id, selected);
                              }}
                              className="text-[9px] bg-transparent text-primary hover:underline cursor-pointer border-none outline-none"
                              defaultValue=""
                            >
                              <option value="" disabled>Link existing...</option>
                              {availableSubjects.map((s) => (
                                <option key={s.id} value={s.id} className="bg-surface-container text-on-surface">
                                  {s.code ? `[${s.code}] ` : ''}{s.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <input
                          type="text"
                          value={entry.subject}
                          onChange={(e) => handleUpdateEntry(entry.id, 'subject', e.target.value)}
                          placeholder="e.g. Data Structures"
                          className={`w-full px-2.5 py-1.5 rounded-lg bg-surface-container border text-on-surface focus:border-primary text-xs font-medium ${
                            entry.needsReview && (!entry.subject || entry.subject === 'Unassigned Subject')
                              ? 'border-amber-500'
                              : 'border-outline-variant/30'
                          }`}
                        />
                      </div>

                      {/* Code */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">Code</label>
                        <input
                          type="text"
                          value={entry.subjectCode}
                          onChange={(e) => handleUpdateEntry(entry.id, 'subjectCode', e.target.value)}
                          placeholder="CS201"
                          className="w-full px-2 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs font-mono"
                        />
                      </div>

                      {/* Class Type */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">Type</label>
                        <select
                          value={entry.classType}
                          onChange={(e) => handleUpdateEntry(entry.id, 'classType', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
                        >
                          <option value="Lecture">Lecture</option>
                          <option value="Lab">Lab</option>
                          <option value="Tutorial">Tutorial</option>
                        </select>
                      </div>

                      {/* Faculty / Instructor */}
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">Faculty / Teacher</label>
                        <input
                          type="text"
                          value={entry.faculty || ''}
                          onChange={(e) => handleUpdateEntry(entry.id, 'faculty', e.target.value)}
                          placeholder="Faculty Name"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
                        />
                      </div>

                      {/* Room */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">Room / Classroom</label>
                        <input
                          type="text"
                          value={entry.room || ''}
                          onChange={(e) => handleUpdateEntry(entry.id, 'room', e.target.value)}
                          placeholder="Room 204"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
                        />
                      </div>

                      {/* Section */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">Batch / Div</label>
                        <input
                          type="text"
                          value={entry.section || ''}
                          onChange={(e) => handleUpdateEntry(entry.id, 'section', e.target.value)}
                          placeholder="Batch A"
                          className="w-full px-2 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
                        />
                      </div>

                      {/* Day Selector */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-on-surface-variant font-label-tag uppercase">Day</label>
                        <select
                          value={entry.day}
                          onChange={(e) => handleUpdateEntry(entry.id, 'day', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary text-xs"
                        >
                          {DAYS_LIST.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Suggested Subject Match Banner */}
                    {entry.suggestedSubject && !entry.matchedSubjectId && (
                      <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-between text-xs">
                        <span className="text-secondary-fixed text-[11px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                          <span>Suggested match: <strong>{entry.suggestedSubject.name}</strong> ({entry.suggestedSubject.code})</span>
                        </span>
                        <button
                          onClick={() => handleLinkSubject(entry.id, entry.suggestedSubject as KnownSubjectItem)}
                          className="px-2 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-semibold hover:opacity-90 transition-opacity"
                        >
                          Link Subject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom Confirmation Bar */}
            <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              {/* Replace vs Merge Selector if user already has classes */}
              {existingCount > 0 ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-on-surface-variant">Existing classes found ({existingCount}):</span>
                  <div className="inline-flex rounded-lg bg-surface-container p-0.5 border border-outline-variant/30">
                    <button
                      type="button"
                      onClick={() => setReplaceMode('replace')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        replaceMode === 'replace'
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Replace Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplaceMode('merge')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        replaceMode === 'merge'
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Merge / Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                  <span>{entries.length} classes extracted across {new Set(entries.map((e) => e.day)).size} days.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-button-text font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-button-text font-semibold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Confirm &amp; Save Timetable</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Saving Loading Screen */}
        {step === 'saving' && (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <h3 className="font-headline-sm text-on-surface font-semibold text-lg">
              Saving your Timetable...
            </h3>
            <p className="text-xs text-on-surface-variant">
              Generating your personalized schedule and linking course records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
