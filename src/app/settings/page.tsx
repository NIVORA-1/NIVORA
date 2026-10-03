'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme, ThemeMode, FontSize } from '@/context/ThemeContext';
import { useMusic } from '@/context/MusicContext';
import NivoraLogo from '@/components/ui/NivoraLogo';
import Link from 'next/link';

type SettingsTab =
  | 'profile'
  | 'appearance'
  | 'music'
  | 'study'
  | 'wellbeing'
  | 'notifications'
  | 'privacy'
  | 'security';

interface NavTabItem {
  id: SettingsTab;
  label: string;
  icon: string;
  description: string;
  keywords: string[];
}

const TABS: NavTabItem[] = [
  {
    id: 'profile',
    label: 'Profile & Account',
    icon: 'person',
    description: 'Personal details and verified academic identity',
    keywords: ['profile', 'account', 'name', 'email', 'avatar', 'college', 'academic', 'degree', 'stream', 'major', 'bio'],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: 'palette',
    description: 'Themes, typography scale, and contrast markers',
    keywords: ['appearance', 'theme', 'dark', 'light', 'system', 'font', 'size', 'contrast', 'style', 'color'],
  },
  {
    id: 'music',
    label: 'Music & Audio',
    icon: 'headphones',
    description: 'Mini player, master playback, and focus audio',
    keywords: ['music', 'audio', 'sound', 'player', 'mini', 'volume', 'autoplay', 'quality', 'track', 'binaural'],
  },
  {
    id: 'study',
    label: 'Study Experience',
    icon: 'schedule',
    description: 'Session lengths, break intervals, and daily targets',
    keywords: ['study', 'duration', 'break', 'focus', 'goal', 'pomodoro', 'session', 'rhythm', 'reminders'],
  },
  {
    id: 'wellbeing',
    label: 'Digital Wellbeing',
    icon: 'self_improvement',
    description: 'Dopamine limits, reels cap, and break prompts',
    keywords: ['wellbeing', 'digital', 'reels', 'shorts', 'doomscroll', 'balance', 'break', 'habit', 'reboot'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'notifications',
    description: 'Study reminders, briefings, and alert preferences',
    keywords: ['notifications', 'alerts', 'reminders', 'briefing', 'milestones', 'assignments', 'achievements'],
  },
  {
    id: 'privacy',
    label: 'Privacy & Data',
    icon: 'shield',
    description: 'Visibility, tracking toggles, and cache controls',
    keywords: ['privacy', 'data', 'visibility', 'tracking', 'history', 'cache', 'clear', 'storage'],
  },
  {
    id: 'security',
    label: 'Account & Security',
    icon: 'lock',
    description: 'Credentials, active sessions, and danger zone',
    keywords: ['security', 'password', 'sessions', 'auth', 'sign out', 'logout', 'delete', 'danger'],
  },
];

export default function SettingsPage() {
  const { user, refreshUser, doomscrollMins, setDoomscrollMins, logout } = useApp();
  const { themeMode, setThemeMode, fontSize, setFontSize, theme } = useTheme();
  const {
    enableMusicPlayer,
    setEnableMusicPlayer,
    autoplay,
    setAutoplay,
    defaultVolume,
    setDefaultVolume,
    playbackQuality,
    setPlaybackQuality,
    showMiniPlayer,
    setShowMiniPlayer,
    musicNotifications,
    setMusicNotifications,
    clearRecentlyPlayed,
    clearLocalPreferences,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Form States
  const [studentName, setStudentName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [stream, setStream] = useState('Computer Science & Engineering');
  const [academicYear, setAcademicYear] = useState(3);
  const [semester, setSemester] = useState(5);
  const [currentCgpa, setCurrentCgpa] = useState('9.42');
  const [targetCgpa, setTargetCgpa] = useState('9.80');
  const [careerGoal, setCareerGoal] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1');

  // Study Experience Form States
  const [studyDuration, setStudyDuration] = useState('50 min');
  const [breakDuration, setBreakDuration] = useState('10 min');
  const [studyStyle, setStudyStyle] = useState('Deep Focus');
  const [dailyStudyGoal, setDailyStudyGoal] = useState('3 hours');
  const [autoFocusMode, setAutoFocusMode] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);

  // Digital Wellbeing States
  const [localDoomscrollCap, setLocalDoomscrollCap] = useState(30);
  const [localReelThreshold, setLocalReelThreshold] = useState(30);
  const [breakReminder, setBreakReminder] = useState(true);
  const [reminderInterval, setReminderInterval] = useState('45 min');
  const [rebootReminder, setRebootReminder] = useState(true);

  // Notifications States
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [notifyStudyReminders, setNotifyStudyReminders] = useState(true);
  const [notifyAssignmentReminders, setNotifyAssignmentReminders] = useState(true);
  const [notifyMusic, setNotifyMusic] = useState(true);
  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyDailyBrief, setNotifyDailyBrief] = useState(true);

  // Privacy States
  const [profileVisibility, setProfileVisibility] = useState<'private' | 'only_me'>('private');
  const [activityTracking, setActivityTracking] = useState(true);
  const [recentlyPlayedHistory, setRecentlyPlayedHistory] = useState(true);

  // Appearance States
  const [highContrast, setHighContrast] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // General Feedback Pill
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Show subtle toast feedback
  const triggerFeedback = (msg = 'Preferences updated') => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2400);
  };

  // Populate from user profile
  useEffect(() => {
    if (user) {
      if (user.name) setStudentName(user.name);
      if (user.profile) {
        if (user.profile.college) setCollege(user.profile.college);
        if (user.profile.degree) setDegree(user.profile.degree);
        if (user.profile.stream) setStream(user.profile.stream);
        if (user.profile.year) setAcademicYear(user.profile.year);
        if (user.profile.semester) setSemester(user.profile.semester);
        if (user.profile.cgpa) setCurrentCgpa(String(user.profile.cgpa));
        if (user.profile.targetCgpa) setTargetCgpa(String(user.profile.targetCgpa));
        if (user.profile.careerGoal) setCareerGoal(user.profile.careerGoal);
        if (user.profile.bio) setBio(user.profile.bio);
        if (user.profile.studyDuration) setStudyDuration(user.profile.studyDuration);
        if (user.profile.studyStyle) setStudyStyle(user.profile.studyStyle);
        if (user.profile.dailyStudyGoal) setDailyStudyGoal(user.profile.dailyStudyGoal);
        if (user.profile.doomscrollCap) setLocalDoomscrollCap(user.profile.doomscrollCap);
        if (user.profile.reelThreshold) setLocalReelThreshold(user.profile.reelThreshold);
      }
    }
  }, [user]);

  // Load client preferences on mount
  useEffect(() => {
    try {
      const savedContrast = localStorage.getItem('nivora-high-contrast');
      if (savedContrast) setHighContrast(savedContrast === 'true');

      const savedBreakDur = localStorage.getItem('nivora-break-duration');
      if (savedBreakDur) setBreakDuration(savedBreakDur);

      const savedBreakReminder = localStorage.getItem('nivora-break-reminder');
      if (savedBreakReminder) setBreakReminder(savedBreakReminder === 'true');

      const savedInterval = localStorage.getItem('nivora-reminder-interval');
      if (savedInterval) setReminderInterval(savedInterval);

      const savedReboot = localStorage.getItem('nivora-reboot-reminder');
      if (savedReboot) setRebootReminder(savedReboot === 'true');

      const savedAutoFocus = localStorage.getItem('nivora-auto-focus');
      if (savedAutoFocus) setAutoFocusMode(savedAutoFocus === 'true');

      const savedVisibility = localStorage.getItem('nivora-visibility');
      if (savedVisibility === 'private' || savedVisibility === 'only_me') {
        setProfileVisibility(savedVisibility);
      }

      const savedActivity = localStorage.getItem('nivora-activity-tracking');
      if (savedActivity) setActivityTracking(savedActivity === 'true');

      const savedRecentHistory = localStorage.getItem('nivora-recent-history');
      if (savedRecentHistory) setRecentlyPlayedHistory(savedRecentHistory === 'true');

      const savedNotifyMaster = localStorage.getItem('nivora-notify-master');
      if (savedNotifyMaster) setAllowNotifications(savedNotifyMaster === 'true');
    } catch {}
  }, []);

  // Filter tabs by search
  const filteredTabs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return TABS;
    return TABS.filter((t) => {
      const inLabel = t.label.toLowerCase().includes(query);
      const inDesc = t.description.toLowerCase().includes(query);
      const inKeywords = t.keywords.some((k) => k.toLowerCase().includes(query));
      return inLabel || inDesc || inKeywords;
    });
  }, [searchQuery]);

  // If search causes active tab to be excluded, auto-select first match
  useEffect(() => {
    if (searchQuery && filteredTabs.length > 0) {
      if (!filteredTabs.some((t) => t.id === activeTab)) {
        setActiveTab(filteredTabs[0].id);
      }
    }
  }, [searchQuery, filteredTabs, activeTab]);

  // Save Profile (Full Name, College, Bio, Career Goal, CGPA)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          college,
          currentCgpa: currentCgpa ? parseFloat(currentCgpa) : null,
          targetCgpa: targetCgpa ? parseFloat(targetCgpa) : null,
          careerGoal,
          bio,
        }),
      });
      await refreshUser();
      triggerFeedback('Profile details updated');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Study Preferences
  const handleSaveStudyPreferences = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyDuration,
          studyStyle,
          dailyStudyGoal,
        }),
      });
      try {
        localStorage.setItem('nivora-break-duration', breakDuration);
        localStorage.setItem('nivora-auto-focus', String(autoFocusMode));
        localStorage.setItem('nivora-study-reminders', String(studyReminders));
      } catch {}
      await refreshUser();
      triggerFeedback('Study preferences saved');
    } catch (err) {
      console.error('Failed to save study preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Wellbeing Limits
  const handleSaveWellbeing = async () => {
    setIsSaving(true);
    try {
      setDoomscrollMins(localDoomscrollCap);
      try {
        localStorage.setItem('nivora-break-reminder', String(breakReminder));
        localStorage.setItem('nivora-reminder-interval', reminderInterval);
        localStorage.setItem('nivora-reboot-reminder', String(rebootReminder));
      } catch {}
      triggerFeedback('Wellbeing thresholds updated');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password.');
      } else {
        setPasswordSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        triggerFeedback('Password changed successfully');
      }
    } catch {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete account.');
        setIsDeletingAccount(false);
      } else {
        window.location.href = '/login';
      }
    } catch {
      setDeleteError('Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  // Auto-Save Toggle Helper
  const handleToggle = (
    key: string,
    currentVal: boolean,
    setter: (val: boolean) => void,
    feedbackText: string
  ) => {
    const nextVal = !currentVal;
    setter(nextVal);
    try {
      localStorage.setItem(key, String(nextVal));
    } catch {}
    triggerFeedback(feedbackText);
  };

  return (
    <div className="flex flex-col w-full space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200 select-none">
      {/* =================================================================== */}
      {/* HEADER                                                              */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-deep-coral uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-deep-coral animate-pulse" />
            <span>Workspace Settings</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface-variant">Personal Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
            Settings &amp; Preferences
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Personalize how Nivora looks, sounds, and supports your study routine.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Subtle Live Feedback Pill */}
          {feedbackMessage && (
            <div className="px-3.5 py-1.5 rounded-full bg-coral/15 border border-coral/40 text-xs font-semibold text-deep-coral flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>{feedbackMessage}</span>
            </div>
          )}
          <div className="shrink-0 hidden sm:block">
            <NivoraLogo size="medium" href="/home" />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SETTINGS SEARCH BAR                                                 */}
      {/* =================================================================== */}
      <div className="relative w-full max-w-md">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings (e.g. music, theme, password)..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant focus:border-deep-coral focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* =================================================================== */}
      {/* MAIN TWO-COLUMN LAYOUT                                              */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Desktop Vertical Navigation & Mobile Segmented Nav */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-2">
          {/* Mobile Dropdown Selector */}
          <div className="block lg:hidden">
            <label className="block text-[11px] font-mono text-on-surface-variant uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as SettingsTab)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface focus:border-deep-coral focus:outline-none"
            >
              {filteredTabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Left-Side Vertical Menu */}
          <div className="hidden lg:flex flex-col gap-1 rounded-2xl bg-surface-container/60 border border-outline-variant/30 p-2">
            {filteredTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-deep-coral text-white font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high '
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    {tab.icon}
                  </span>
                  <div className="min-w-0 flex-1 truncate font-medium">
                    {tab.label}
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-container-low" />
                  )}
                </button>
              );
            })}

            {filteredTabs.length === 0 && (
              <div className="p-4 text-center text-xs text-on-surface-variant">
                No settings match &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Active Tab Content Area */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* =============================================================== */}
          {/* 1. PROFILE & ACCOUNT                                            */}
          {/* =============================================================== */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                    Student Profile
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Manage your personal student identity and verified campus credentials
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-surface-container-high text-deep-coral font-semibold">
                  Verified Student
                </span>
              </div>

              {/* Read-Only Academic Profile Box */}
              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-deep-coral font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">school</span>
                    Academic Profile
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                    Read-Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[10px] font-mono text-on-surface-variant uppercase">Program &amp; Degree</div>
                    <div className="text-xs font-semibold text-on-surface">
                      {degree}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-on-surface-variant uppercase">Academic Stream &amp; Major</div>
                    <div className="text-xs font-semibold text-on-surface">
                      {stream}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-on-surface-variant uppercase">Current Academic Year</div>
                    <div className="text-xs font-semibold text-on-surface">
                      Year {academicYear} (Semester {semester})
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-on-surface-variant uppercase">College / Institution</div>
                    <div className="text-xs font-semibold text-on-surface">
                      {college || 'Campus Campus'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-deep-coral">auto_stories</span>
                    <span>Curriculum & subjects are automatically resolved from your college & syllabus catalog.</span>
                  </div>
                  <Link
                    href="/subjects?calibrate=true"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-lg bg-deep-coral/10 hover:bg-deep-coral/20 text-deep-coral border border-deep-coral/30 transition-colors w-fit"
                  >
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    Recalibrate Academic Profile
                  </Link>
                </div>
              </div>

              {/* Editable Profile Information Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Institutional Email (Read-Only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 text-on-surface-variant text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Campus / University Name
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentCgpa}
                      onChange={(e) => setCurrentCgpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Target CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={targetCgpa}
                      onChange={(e) => setTargetCgpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Career Aspiration
                  </label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Distributed Systems Engineer / Investment Banking Analyst"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Student Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short summary of your study focuses and interests..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* 2. APPEARANCE                                                   */}
          {/* =============================================================== */}
          {activeTab === 'appearance' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="border-b border-outline-variant/30 pb-4 space-y-0.5">
                <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                  Appearance &amp; Interface
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Configure your theme mode, interface typography, and contrast
                </p>
              </div>

              {/* Theme Mode Selector */}
              <div className="space-y-3">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'system', label: 'System Match', icon: 'desktop_windows', desc: 'Sync with operating system' },
                    { id: 'light', label: 'Light Mode', icon: 'light_mode', desc: 'Editorial warm canvas' },
                    { id: 'dark', label: 'Dark Mode', icon: 'dark_mode', desc: 'Nivora obsidian dark' },
                  ].map((m) => {
                    const isSelected = themeMode === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setThemeMode(m.id as ThemeMode);
                          triggerFeedback(`Theme updated to ${m.label}`);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer space-y-1.5 transition-all select-none ${
                          isSelected
                            ? 'bg-surface-container-high border-deep-coral text-deep-coral shadow-sm'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:border-coral/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="material-symbols-outlined text-[22px]">{m.icon}</span>
                          <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'border-deep-coral' : 'border-outline-variant'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-deep-coral" />}
                          </span>
                        </div>
                        <div className="text-xs font-semibold">{m.label}</div>
                        <div className="text-[10px] text-on-surface-variant">{m.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="pt-4 border-t border-outline-variant/20 space-y-3">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'compact', label: 'Compact', desc: '14px baseline' },
                    { id: 'default', label: 'Default', desc: '16px baseline' },
                    { id: 'large', label: 'Large', desc: '18px baseline' },
                  ].map((f) => {
                    const isSelected = fontSize === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFontSize(f.id as FontSize);
                          triggerFeedback(`Font size set to ${f.label}`);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-surface-container-high border-deep-coral text-deep-coral'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <div className="text-xs font-semibold">{f.label}</div>
                        <div className="text-[10px] text-on-surface-variant">{f.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent & High Contrast Toggle */}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-on-surface">
                    High Contrast Visual Markers
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    Increases card border clarity and accent saturation
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('nivora-high-contrast', highContrast, setHighContrast, 'Contrast updated')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                    highContrast ? 'bg-deep-coral' : 'bg-surface-container-highest'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                      highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 3. MUSIC & AUDIO                                                */}
          {/* =============================================================== */}
          {activeTab === 'music' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="border-b border-outline-variant/30 pb-4 space-y-0.5">
                <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                  Music &amp; Audio
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Configure your playback engine, mini player dock, and focus frequencies
                </p>
              </div>

              {/* Master Music Toggle */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-on-surface">
                    Enable Music Player
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    Allows audio playback and soundscapes across your workspace
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableMusicPlayer;
                    setEnableMusicPlayer(next);
                    triggerFeedback(next ? 'Music player enabled' : 'Music player disabled');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                    enableMusicPlayer ? 'bg-deep-coral' : 'bg-surface-container-highest'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                      enableMusicPlayer ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Autoplay & Mini Player Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-on-surface">
                      Autoplay
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      Continue last played track automatically
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoplay;
                      setAutoplay(next);
                      triggerFeedback(next ? 'Autoplay enabled' : 'Autoplay disabled');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      autoplay ? 'bg-deep-coral' : 'bg-surface-container-highest'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                        autoplay ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-on-surface">
                      Show Mini Player
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      Floating compact player outside of Music page
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showMiniPlayer;
                      setShowMiniPlayer(next);
                      triggerFeedback(next ? 'Mini player visible' : 'Mini player hidden outside Music');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      showMiniPlayer ? 'bg-deep-coral' : 'bg-surface-container-highest'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                        showMiniPlayer ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Default Volume Slider */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-on-surface">
                      Default Volume
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      Sets master volume for new playback sessions
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-deep-coral">
                    {Math.round(defaultVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={defaultVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDefaultVolume(val);
                  }}
                  className="w-full accent-deep-coral cursor-pointer"
                />
              </div>

              {/* Default Playback Quality & Notifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Default Playback Quality
                  </label>
                  <div className="flex gap-2">
                    {['standard', 'high'].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          setPlaybackQuality(q as 'standard' | 'high');
                          triggerFeedback(`Playback quality set to ${q}`);
                        }}
                        className={`flex-1 py-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          playbackQuality === q
                            ? 'bg-surface-container-high border-deep-coral text-deep-coral'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Music Notifications
                  </label>
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <span className="text-xs text-on-surface">Track alerts</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !musicNotifications;
                        setMusicNotifications(next);
                        triggerFeedback(next ? 'Music notifications on' : 'Music notifications off');
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        musicNotifications ? 'bg-deep-coral' : 'bg-surface-container-highest'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                          musicNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 4. STUDY EXPERIENCE                                             */}
          {/* =============================================================== */}
          {activeTab === 'study' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="border-b border-outline-variant/30 pb-4 space-y-0.5">
                <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                  Study Experience
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Configure your preferred study block durations, break rhythms, and daily targets
                </p>
              </div>

              <div className="space-y-4">
                {/* Default Study Duration */}
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Default Study Duration
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {['25 min', '45 min', '50 min', '60 min', '90 min'].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setStudyDuration(dur)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          studyDuration === dur
                            ? 'bg-deep-coral text-white border-deep-coral font-bold shadow-sm'
                            : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Break Duration */}
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Default Break Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['5 min', '10 min', '15 min'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBreakDuration(b)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          breakDuration === b
                            ? 'bg-deep-coral text-white border-deep-coral font-bold shadow-sm'
                            : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Study Goal */}
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Daily Study Goal
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['1 hour', '2 hours', '3 hours', '4+ hours'].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setDailyStudyGoal(goal)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          dailyStudyGoal === goal
                            ? 'bg-deep-coral text-white border-deep-coral font-bold shadow-sm'
                            : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Mode & Study Reminders Toggles */}
                <div className="pt-2 border-t border-outline-variant/20 space-y-3">
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-on-surface">
                        Focus Mode
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Automatically enable focus mode during active study sessions
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('nivora-auto-focus', autoFocusMode, setAutoFocusMode, 'Focus mode updated')}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        autoFocusMode ? 'bg-deep-coral' : 'bg-surface-container-highest'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                          autoFocusMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-on-surface">
                        Study Reminders
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Prompt scheduled study routines throughout the day
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('nivora-study-reminders', studyReminders, setStudyReminders, 'Reminders updated')}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        studyReminders ? 'bg-deep-coral' : 'bg-surface-container-highest'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                          studyReminders ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveStudyPreferences}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSaving ? 'Saving...' : 'Save Study Preferences'}</span>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 5. DIGITAL WELLBEING                                            */}
          {/* =============================================================== */}
          {activeTab === 'wellbeing' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="border-b border-outline-variant/30 pb-4 space-y-0.5">
                <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                  Digital Wellbeing &amp; Balance
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Protect cognitive focus from doomscrolling and short-form video dopamine cycles
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Daily Digital Balance (Doomscroll Cap)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={localDoomscrollCap}
                        onChange={(e) => setLocalDoomscrollCap(parseInt(e.target.value) || 30)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                      />
                      <span className="text-xs text-on-surface-variant font-mono">min</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Daily Reels / Shorts Threshold
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={localReelThreshold}
                        onChange={(e) => setLocalReelThreshold(parseInt(e.target.value) || 30)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                      />
                      <span className="text-xs text-on-surface-variant font-mono">reels</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 space-y-3">
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-on-surface">
                        Break Reminder
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Subtle notification prompting eye rest and hydration
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('nivora-break-reminder', breakReminder, setBreakReminder, 'Break reminder updated')}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        breakReminder ? 'bg-deep-coral' : 'bg-surface-container-highest'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                          breakReminder ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Reminder Interval
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['30 min', '45 min', '60 min'].map((inv) => (
                        <button
                          key={inv}
                          type="button"
                          onClick={() => {
                            setReminderInterval(inv);
                            try { localStorage.setItem('nivora-reminder-interval', inv); } catch {}
                            triggerFeedback(`Interval set to ${inv}`);
                          }}
                          className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                            reminderInterval === inv
                              ? 'bg-surface-container-high border-deep-coral text-deep-coral'
                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                          }`}
                        >
                          {inv}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-on-surface">
                        Reboot / Habit Reminder
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Triggers dopamine reset guidance when threshold is met
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('nivora-reboot-reminder', rebootReminder, setRebootReminder, 'Reboot reminder updated')}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        rebootReminder ? 'bg-deep-coral' : 'bg-surface-container-highest'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                          rebootReminder ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveWellbeing}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSaving ? 'Saving...' : 'Save Wellbeing Limits'}</span>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 6. NOTIFICATIONS                                                */}
          {/* =============================================================== */}
          {activeTab === 'notifications' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="border-b border-outline-variant/30 pb-4 space-y-0.5">
                <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                  Notifications
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Manage milestone alerts, schedule briefings, and study notifications
                </p>
              </div>

              {/* Master Allow Notifications */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-on-surface">
                    Allow Notifications
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    Master toggle for all in-app and browser notifications
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('nivora-notify-master', allowNotifications, setAllowNotifications, 'Notifications toggle updated')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                    allowNotifications ? 'bg-deep-coral' : 'bg-surface-container-highest'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                      allowNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'study',
                    label: 'Study Reminders',
                    desc: 'Alerts when scheduled study blocks begin',
                    val: notifyStudyReminders,
                    set: setNotifyStudyReminders,
                  },
                  {
                    id: 'assignment',
                    label: 'Assignment Reminders',
                    desc: 'Deadlines approaching within 48 hours',
                    val: notifyAssignmentReminders,
                    set: setNotifyAssignmentReminders,
                  },
                  {
                    id: 'music-notif',
                    label: 'Music Notifications',
                    desc: 'Audio mode transitions and session completion prompts',
                    val: notifyMusic,
                    set: setNotifyMusic,
                  },
                  {
                    id: 'achievement',
                    label: 'Achievement Notifications',
                    desc: 'Unlocks, streak milestones, and study badges',
                    val: notifyAchievements,
                    set: setNotifyAchievements,
                  },
                  {
                    id: 'briefing',
                    label: 'Daily Morning Schedule Briefing',
                    desc: 'Summary of daily syllabus commitments at 8:00 AM',
                    val: notifyDailyBrief,
                    set: setNotifyDailyBrief,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-on-surface">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {item.desc}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!allowNotifications}
                      onClick={() => handleToggle(`nivora-notify-${item.id}`, item.val, item.set, `${item.label} updated`)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 cursor-pointer disabled:opacity-40 ${
                        item.val && allowNotifications ? 'bg-deep-coral' : 'bg-surface-container-highest'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                          item.val && allowNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 7. PRIVACY & DATA                                               */}
          {/* =============================================================== */}
          {activeTab === 'privacy' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-6 shadow-sm">
              <div className="border-b border-outline-variant/30 pb-4 space-y-0.5">
                <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                  Privacy &amp; Data
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Manage profile visibility, activity recording, and local client caches
                </p>
              </div>

              {/* Profile Visibility */}
              <div className="space-y-3">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Profile Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'private', label: 'Private', desc: 'Hidden from campus search' },
                    { id: 'only_me', label: 'Only Me', desc: 'Strict isolated workspace' },
                  ].map((v) => {
                    const isSelected = profileVisibility === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setProfileVisibility(v.id as any);
                          try { localStorage.setItem('nivora-visibility', v.id); } catch {}
                          triggerFeedback(`Visibility set to ${v.label}`);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-surface-container-high border-deep-coral text-deep-coral'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <div className="text-xs font-semibold">{v.label}</div>
                        <div className="text-[10px] text-on-surface-variant">{v.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activity Tracking Toggles */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/20">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-on-surface">
                      Activity Tracking
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      Record study streaks, completed topics, and focus scores
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('nivora-activity-tracking', activityTracking, setActivityTracking, 'Activity tracking updated')}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      activityTracking ? 'bg-deep-coral' : 'bg-surface-container-highest'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                        activityTracking ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-on-surface">
                      Recently Played History
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      Save recently played focus tracks in local store
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('nivora-recent-history', recentlyPlayedHistory, setRecentlyPlayedHistory, 'Recent history updated')}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      recentlyPlayedHistory ? 'bg-deep-coral' : 'bg-surface-container-highest'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                        recentlyPlayedHistory ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Data & Cache Clear Controls */}
              <div className="pt-2 border-t border-outline-variant/20 space-y-3">
                <div className="text-xs font-semibold text-on-surface">
                  Storage &amp; Local Preferences
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Clear client-side playback caches and reset local settings without modifying your official academic record.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      clearRecentlyPlayed();
                      triggerFeedback('Recently played history cleared');
                    }}
                    className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high  transition-all text-xs font-medium cursor-pointer"
                  >
                    Clear Recently Played
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearLocalPreferences();
                      triggerFeedback('Local preferences reset to defaults');
                    }}
                    className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high  transition-all text-xs font-medium cursor-pointer"
                  >
                    Clear Local Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 8. ACCOUNT & SECURITY                                           */}
          {/* =============================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4 shadow-sm">
                <div className="border-b border-outline-variant/30 pb-3 space-y-0.5">
                  <h2 className="text-base sm:text-lg font-semibold text-on-surface">
                    Account Security
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Update your account password and review active device sessions
                  </p>
                </div>

                <form onSubmit={handleChangePassword} autoComplete="off" className="space-y-3.5 max-w-lg">
                  {passwordError && (
                    <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 text-error text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span>{passwordError}</span>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 rounded-xl bg-coral/15 border border-coral/30 text-deep-coral text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      New Password (Min 8 Characters)
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-deep-coral focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-deep-coral hover:underline"
                    >
                      Forgot password?
                    </Link>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-5 py-2.5 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <span>{isChangingPassword ? 'Updating...' : 'Change Password'}</span>
                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Sessions Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4 shadow-sm">
                <div className="border-b border-outline-variant/30 pb-3 space-y-0.5">
                  <h3 className="text-sm font-semibold text-on-surface">
                    Active Authenticated Sessions
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Current logged-in session connected to this browser
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-deep-coral">
                      <span className="material-symbols-outlined text-[20px]">laptop_chromebook</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-on-surface flex items-center gap-2">
                        <span>Current Browser Session</span>
                        <span className="px-1.5 py-0.2 rounded bg-coral/20 text-deep-coral font-mono text-[9px] font-bold">
                          ACTIVE NOW
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Signed in as <span className="text-deep-coral font-mono">{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-medium hover:border-deep-coral transition-all cursor-pointer self-start sm:self-auto"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* DANGER ZONE */}
              <div className="p-6 sm:p-8 rounded-2xl bg-error-container/20 border border-error/30 space-y-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-error font-mono text-[11px] uppercase tracking-wider font-semibold">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Danger Zone
                  </div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    Irreversible Account Actions
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Destructive operations that immediately affect your workspace access and personal data
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="px-4 py-2.5 rounded-xl bg-error-container/30 border border-error/40 text-error text-xs font-semibold hover:bg-red-950/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out of Nivora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeletePassword('');
                      setDeleteError('');
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-error-container/40 border border-error/60 text-error text-xs font-semibold hover:bg-deep-coral/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* SECURE DELETE ACCOUNT CONFIRMATION MODAL                            */}
      {/* =================================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-surface-container border border-error/40 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-error">
              <span className="material-symbols-outlined text-[26px]">delete_forever</span>
              <h3 className="text-base font-semibold text-on-surface">
                Permanently Delete Account?
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              This action cannot be undone. All your study schedules, topic mastery records, focus session histories, and uploaded tracks will be permanently wiped.
            </p>

            <form onSubmit={handleDeleteAccount} autoComplete="off" className="space-y-3 pt-1">
              {deleteError && (
                <div className="p-3 rounded-xl bg-error-container/40 border border-error/50 text-error text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  name="confirm_delete_password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  placeholder="Your account password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:border-red-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-all text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount}
                  className="px-5 py-2 rounded-xl bg-deep-coral text-white hover:bg-coral transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>{isDeletingAccount ? 'Deleting...' : 'Confirm Deletion'}</span>
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
