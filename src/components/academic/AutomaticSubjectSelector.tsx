'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import CollegeCombobox, { CollegeOption } from './CollegeCombobox';

export interface BranchOption {
  id: string;
  name: string;
  normalizedName: string;
}

export interface AcademicSubjectItem {
  id: string;
  code: string;
  name: string;
  subjectType: string;
  credits: number;
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  regulation?: string;
  academicYear?: string;
}

interface AutomaticSubjectSelectorProps {
  initialCollegeId?: string;
  initialCollegeName?: string;
  initialBranchId?: string;
  initialBranchName?: string;
  initialRegulation?: string;
  initialSemester?: number;
  onSelectionChange?: (data: {
    collegeId: string;
    collegeName: string;
    universityId: string;
    universityName: string;
    branchId: string;
    branchName: string;
    regulation: string;
    semester: number;
    subjects: AcademicSubjectItem[];
  }) => void;
  readOnly?: boolean;
}

export default function AutomaticSubjectSelector({
  initialCollegeId,
  initialCollegeName,
  initialBranchId,
  initialBranchName,
  initialRegulation = 'R25',
  initialSemester = 1,
  onSelectionChange,
  readOnly = false,
}: AutomaticSubjectSelectorProps) {
  // State
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null);
  const [collegeError, setCollegeError] = useState('');

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId || '');
  const [selectedBranchName, setSelectedBranchName] = useState<string>(initialBranchName || '');

  const [regulation, setRegulation] = useState<string>(initialRegulation || 'R25');
  const [semester, setSemester] = useState<number>(initialSemester || 1);

  // Subject Results State
  const [subjects, setSubjects] = useState<AcademicSubjectItem[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isSyllabusAvailable, setIsSyllabusAvailable] = useState<boolean>(true);
  const [emptyMessage, setEmptyMessage] = useState<string>('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');

  // Client-side subjects cache: key = `${collegeId}_${branchId}_${regulation}_${semester}`
  const subjectsCacheRef = useRef<Map<string, { available: boolean; subjects: AcademicSubjectItem[]; message?: string }>>(new Map());

  // Initialize selected college if initial IDs provided
  useEffect(() => {
    if (initialCollegeId && !selectedCollege) {
      fetch(`/api/academic/colleges?limit=100`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.colleges)) {
            const found = d.colleges.find((c: any) => c.id === initialCollegeId);
            if (found) {
              setSelectedCollege(found);
            } else if (initialCollegeName) {
              setSelectedCollege({
                id: initialCollegeId,
                name: initialCollegeName,
                externalCollegeId: null,
                state: null,
                district: null,
                website: null,
                universityId: '',
                universityName: 'Affiliated University',
              });
            }
          }
        })
        .catch((e) => console.error('Initial college load error:', e));
    }
  }, [initialCollegeId, initialCollegeName, selectedCollege]);

  // When college changes, fetch its branches
  useEffect(() => {
    if (!selectedCollege?.id) {
      setBranches([]);
      return;
    }

    setIsLoadingBranches(true);
    fetch(`/api/academic/branches?collegeId=${selectedCollege.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.branches)) {
          setBranches(data.branches);
          // Auto-select CSE or first branch if current selection is not in list
          if (data.branches.length > 0) {
            const hasCurrent = data.branches.some((b: BranchOption) => b.id === selectedBranchId);
            if (!hasCurrent) {
              const cse = data.branches.find(
                (b: BranchOption) =>
                  b.name.toLowerCase().includes('computer science') ||
                  b.normalizedName.includes('cse')
              );
              const target = cse || data.branches[0];
              setSelectedBranchId(target.id);
              setSelectedBranchName(target.name);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load branches:', err))
      .finally(() => setIsLoadingBranches(false));
  }, [selectedCollege?.id]);

  // Main Auto-fetch Subjects Trigger
  const fetchSubjects = useCallback(async () => {
    if (!selectedCollege?.id || !selectedBranchId) {
      setSubjects([]);
      return;
    }

    const cacheKey = `${selectedCollege.id}_${selectedBranchId}_${regulation}_${semester}`;
    const cached = subjectsCacheRef.current.get(cacheKey);

    if (cached) {
      setIsSyllabusAvailable(cached.available);
      setSubjects(cached.subjects);
      setEmptyMessage(cached.message || '');

      if (onSelectionChange) {
        onSelectionChange({
          collegeId: selectedCollege.id,
          collegeName: selectedCollege.name,
          universityId: selectedCollege.universityId,
          universityName: selectedCollege.universityName,
          branchId: selectedBranchId,
          branchName: selectedBranchName,
          regulation,
          semester,
          subjects: cached.subjects,
        });
      }
      return;
    }

    try {
      setIsLoadingSubjects(true);
      const res = await fetch(
        `/api/academic/subjects?collegeId=${encodeURIComponent(
          selectedCollege.id
        )}&branchId=${encodeURIComponent(selectedBranchId)}&regulation=${encodeURIComponent(
          regulation
        )}&semester=${semester}`
      );
      const data = await res.json();

      if (data.success && data.available && Array.isArray(data.subjects) && data.subjects.length > 0) {
        setIsSyllabusAvailable(true);
        setSubjects(data.subjects);
        setEmptyMessage('');

        subjectsCacheRef.current.set(cacheKey, {
          available: true,
          subjects: data.subjects,
        });

        if (onSelectionChange) {
          onSelectionChange({
            collegeId: selectedCollege.id,
            collegeName: selectedCollege.name,
            universityId: selectedCollege.universityId,
            universityName: selectedCollege.universityName,
            branchId: selectedBranchId,
            branchName: selectedBranchName,
            regulation,
            semester,
            subjects: data.subjects,
          });
        }
      } else {
        const msg =
          data.message ||
          'Your syllabus is not available yet. Please select another regulation or contact support.';
        setIsSyllabusAvailable(false);
        setSubjects([]);
        setEmptyMessage(msg);

        subjectsCacheRef.current.set(cacheKey, {
          available: false,
          subjects: [],
          message: msg,
        });

        if (onSelectionChange) {
          onSelectionChange({
            collegeId: selectedCollege.id,
            collegeName: selectedCollege.name,
            universityId: selectedCollege.universityId,
            universityName: selectedCollege.universityName,
            branchId: selectedBranchId,
            branchName: selectedBranchName,
            regulation,
            semester,
            subjects: [],
          });
        }
      }
    } catch (err) {
      console.error('Auto-fetch subjects error:', err);
      setIsSyllabusAvailable(false);
      setSubjects([]);
      setEmptyMessage('Your syllabus is not available yet. Please select another regulation or contact support.');
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [selectedCollege, selectedBranchId, selectedBranchName, regulation, semester, onSelectionChange]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Filtered view
  const displayedSubjects = subjects.filter((s) => {
    if (activeTypeFilter === 'ALL') return true;
    return s.subjectType.toLowerCase() === activeTypeFilter.toLowerCase();
  });

  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  const coreCount = subjects.filter((s) => s.subjectType === 'core').length;
  const labCount = subjects.filter((s) => s.subjectType === 'lab').length;
  const electiveCount = subjects.filter((s) => s.subjectType.includes('elective')).length;
  const skillCount = subjects.filter((s) => s.subjectType === 'skill').length;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* ── Selection Control Bar ── */}
      <div className="rounded-2xl bg-surface-container border border-outline-variant/40 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Step 1: College Selection */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
            1. Select College <span className="text-deep-coral">*</span>
          </label>
          <CollegeCombobox
            value={selectedCollege?.name || ''}
            selectedId={selectedCollege?.id}
            onSelectCollege={(c) => {
              setSelectedCollege(c);
              setCollegeError('');
            }}
            error={collegeError}
            disabled={readOnly}
          />

          {/* Auto-detected University Confirmation Badge */}
          {selectedCollege && (
            <div className="mt-2.5 p-3 rounded-xl bg-deep-coral/10 border border-deep-coral/30 flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[20px] text-deep-coral shrink-0 mt-0.5">
                verified
              </span>
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-on-surface">
                  University Auto-Identified
                </div>
                <div className="text-on-surface-variant font-medium">
                  {selectedCollege.universityName}
                </div>
                {selectedCollege.state && (
                  <div className="text-[11px] text-on-surface-variant/80">
                    Location: {[selectedCollege.district, selectedCollege.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Branch Selection (Dependent on College) */}
        {selectedCollege && (
          <div className="space-y-2 pt-2 border-t border-outline-variant/30 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                2. Select Branch / Specialization <span className="text-deep-coral">*</span>
              </label>
              {isLoadingBranches && (
                <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-mono">
                  <div className="w-3 h-3 border border-deep-coral/40 border-t-deep-coral rounded-full animate-spin" />
                  Loading college branches...
                </span>
              )}
            </div>

            {branches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {branches.map((b) => {
                  const isSelected = selectedBranchId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={readOnly}
                      onClick={() => {
                        setSelectedBranchId(b.id);
                        setSelectedBranchName(b.name);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-deep-coral text-white border-deep-coral font-semibold shadow-sm'
                          : 'bg-surface text-on-surface border-outline-variant/60 hover:border-coral/50 hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] shrink-0">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              !isLoadingBranches && (
                <p className="text-xs text-on-surface-variant py-2">
                  No registered branches for this college yet. Contact support to register your branch.
                </p>
              )
            )}
          </div>
        )}

        {/* Step 3: Regulation & Semester Selection */}
        {selectedCollege && selectedBranchId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/30 animate-in fade-in duration-200">
            {/* Regulation / Batch */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                3. Regulation / Batch <span className="text-deep-coral">*</span>
              </label>
              <div className="flex gap-2">
                {['R25', 'R22', 'R18'].map((reg) => {
                  const isSelected = regulation === reg;
                  return (
                    <button
                      key={reg}
                      type="button"
                      disabled={readOnly}
                      onClick={() => setRegulation(reg)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container-high text-deep-coral border-deep-coral shadow-xs font-bold'
                          : 'bg-surface text-on-surface border-outline-variant/60 hover:border-coral/40'
                      }`}
                    >
                      {reg} {reg === 'R25' ? '(2025-26)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Semester Tabs */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                4. Select Semester <span className="text-deep-coral">*</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                  const isSelected = semester === sem;
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setSemester(sem)}
                      className={`py-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-deep-coral text-white border-deep-coral shadow-md'
                          : 'bg-surface text-on-surface border-outline-variant/60 hover:border-coral/40'
                      }`}
                    >
                      S{sem}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Auto-Fetched Subjects Display Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-deep-coral">
              menu_book
            </span>
            <h3 className="font-semibold text-base sm:text-lg text-on-surface">
              Automatically Fetched Subjects (Semester {semester})
            </h3>
            {isSyllabusAvailable && subjects.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-deep-coral/15 text-deep-coral font-bold text-xs font-mono">
                {subjects.length} Subjects • {totalCredits} Credits
              </span>
            )}
          </div>

          {/* Type filters */}
          {isSyllabusAvailable && subjects.length > 0 && (
            <div className="flex items-center gap-1">
              {['ALL', 'core', 'lab', 'elective', 'skill'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveTypeFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTypeFilter === f
                      ? 'bg-deep-coral text-white'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoadingSubjects && (
          <div className="p-8 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-deep-coral/30 border-t-deep-coral rounded-full animate-spin" />
            <p className="text-xs font-mono text-on-surface-variant">
              Querying university syllabus catalog for {regulation} Semester {semester}...
            </p>
          </div>
        )}

        {/* Empty State / Syllabus Unavailable State */}
        {!isLoadingSubjects && !isSyllabusAvailable && (
          <div className="p-8 rounded-2xl bg-surface-container border border-warning/30 text-center space-y-3 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-warning/15 text-warning flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-semibold text-sm text-on-surface">
                Syllabus Unavailable
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {emptyMessage ||
                  'Your syllabus is not available yet. Please select another regulation or contact support.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRegulation('R25')}
                className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/60 text-xs font-semibold text-on-surface hover:border-coral/50 transition-colors cursor-pointer"
              >
                Switch to R25
              </button>
              <a
                href="mailto:support@nivora.edu"
                className="px-4 py-2 rounded-xl bg-deep-coral text-white text-xs font-semibold hover:bg-coral transition-colors"
              >
                Contact Academic Support
              </a>
            </div>
          </div>
        )}

        {/* Available Subjects Grid */}
        {!isLoadingSubjects && isSyllabusAvailable && subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedSubjects.map((sub) => {
              const isCore = sub.subjectType === 'core';
              const isLab = sub.subjectType === 'lab';
              const isElective = sub.subjectType === 'elective' || sub.subjectType === 'open_elective';
              const isSkill = sub.subjectType === 'skill';
              const isAudit = sub.subjectType === 'audit';
              const isProject = sub.subjectType === 'project' || sub.subjectType === 'internship';

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl bg-surface-container border border-outline-variant/40 p-4 flex flex-col justify-between hover:border-outline-variant/80 transition-all shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface border border-outline-variant/30">
                        {sub.code || 'SUB'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCore
                            ? 'bg-deep-coral/15 text-deep-coral'
                            : isLab
                            ? 'bg-blue-500/15 text-blue-500'
                            : isElective
                            ? 'bg-purple-500/15 text-purple-500'
                            : isSkill
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : isProject
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {sub.subjectType}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-on-surface line-clamp-2 leading-snug">
                      {sub.name}
                    </h4>
                  </div>

                  <div className="pt-3 mt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs font-mono text-on-surface-variant">
                    <span className="font-bold text-on-surface">
                      {sub.credits} {sub.credits === 1 ? 'Credit' : 'Credits'}
                    </span>
                    <span className="text-[11px]">
                      L:{sub.lectureHours} T:{sub.tutorialHours} P:{sub.practicalHours}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Notice that manual entry is completely removed and automatic */}
        <p className="text-[11px] font-mono text-on-surface-variant/70 text-center pt-1">
          ✓ Official university syllabus source of truth • Automatic credit synchronization
        </p>
      </div>
    </div>
  );
}
