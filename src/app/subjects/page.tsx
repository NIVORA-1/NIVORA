'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AutomaticSubjectSelector from '@/components/academic/AutomaticSubjectSelector';

interface SubjectItem {
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
  universityName?: string;
  collegeName?: string;
  branchName?: string;
}

interface AcademicMeta {
  collegeName?: string;
  universityName?: string;
  branchName?: string;
  regulation?: string;
  academicYear?: string;
}

export default function SubjectsPage() {
  const { user, refreshUser } = useApp();
  const searchParams = useSearchParams();

  // Profile data from authenticated student
  const profileCollege = user?.profile?.college;
  const profileCollegeId = (user?.profile as any)?.collegeId;
  const profileBranchId = (user?.profile as any)?.branchId;
  const profileRegulation = (user?.profile as any)?.regulation || 'R25';
  const profileBranchName = user?.profile?.stream || 'Computer Science & Engineering';
  const profileSemester = user?.profile?.semester || 1;

  // Selected state
  const [selectedSemester, setSelectedSemester] = useState<number>(profileSemester);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [academicMeta, setAcademicMeta] = useState<AcademicMeta>({
    collegeName: profileCollege,
    branchName: profileBranchName,
    regulation: profileRegulation,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Client-side cache: key = `sem_${semester}_col_${collegeId}_b_${branchId}_reg_${regulation}`
  const cacheRef = useRef<Map<string, { available: boolean; subjects: SubjectItem[]; meta: AcademicMeta; error?: string }>>(new Map());

  // Handle URL param or profile sync
  useEffect(() => {
    const semParam = searchParams.get('sem') || searchParams.get('semester');
    if (semParam) {
      const parsed = parseInt(semParam, 10);
      if (parsed >= 1 && parsed <= 8) {
        setSelectedSemester(parsed);
      }
    } else if (user?.profile?.semester) {
      setSelectedSemester(user.profile.semester);
    }
  }, [searchParams, user?.profile?.semester]);

  // Fetch subjects for current semester
  const fetchCurriculum = useCallback(async (sem: number) => {
    const activeCollegeId = profileCollegeId;
    const activeBranchId = profileBranchId;
    const activeRegulation = academicMeta.regulation || profileRegulation || 'R25';

    const cacheKey = `sem_${sem}_col_${activeCollegeId || 'profile'}_b_${activeBranchId || 'profile'}_reg_${activeRegulation}`;
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      setIsAvailable(cached.available);
      setSubjects(cached.subjects);
      setAcademicMeta(cached.meta);
      setErrorMessage(cached.error || '');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Build query
      let url = `/api/academic/subjects?semester=${sem}`;
      if (activeCollegeId && activeBranchId) {
        url = `/api/academic/subjects?collegeId=${activeCollegeId}&branchId=${activeBranchId}&regulation=${activeRegulation}&semester=${sem}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.available && Array.isArray(data.subjects) && data.subjects.length > 0) {
        const meta: AcademicMeta = {
          collegeName: data.collegeName || profileCollege,
          universityName: data.universityName,
          branchName: data.branchName || profileBranchName,
          regulation: data.regulation || activeRegulation,
          academicYear: data.academicYear,
        };

        setIsAvailable(true);
        setSubjects(data.subjects);
        setAcademicMeta(meta);
        setErrorMessage('');

        cacheRef.current.set(cacheKey, {
          available: true,
          subjects: data.subjects,
          meta,
        });
      } else {
        const msg =
          data.message ||
          'Your syllabus is not available yet. Please select another regulation or contact support.';
        setIsAvailable(false);
        setSubjects([]);
        setErrorMessage(msg);

        cacheRef.current.set(cacheKey, {
          available: false,
          subjects: [],
          meta: academicMeta,
          error: msg,
        });
      }
    } catch (err) {
      console.error('Failed to load curriculum subjects:', err);
      setIsAvailable(false);
      setSubjects([]);
      setErrorMessage('Your syllabus is not available yet. Please select another regulation or contact support.');
    } finally {
      setIsLoading(false);
    }
  }, [profileCollegeId, profileBranchId, profileRegulation, profileCollege, profileBranchName, academicMeta.regulation]);

  useEffect(() => {
    fetchCurriculum(selectedSemester);
  }, [selectedSemester, fetchCurriculum]);

  // Filtering
  const displayedSubjects = subjects.filter((s) => {
    if (typeFilter === 'ALL') return true;
    return s.subjectType.toLowerCase() === typeFilter.toLowerCase();
  });

  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  const coreCount = subjects.filter((s) => s.subjectType === 'core').length;
  const labCount = subjects.filter((s) => s.subjectType === 'lab').length;
  const electiveCount = subjects.filter((s) => s.subjectType.includes('elective')).length;
  const skillCount = subjects.filter((s) => s.subjectType === 'skill').length;

  const isCurrentProfileSemester = selectedSemester === profileSemester;

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-xl pb-space-4xl animate-in fade-in duration-200">
      {/* ── Top Header Section ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase flex-wrap">
            <span>Automated Curriculum</span>
            <span>/</span>
            <span className="text-primary font-semibold">
              {academicMeta.branchName || profileBranchName}
            </span>
            <span>•</span>
            <span className="text-on-surface font-medium">Semester {selectedSemester}</span>
            {academicMeta.regulation && (
              <span className="px-2 py-0.5 rounded-full bg-deep-coral/15 text-deep-coral font-bold text-[10px] tracking-wide">
                {academicMeta.regulation}
              </span>
            )}
            {isCurrentProfileSemester && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold text-[10px] tracking-wide">
                Current Active Semester
              </span>
            )}
          </div>

          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-semibold">
            {academicMeta.branchName || profileBranchName}
          </h1>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap pt-0.5">
            {academicMeta.collegeName && (
              <span className="flex items-center gap-1 font-medium text-on-surface">
                <span className="material-symbols-outlined text-[15px] text-deep-coral">school</span>
                <span>{academicMeta.collegeName}</span>
              </span>
            )}
            {academicMeta.universityName && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-deep-coral">account_balance</span>
                  <span>{academicMeta.universityName}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Telemetry Metrics & Calibration CTA */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">award_star</span>
            <div>
              <div className="font-bold text-on-surface leading-none">{totalCredits} Credits</div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">Semester {selectedSemester} Total</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
            <div>
              <div className="font-bold text-on-surface leading-none">{subjects.length} Subjects</div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">
                {coreCount} Core · {labCount} Lab {skillCount > 0 ? `· ${skillCount} Skill` : ''}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-deep-coral hover:text-white border border-outline-variant/40 text-xs font-semibold text-on-surface transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Configure or calibrate academic institution"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Switch / Calibrate College</span>
          </button>
        </div>
      </section>

      {/* ── Semester Navigation Selector ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-label-mono-wide text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
            <span className="material-symbols-outlined text-[16px] text-primary">view_carousel</span>
            <span>Select Semester</span>
          </div>

          {!isCurrentProfileSemester && (
            <button
              type="button"
              onClick={() => setSelectedSemester(profileSemester)}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Jump to your active profile semester (Sem {profileSemester})</span>
              <span className="material-symbols-outlined text-[14px]">undo</span>
            </button>
          )}
        </div>

        {/* Semester Tabs (1 to 8) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const isSelected = sem === selectedSemester;
            const isProfileSem = sem === profileSemester;

            return (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`relative px-4 py-2.5 rounded-xl font-button-text text-button-text transition-all duration-150 shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-deep-coral text-white shadow-md font-bold'
                    : 'bg-surface-container-low hover:bg-surface-container hover:text-on-surface text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                <span>Semester {sem}</span>
                {isProfileSem && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-deep-coral'
                    }`}
                    title="Your saved profile semester"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter & Institutional Framework Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant shadow-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">verified</span>
          <span>
            Automated Syllabus for <strong>{academicMeta.collegeName || 'Verified College'}</strong> • Affiliated to <strong>{academicMeta.universityName || 'State University'}</strong> ({academicMeta.regulation || 'R25'} Regulation).
          </span>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {['ALL', 'core', 'lab', 'elective', 'skill', 'audit'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                typeFilter.toLowerCase() === t.toLowerCase()
                  ? 'bg-surface-container-highest text-on-surface border border-outline-variant/50 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading Skeleton State ── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="w-20 h-5 bg-surface-container-high rounded" />
                <div className="w-14 h-5 bg-surface-container-high rounded" />
              </div>
              <div className="w-3/4 h-6 bg-surface-container-high rounded" />
              <div className="w-full h-4 bg-surface-container-high/60 rounded" />
              <div className="pt-4 border-t border-outline-variant/20 flex justify-between">
                <div className="w-24 h-4 bg-surface-container-high rounded" />
                <div className="w-16 h-4 bg-surface-container-high rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Syllabus Unavailable / Empty State ── */}
      {!isLoading && (!isAvailable || displayedSubjects.length === 0) && (
        <div className="py-16 text-center rounded-2xl bg-surface-container-low border border-warning/30 p-8 space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-warning/15 text-warning flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base text-on-surface">
              Syllabus Not Available
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {errorMessage ||
                'Your syllabus is not available yet. Please select another regulation or contact support.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-5 py-2.5 rounded-xl bg-deep-coral text-white font-semibold text-xs hover:bg-coral transition-colors cursor-pointer shadow-sm"
            >
              Select Another College / Regulation
            </button>
            <a
              href="mailto:support@nivora.edu"
              className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/60 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}

      {/* ── Grid of Automatically Fetched Subject Cards ── */}
      {!isLoading && isAvailable && displayedSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {displayedSubjects.map((sub) => {
            const isCore = sub.subjectType === 'core';
            const isLab = sub.subjectType === 'lab';
            const isElective = sub.subjectType.includes('elective');
            const isSkill = sub.subjectType === 'skill';
            const isAudit = sub.subjectType === 'audit';
            const isProject = sub.subjectType === 'project' || sub.subjectType === 'internship';

            return (
              <div
                key={sub.id}
                className="group relative rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/70 p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Top Row: Subject Code Badge, Type Badge, Credits */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-surface-container text-primary border border-outline-variant/30">
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

                    <div className="flex items-center gap-1 font-mono text-xs text-on-surface font-semibold">
                      <span>{sub.credits}</span>
                      <span className="text-on-surface-variant text-[11px] font-normal">Credits</span>
                    </div>
                  </div>

                  {/* Subject Name */}
                  <div className="pt-3 pb-2">
                    <h2 className="font-headline-sm text-body-lg text-on-surface font-bold group-hover:text-primary transition-colors leading-snug">
                      {sub.name}
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                      Official curriculum unit under {academicMeta.regulation || 'R25'} regulation.
                    </p>
                  </div>

                  {/* Hours Breakdown */}
                  <div className="pt-2 pb-3">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant">
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                        L: {sub.lectureHours}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                        T: {sub.tutorialHours}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                        P: {sub.practicalHours}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Action */}
                <div className="pt-3 mt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate">
                    <span className="material-symbols-outlined text-[16px] text-outline-variant">school</span>
                    <span className="truncate">{academicMeta.universityName || 'Verified Syllabus'}</span>
                  </div>

                  <Link
                    href={`/subjects/${sub.code || sub.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-deep-coral hover:text-white text-on-surface font-button-text text-button-text font-semibold transition-all shrink-0 cursor-pointer shadow-2xs group/btn"
                  >
                    <span>Open Subject</span>
                    <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal for Switching / Calibrating College & Curriculum ── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface-container rounded-3xl border border-outline-variant/40 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-lg text-on-surface">
                  Calibrate Academic Institution
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Select your college to auto-detect your university and fetch official semester subjects.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <AutomaticSubjectSelector
              initialCollegeId={profileCollegeId}
              initialCollegeName={academicMeta.collegeName}
              initialBranchId={profileBranchId}
              initialBranchName={academicMeta.branchName}
              initialRegulation={academicMeta.regulation || 'R25'}
              initialSemester={selectedSemester}
              onSelectionChange={async (data) => {
                setAcademicMeta({
                  collegeName: data.collegeName,
                  universityName: data.universityName,
                  branchName: data.branchName,
                  regulation: data.regulation,
                  academicYear: data.subjects[0]?.academicYear,
                });
                setSelectedSemester(data.semester);

                // Auto-save to user profile
                try {
                  await fetch('/api/onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      collegeId: data.collegeId,
                      college: data.collegeName,
                      branchId: data.branchId,
                      stream: data.branchName,
                      regulation: data.regulation,
                      semester: data.semester,
                    }),
                  });
                  await refreshUser();
                } catch (e) {
                  console.warn('Profile sync error:', e);
                }
              }}
            />

            <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  fetchCurriculum(selectedSemester);
                }}
                className="px-6 py-2.5 rounded-xl bg-deep-coral text-white font-semibold text-xs hover:bg-coral transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
