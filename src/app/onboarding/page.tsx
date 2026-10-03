'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import NivoraLogo from '@/components/ui/NivoraLogo';
import CollegeCombobox from '@/components/academic/CollegeCombobox';
import AutomaticSubjectSelector from '@/components/academic/AutomaticSubjectSelector';
import UniversityCombobox from '@/components/onboarding/UniversityCombobox';
import { isValidUniversity, findUniversity } from '@/lib/universities';

// Dynamic Stream/Major Options Mapped to Degree
const DEGREE_STREAMS: Record<string, string[]> = {
  'B.Tech': [
    'Computer Science',
    'Information Technology',
    'Mechanical',
    'Electronics',
    'Civil',
    'Other',
  ],
  BBA: ['Finance', 'Marketing', 'HR', 'Business Analytics', 'Other'],
  'B.Com': [
    'Accounting & Finance',
    'Banking & Insurance',
    'Taxation',
    'Corporate Law',
    'Other',
  ],
  BA: [
    'Economics',
    'English Literature',
    'Psychology',
    'Political Science',
    'Journalism',
    'Other',
  ],
  'B.Sc': [
    'Data Science',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biotechnology',
    'Other',
  ],
  Law: [
    'Corporate Law',
    'Constitutional Law',
    'Criminal Law',
    'Intellectual Property',
    'Other',
  ],
  Other: ['General Studies', 'Interdisciplinary Studies', 'Other'],
};

const ACADEMIC_GOALS_OPTIONS = [
  { id: 'Improve my grades', label: 'Improve my grades', icon: 'trending_up', desc: 'Raise GPA & course mastery' },
  { id: 'Stay consistent', label: 'Stay consistent', icon: 'repeat', desc: 'Build daily study momentum' },
  { id: 'Prepare for exams', label: 'Prepare for exams', icon: 'quiz', desc: 'Target midterms & finals' },
  { id: 'Build technical skills', label: 'Build technical skills', icon: 'code', desc: 'Master industry tooling' },
  { id: 'Build projects', label: 'Build projects', icon: 'terminal', desc: 'Create portfolio repositories' },
  { id: 'Prepare for placements', label: 'Prepare for placements', icon: 'work', desc: 'Interviews & ATS readiness' },
  { id: 'Prepare for higher studies', label: 'Prepare for higher studies', icon: 'school', desc: 'GRE, GATE & research' },
  { id: 'Explore career options', label: 'Explore career options', icon: 'explore', desc: 'Discover career roadmaps' },
];

const STUDY_DURATIONS = ['25 min', '45 min', '60 min', '90 min', 'Custom'];
const STUDY_TIMES = [
  { id: 'Morning', label: 'Morning', icon: 'wb_sunny', desc: '6:00 AM – 12:00 PM' },
  { id: 'Afternoon', label: 'Afternoon', icon: 'light_mode', desc: '12:00 PM – 5:00 PM' },
  { id: 'Evening', label: 'Evening', icon: 'wb_twilight', desc: '5:00 PM – 9:00 PM' },
  { id: 'Night', label: 'Night', icon: 'bedtime', desc: '9:00 PM – Late' },
];
const STUDY_STYLES = [
  { id: 'Deep Focus', label: 'Deep Focus', icon: 'psychology', desc: 'Extended uninterrupted sessions' },
  { id: 'Short Sessions', label: 'Short Sessions', icon: 'flash_on', desc: 'Bite-sized high-intensity blocks' },
  { id: 'Pomodoro', label: 'Pomodoro', icon: 'timer', desc: '25m work + 5m structured pause' },
  { id: 'Flexible', label: 'Flexible', icon: 'tune', desc: 'Adapts dynamically to daily workload' },
];
const DAILY_STUDY_GOALS = ['30 min', '1 hour', '2 hours', '3 hours', '4+ hours'];

const INTEREST_OPTIONS = [
  'Coding',
  'Web Development',
  'AI / ML',
  'Data',
  'Design',
  'Business',
  'Finance',
  'Entrepreneurship',
  'Communication',
  'Research',
  'Competitive Programming',
  'Career Preparation',
  'Other',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoadingUser, refreshUser } = useApp();

  // Onboarding Step State:
  // 0: Welcome Screen
  // 1: About You
  // 2: Academic Profile
  // 3: Goals
  // 4: Study Preferences
  // 5: Interests
  // 6: "Building your Nivora..." Transition
  const [step, setStep] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | undefined>(undefined);
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | undefined>(undefined);
  const [regulation, setRegulation] = useState('R25');
  const [nameError, setNameError] = useState('');
  const [collegeError, setCollegeError] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [stream, setStream] = useState('Computer Science & Engineering');
  const [customStream, setCustomStream] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [semester, setSemester] = useState('1');

  // Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [currentCgpa, setCurrentCgpa] = useState('');
  const [targetCgpa, setTargetCgpa] = useState('');

  // Study Preferences
  const [studyDuration, setStudyDuration] = useState('45 min');
  const [customDuration, setCustomDuration] = useState('');
  const [preferredStudyTime, setPreferredStudyTime] = useState('Morning');
  const [studyStyle, setStudyStyle] = useState('Deep Focus');
  const [dailyStudyGoal, setDailyStudyGoal] = useState('2 hours');

  // Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  // Transition checklist state
  const [transitionProgress, setTransitionProgress] = useState({
    academic: false,
    preferences: false,
    layout: false,
    recommendations: false,
  });

  // Guard: if already completed, send directly to /home. If not authenticated, send to /login.
  useEffect(() => {
    if (!isLoadingUser) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (user.profile?.onboardingCompleted) {
        router.replace('/home');
        return;
      }

      // Populate from existing user / profile if available
      if (!isInitialized) {
        if (user.name) setFullName(user.name);
        if (user.profile) {
          if (user.profile.college) {
            setCollege(user.profile.college);
            const matched = findUniversity(user.profile.college);
            if (matched) setSelectedUniversityId(matched.id);
          }
          if ((user.profile as any).collegeId) setSelectedCollegeId((user.profile as any).collegeId);
          if ((user.profile as any).branchId) setSelectedBranchId((user.profile as any).branchId);
          if ((user.profile as any).regulation) setRegulation((user.profile as any).regulation);
          if (user.profile.degree) setDegree(user.profile.degree);
          if (user.profile.stream) setStream(user.profile.stream);
          if (user.profile.year) {
            const yMap: Record<number, string> = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
            setAcademicYear(yMap[user.profile.year] || 'Other');
          }
          if (user.profile.semester) setSemester(String(user.profile.semester));
          if (user.profile.cgpa) setCurrentCgpa(String(user.profile.cgpa));
          if (user.profile.targetCgpa) setTargetCgpa(String(user.profile.targetCgpa));
          if (user.profile.academicGoals && user.profile.academicGoals.length > 0) {
            setSelectedGoals(user.profile.academicGoals);
          }
          if (user.profile.studyDuration) setStudyDuration(user.profile.studyDuration);
          if (user.profile.preferredStudyTime) setPreferredStudyTime(user.profile.preferredStudyTime);
          if (user.profile.studyStyle) setStudyStyle(user.profile.studyStyle);
          if (user.profile.dailyStudyGoal) setDailyStudyGoal(user.profile.dailyStudyGoal);
          if (user.profile.interests && user.profile.interests.length > 0) {
            setSelectedInterests(user.profile.interests);
          }
          // Resume saved step if user had made progress
          if (user.profile.onboardingStep && user.profile.onboardingStep > 0 && user.profile.onboardingStep <= 5) {
            setStep(user.profile.onboardingStep);
          }
        }
        setIsInitialized(true);
      }
    }
  }, [user, isLoadingUser, isInitialized, router]);

  // Handle semester options dynamically based on academic year
  useEffect(() => {
    if (academicYear === '1st Year') {
      if (semester !== '1' && semester !== '2') setSemester('1');
    } else if (academicYear === '2nd Year') {
      if (semester !== '3' && semester !== '4') setSemester('3');
    } else if (academicYear === '3rd Year') {
      if (semester !== '5' && semester !== '6') setSemester('5');
    } else if (academicYear === '4th Year') {
      if (semester !== '7' && semester !== '8') setSemester('7');
    }
  }, [academicYear, semester]);

  // Dynamically reset stream if degree changes and current stream is not in options
  const availableStreams = DEGREE_STREAMS[degree] || DEGREE_STREAMS['Other'];
  useEffect(() => {
    if (!availableStreams.includes(stream)) {
      setStream(availableStreams[0] || 'Other');
    }
  }, [degree, availableStreams, stream]);

  // Compute streamCode for internal curriculum models
  const getComputedStreamCode = useCallback((): string => {
    const activeStream = stream === 'Other' ? customStream : stream;
    const lower = (activeStream || '').toLowerCase();
    const degLower = (degree || '').toLowerCase();

    if (degLower.includes('law')) return 'LAW';
    if (degLower.includes('bba') || degLower.includes('b.com') || lower.includes('business') || lower.includes('finance')) return 'BBA';
    if (lower.includes('mech') || lower.includes('civil') || lower.includes('aero')) return 'MECH';
    return 'CSE';
  }, [stream, customStream, degree]);

  // Parse numerical year
  const getNumericalYear = useCallback((): number => {
    if (academicYear === '1st Year') return 1;
    if (academicYear === '2nd Year') return 2;
    if (academicYear === '3rd Year') return 3;
    if (academicYear === '4th Year') return 4;
    return 1;
  }, [academicYear]);

  // Partial save to preserve progress safely
  const saveProgress = async (
    nextStepIndex: number,
    overrideName?: string,
    overrideCollege?: string
  ) => {
    try {
      const activeName = (overrideName !== undefined ? overrideName : fullName).trim() || user?.name;
      const activeCollege = (overrideCollege !== undefined ? overrideCollege : college).trim() || user?.profile?.college || 'University Campus';
      const activeStream = stream === 'Other' ? (customStream || 'General Studies') : stream;
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: nextStepIndex,
          name: activeName,
          college: activeCollege,
          collegeId: selectedCollegeId,
          branchId: selectedBranchId,
          regulation: regulation || 'R25',
          degree,
          stream: activeStream,
          streamCode: getComputedStreamCode(),
          year: getNumericalYear(),
          semester: parseInt(semester) || 1,
          currentCgpa: currentCgpa ? parseFloat(currentCgpa) : null,
          targetCgpa: targetCgpa ? parseFloat(targetCgpa) : null,
          academicGoals: selectedGoals,
          studyDuration: studyDuration === 'Custom' ? (customDuration || '45 min') : studyDuration,
          preferredStudyTime,
          studyStyle,
          dailyStudyGoal,
          interests: selectedInterests,
        }),
      });
    } catch (e) {
      console.warn('Progress auto-save error:', e);
    }
  };

  const handleNext = async () => {
    if (isAdvancing || isSubmitting) return;

    if (step === 1) {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        setNameError('Full name is required.');
        return;
      }
      setNameError('');

      setIsAdvancing(true);
      const nextStep = 2;
      setStep(nextStep);
      try {
        await saveProgress(nextStep, trimmedName);
      } finally {
        setIsAdvancing(false);
      }
      return;
    }

    if (step === 2) {
      if (!selectedCollegeId && !college.trim()) {
        setCollegeError('Please select your college from the verified engineering catalog.');
        return;
      }
      setCollegeError('');
    }

    setIsAdvancing(true);
    const nextStep = step + 1;
    setStep(nextStep);
    try {
      await saveProgress(nextStep);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    // Optional skip advances to next step without trapping
    if (step < 5) {
      const nextStep = step + 1;
      setStep(nextStep);
      await saveProgress(nextStep);
    } else {
      // Skipped final step -> trigger build
      handleComplete();
    }
  };

  // Toggle multi-select goals
  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  // Toggle multi-select interests
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // Final submission and transition
  const handleComplete = async () => {
    setIsSubmitting(true);
    setStep(6); // Show "Building your Nivora..." transition

    const activeStream = stream === 'Other' ? (customStream || 'General Studies') : stream;
    const finalDuration = studyDuration === 'Custom' ? (customDuration || '45 min') : studyDuration;
    const allInterests = customInterest.trim()
      ? [...selectedInterests, customInterest.trim()]
      : selectedInterests;

    try {
      // 1. Send final payload to DB
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFinal: true,
          step: 5,
          name: fullName || user?.name,
          college: college || 'University Campus',
          collegeId: selectedCollegeId,
          branchId: selectedBranchId,
          regulation: regulation || 'R25',
          degree,
          stream: activeStream,
          streamCode: getComputedStreamCode(),
          year: getNumericalYear(),
          semester: parseInt(semester) || 1,
          currentCgpa: currentCgpa ? parseFloat(currentCgpa) : null,
          targetCgpa: targetCgpa ? parseFloat(targetCgpa) : null,
          academicGoals: selectedGoals,
          studyDuration: finalDuration,
          preferredStudyTime,
          studyStyle,
          dailyStudyGoal,
          interests: allInterests,
        }),
      });

      if (!res.ok) {
        throw new Error('Onboarding save failed');
      }

      // 2. Play progress transition checkmarks (polished transition while saving)
      setTimeout(() => setTransitionProgress((prev) => ({ ...prev, academic: true })), 350);
      setTimeout(() => setTransitionProgress((prev) => ({ ...prev, preferences: true })), 750);
      setTimeout(() => setTransitionProgress((prev) => ({ ...prev, layout: true })), 1150);
      setTimeout(() => setTransitionProgress((prev) => ({ ...prev, recommendations: true })), 1550);

      // 3. Finalize context and route to personalized dashboard
      setTimeout(async () => {
        await refreshUser();
        router.push('/home');
      }, 2100);
    } catch (error) {
      console.error('Final onboarding submission error:', error);
      setIsSubmitting(false);
      setStep(5);
    }
  };

  // Prevent flash while verifying session
  if (isLoadingUser || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <NivoraLogo size="large" priority />
          <div className="flex items-center gap-2 text-xs font-mono text-deep-coral">
            <svg className="animate-spin h-4 w-4 text-deep-coral" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Preparing your personal workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 6: "BUILDING YOUR NIVORA..." TRANSITION SCREEN
  // =========================================================================
  if (step === 6) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-on-surface selection:bg-coral selection:text-white">
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in duration-500">
          <div className="flex justify-center">
            <NivoraLogo size="large" priority />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
              Building your Nivora...
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Calibrating your personal student workspace and recommendations
            </p>
          </div>

          {/* Progressive Checklist Card */}
          <div className="rounded-2xl bg-surface-container border border-outline-variant/40 p-6 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-on-surface">Academic workspace</span>
              {transitionProgress.academic ? (
                <span className="flex items-center gap-1 text-xs font-mono font-semibold text-deep-coral animate-in zoom-in-50">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Active</span>
                </span>
              ) : (
                <div className="w-4 h-4 border-2 border-coral/30 border-t-deep-coral rounded-full animate-spin" />
              )}
            </div>

            <div className="flex items-center justify-between py-1 border-t border-outline-variant/30">
              <span className="text-sm font-medium text-on-surface">Study preferences</span>
              {transitionProgress.preferences ? (
                <span className="flex items-center gap-1 text-xs font-mono font-semibold text-deep-coral animate-in zoom-in-50">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Configured</span>
                </span>
              ) : (
                <div className="w-4 h-4 border-2 border-coral/30 border-t-deep-coral rounded-full animate-spin" />
              )}
            </div>

            <div className="flex items-center justify-between py-1 border-t border-outline-variant/30">
              <span className="text-sm font-medium text-on-surface">Dashboard layout</span>
              {transitionProgress.layout ? (
                <span className="flex items-center gap-1 text-xs font-mono font-semibold text-deep-coral animate-in zoom-in-50">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Generated</span>
                </span>
              ) : (
                <div className="w-4 h-4 border-2 border-coral/30 border-t-deep-coral rounded-full animate-spin" />
              )}
            </div>

            <div className="flex items-center justify-between py-1 border-t border-outline-variant/30">
              <span className="text-sm font-medium text-on-surface">Recommendations</span>
              {transitionProgress.recommendations ? (
                <span className="flex items-center gap-1 text-xs font-mono font-semibold text-deep-coral animate-in zoom-in-50">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Ready</span>
                </span>
              ) : (
                <div className="w-4 h-4 border-2 border-coral/30 border-t-deep-coral rounded-full animate-spin" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-deep-coral animate-ping" />
            <span>Finalizing student operating system node</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 0: WELCOME SCREEN
  // =========================================================================
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-on-surface selection:bg-coral selection:text-white">
        <div className="w-full max-w-lg space-y-8 text-center animate-in fade-in duration-300">
          <div className="flex justify-center">
            <NivoraLogo size="large" priority />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
              Welcome to Nivora.
            </h1>
            <p className="text-base sm:text-lg font-medium text-deep-coral">
              Let&apos;s build your personal student workspace.
            </p>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed pt-1">
              This will only take a minute. Your answers help Nivora personalize your dashboard, study tools and recommendations.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all font-sans font-semibold text-sm tracking-wide shadow-lg hover:shadow-deep-coral/20 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Let&apos;s Set Up Nivora</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <p className="text-[11px] font-mono text-on-surface-variant/80">
            Nivora Personal Student OS • Tailored for your degree &amp; daily rhythm
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEPS 1 TO 5: MULTI-STEP WORKSPACE BUILDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-8 text-on-surface selection:bg-coral selection:text-white">
      {/* Top Header & Progress Navigation */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between pb-6 border-b border-outline-variant/40">
        <NivoraLogo size="medium" />

        {/* Progress Tracker: 01 ━━━ 02 ━━━ 03 ━━━ 04 ━━━ 05 */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {[1, 2, 3, 4, 5].map((idx) => {
            const isCompleted = step > idx;
            const isCurrent = step === idx;
            return (
              <React.Fragment key={idx}>
                <div
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    isCurrent
                      ? 'bg-deep-coral text-white font-bold'
                      : isCompleted
                      ? 'bg-surface-container-high text-deep-coral font-medium'
                      : 'text-on-surface-variant'
                  }`}
                >
                  0{idx}
                </div>
                {idx < 5 && (
                  <div
                    className={`w-4 sm:w-8 h-[2px] rounded ${
                      step > idx ? 'bg-deep-coral' : 'bg-outline-variant/40'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </header>

      {/* Main Form Container */}
      <main className="w-full max-w-2xl mx-auto my-auto py-8">
        <div className="rounded-2xl bg-surface-container border border-outline-variant/40 p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in duration-300">
          {/* ========================================================= */}
          {/* STEP 1: ABOUT YOU                                         */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-deep-coral font-semibold">
                  Step 01 / Identity
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
                  First, tell us about yourself.
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Tell Nivora who you are so we can personalize your daily command center.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullNameInput"
                    className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant"
                  >
                    Full Name <span className="text-deep-coral">*</span>
                  </label>
                  <input
                    id="fullNameInput"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="off"
                    spellCheck={false}
                    value={fullName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFullName(val);
                      if (nameError && val.trim().length > 0) {
                        setNameError('');
                      }
                    }}
                    placeholder="e.g. Vinay Kumar"
                    className={`w-full px-4 py-3 rounded-xl bg-surface border text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none transition-all ${
                      nameError
                        ? 'border-error/80 focus:border-error focus:ring-1 focus:ring-error shadow-sm'
                        : 'border-outline-variant/60 focus:border-coral focus:ring-1 focus:ring-coral/40'
                    }`}
                  />
                  {nameError && (
                    <p className="text-xs text-error font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-200">
                      <span className="material-symbols-outlined text-[15px] shrink-0">error</span>
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-deep-coral/15 text-deep-coral flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-semibold text-on-surface">Automatic Academic Profiling</div>
                    <div className="text-on-surface-variant leading-relaxed">
                      In the next step, select your college and course. Nivora auto-detects your university, regulation, and loads official semester subjects without manual entry.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: ACADEMIC PROFILE                                  */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-deep-coral font-semibold">
                  Step 02 / Academics
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
                  Automatic Subject Selection
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Select your college. Nivora automatically resolves your university affiliation, available branches, and auto-fetches your official subjects.
                </p>
              </div>

              {collegeError && (
                <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{collegeError}</span>
                </div>
              )}

              <AutomaticSubjectSelector
                initialCollegeId={selectedCollegeId}
                initialCollegeName={college}
                initialBranchId={selectedBranchId}
                initialBranchName={stream}
                initialRegulation={regulation}
                initialSemester={parseInt(semester) || 1}
                onSelectionChange={(data) => {
                  setSelectedCollegeId(data.collegeId);
                  setCollege(data.collegeName);
                  setSelectedUniversityId(data.universityId);
                  setSelectedBranchId(data.branchId);
                  setStream(data.branchName);
                  setRegulation(data.regulation);
                  setSemester(String(data.semester));
                  const yr = Math.ceil(data.semester / 2);
                  const yrMap: Record<number, string> = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
                  setAcademicYear(yrMap[yr] || '1st Year');
                  if (collegeError) setCollegeError('');
                }}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: ACADEMIC GOALS                                    */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-deep-coral font-semibold">
                  Step 03 / Ambition
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
                  What are you working toward?
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Select the primary outcomes you want to achieve this term. Select all that apply.
                </p>
              </div>

              {/* Multi-Select Selectable Goal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {ACADEMIC_GOALS_OPTIONS.map((g) => {
                  const isSelected = selectedGoals.includes(g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isSelected
                          ? 'bg-surface-container-high border-deep-coral shadow-sm'
                          : 'bg-surface border-outline-variant/60 hover:border-coral/40'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                          isSelected ? 'text-deep-coral' : 'text-on-surface-variant'
                        }`}
                      >
                        {isSelected ? 'check_circle' : g.icon}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <div className={`text-xs font-semibold ${isSelected ? 'text-deep-coral' : 'text-on-surface'}`}>
                          {g.label}
                        </div>
                        <div className="text-[11px] text-on-surface-variant truncate">{g.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional CGPA Input */}
              <div className="pt-2 border-t border-outline-variant/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-on-surface-variant">Academic Performance Benchmarks</span>
                  <span className="text-[10px] font-mono text-on-surface-variant/80">Optional</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Current CGPA / %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={currentCgpa}
                      onChange={(e) => setCurrentCgpa(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:border-coral focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Target CGPA / %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={targetCgpa}
                      onChange={(e) => setTargetCgpa(e.target.value)}
                      placeholder="e.g. 9.5"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:border-coral focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: STUDY PREFERENCES                                 */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-deep-coral font-semibold">
                  Step 04 / Rhythm
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
                  How do you like to study?
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Nivora configures your focus timers, audio synthesis, and daily study blocks around your habits.
                </p>
              </div>

              <div className="space-y-5 pt-1">
                {/* Preferred Study Duration */}
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Preferred Study Duration
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {STUDY_DURATIONS.map((dur) => {
                      const isSelected = studyDuration === dur;
                      return (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setStudyDuration(dur)}
                          className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-deep-coral text-white border-deep-coral shadow-sm'
                              : 'bg-surface text-on-surface border-outline-variant/60 hover:border-coral/40'
                          }`}
                        >
                          {dur}
                        </button>
                      );
                    })}
                  </div>
                  {studyDuration === 'Custom' && (
                    <input
                      type="text"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="e.g. 75 min"
                      className="w-full mt-2 px-3.5 py-2 rounded-xl bg-surface border border-outline-variant/60 text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:border-coral focus:outline-none"
                    />
                  )}
                </div>

                {/* Preferred Study Time */}
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Preferred Study Time
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STUDY_TIMES.map((time) => {
                      const isSelected = preferredStudyTime === time.id;
                      return (
                        <div
                          key={time.id}
                          onClick={() => setPreferredStudyTime(time.id)}
                          className={`p-3 rounded-xl border cursor-pointer text-center space-y-1 transition-all select-none ${
                            isSelected
                              ? 'bg-surface-container-high border-deep-coral text-deep-coral font-semibold'
                              : 'bg-surface border-outline-variant/60 text-on-surface hover:border-coral/40'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{time.icon}</span>
                          <div className="text-xs font-semibold">{time.label}</div>
                          <div className="text-[10px] text-on-surface-variant">{time.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Study Style */}
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Study Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STUDY_STYLES.map((style) => {
                      const isSelected = studyStyle === style.id;
                      return (
                        <div
                          key={style.id}
                          onClick={() => setStudyStyle(style.id)}
                          className={`p-3 rounded-xl border cursor-pointer space-y-1 transition-all select-none ${
                            isSelected
                              ? 'bg-surface-container-high border-deep-coral text-deep-coral font-semibold'
                              : 'bg-surface border-outline-variant/60 text-on-surface hover:border-coral/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">{style.icon}</span>
                            <span className="text-xs font-semibold">{style.label}</span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant">{style.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Study Goal */}
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Daily Study Goal
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {DAILY_STUDY_GOALS.map((goal) => {
                      const isSelected = dailyStudyGoal === goal;
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setDailyStudyGoal(goal)}
                          className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-deep-coral text-white border-deep-coral shadow-sm'
                              : 'bg-surface text-on-surface border-outline-variant/60 hover:border-coral/40'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: INTERESTS                                         */}
          {/* ========================================================= */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-deep-coral font-semibold">
                  Step 05 / Growth
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
                  What do you want to grow?
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Select technical domains, professional skills, or topics you want surfaced on your dashboard.
                </p>
              </div>

              {/* Multi-Select Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all select-none flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-surface-container-high text-deep-coral border-deep-coral shadow-sm font-semibold'
                          : 'bg-surface text-on-surface border-outline-variant/60 hover:border-coral/40'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Other interests or areas (e.g. Quantum Computing, Public Speaking)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/60 text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:border-coral focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-between gap-3">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-on-surface hover:bg-surface-container-high transition-all text-xs font-medium flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-on-surface-variant hover:text-on-surface transition-all text-xs font-medium"
                >
                  Restart
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Skip option for optional steps (Step 3, 4, 5) */}
              {[3, 4, 5].includes(step) && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs text-on-surface-variant hover:text-on-surface transition-colors px-2 py-2 underline underline-offset-4"
                >
                  Skip for now
                </button>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isAdvancing}
                  className="px-6 py-2.5 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-deep-coral/20 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Building Node...' : 'Build My Nivora'}</span>
                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Bottom Help Note */}
      <footer className="w-full max-w-2xl mx-auto text-center pt-4">
        <p className="text-[11px] text-on-surface-variant/80">
          Tell us how you study, and we&apos;ll set up Nivora for you. All preferences can be fine-tuned in Settings later.
        </p>
      </footer>
    </div>
  );
}
