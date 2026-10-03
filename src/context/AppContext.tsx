'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  category: 'gamma' | 'rain' | 'focus' | 'lofi';
  freq?: number; // for Web Audio binaural generation
}

export interface StudentProfileData {
  id: string;
  userId: string;
  college: string;
  degree: string;
  stream: string;
  streamCode: string;
  specialization: string;
  year: number;
  semester: number;
  cgpa: number;
  streakDays: number;
  modulesVerified: number;
  totalModules: number;
  hoursPacedWeek: number;
  focusScore: number;
  reelsToday: number;
  reelThreshold: number;
  doomscrollMins: number;
  doomscrollCap: number;
  careerGoal: string;
  bio?: string | null;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  academicGoals?: string[];
  targetCgpa?: number | null;
  studyDuration?: string | null;
  preferredStudyTime?: string | null;
  studyStyle?: string | null;
  dailyStudyGoal?: string | null;
  interests?: string[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  profile?: StudentProfileData | null;
}

export const PRESET_TRACKS: AudioTrack[] = [
  { id: '1', title: '40Hz Gamma Focus', subtitle: 'Binaural • Neuro-locked alpha frequency', category: 'gamma', freq: 40 },
  { id: '2', title: 'Library Rain on Glass', subtitle: 'Bodleian library acoustics & soft rain', category: 'rain' },
  { id: '3', title: 'Deep Academic Flow', subtitle: 'Low-BPM minimalist organic synth', category: 'focus', freq: 14 },
  { id: '4', title: 'Lofi Study Companion', subtitle: 'Analog tape saturation, warm beats', category: 'lofi' },
];

interface AppContextType {
  // User Authentication & Profile
  user: UserData | null;
  isLoadingUser: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;

  // Navigation & Shell
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (v: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (v: boolean) => void;
  isAiAssistOpen: boolean;
  setIsAiAssistOpen: (v: boolean) => void;
  aiAssistContext: { subject?: string; topic?: string } | null;
  setAiAssistContext: (ctx: { subject?: string; topic?: string } | null) => void;
  openAiWithContext: (ctx: { subject?: string; topic?: string }) => void;
  
  // Stream Personalization
  currentStream: string;
  setCurrentStream: (stream: string) => void;

  // Audio Engine
  currentTrack: AudioTrack;
  isPlaying: boolean;
  volume: number;
  setVolume: (vol: number) => void;
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;

  // Reboot & Wellbeing State
  reelsToday: number;
  setReelsToday: React.Dispatch<React.SetStateAction<number>>;
  doomscrollMins: number;
  setDoomscrollMins: React.Dispatch<React.SetStateAction<number>>;
  focusScore: number;
  setFocusScore: React.Dispatch<React.SetStateAction<number>>;
  isResetTimerActive: boolean;
  resetTimerSeconds: number;
  startResetSession: (mins?: number) => void;
  stopResetSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // User Authentication State
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Shell State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAiAssistOpen, setIsAiAssistOpen] = useState(false);
  const [aiAssistContext, setAiAssistContext] = useState<{ subject?: string; topic?: string } | null>(null);

  const openAiWithContext = useCallback((ctx: { subject?: string; topic?: string }) => {
    setAiAssistContext(ctx);
    setIsAiAssistOpen(true);
  }, []);

  const [currentStream, setCurrentStream] = useState('CSE');

  // Audio Engine
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(PRESET_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscNodes, setOscNodes] = useState<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Reboot state
  const [reelsToday, setReelsToday] = useState(15);
  const [doomscrollMins, setDoomscrollMins] = useState(12);
  const [focusScore, setFocusScore] = useState(80);
  const [isResetTimerActive, setIsResetTimerActive] = useState(false);
  const [resetTimerSeconds, setResetTimerSeconds] = useState(25 * 60);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.profile) {
          if (data.user.profile.streamCode) {
            setCurrentStream(data.user.profile.streamCode);
          }
          if (typeof data.user.profile.reelsToday === 'number') {
            setReelsToday(data.user.profile.reelsToday);
          }
          if (typeof data.user.profile.doomscrollMins === 'number') {
            setDoomscrollMins(data.user.profile.doomscrollMins);
          }
          if (typeof data.user.profile.focusScore === 'number') {
            setFocusScore(data.user.profile.focusScore);
          }
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    try {
      const { createSupabaseBrowserClient, isSupabaseConfigured } = await import('@/lib/supabase/client');
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut().catch(() => {});
      }
    } catch {}
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    window.location.href = '/login';
  };

  // Keyboard shortcut listener for ⌘K / Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Web Audio synthesizer for real binaural beats & soothing soundscapes
  const startSynth = (freq: number) => {
    try {
      const ctx = audioCtx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      setAudioCtx(ctx);

      // Stop previous
      if (oscNodes) {
        oscNodes.osc1.stop();
        oscNodes.osc2.stop();
      }

      const baseFreq = 220; // A3 carrier tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq + freq, ctx.currentTime); // Creates binaural beat diff

      gain.gain.setValueAtTime(volume * 0.08, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      setOscNodes({ osc1, osc2, gain });
    } catch {
      // AudioContext unavailable
    }
  };

  const stopSynth = () => {
    if (oscNodes) {
      try {
        oscNodes.osc1.stop();
        oscNodes.osc2.stop();
        oscNodes.osc1.disconnect();
        oscNodes.osc2.disconnect();
      } catch {}
      setOscNodes(null);
    }
  };

  const playTrack = (track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (track.freq) {
      startSynth(track.freq);
    } else {
      startSynth(10); // calming low alpha
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSynth();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentTrack.freq) {
        startSynth(currentTrack.freq);
      } else {
        startSynth(10);
      }
    }
  };

  useEffect(() => {
    if (oscNodes && audioCtx) {
      oscNodes.gain.gain.setValueAtTime(volume * 0.08, audioCtx.currentTime);
    }
  }, [volume, oscNodes, audioCtx]);

  // Reset timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResetTimerActive && resetTimerSeconds > 0) {
      interval = setInterval(() => {
        setResetTimerSeconds((s) => s - 1);
      }, 1000);
    } else if (resetTimerSeconds === 0 && isResetTimerActive) {
      setIsResetTimerActive(false);
      setFocusScore((prev) => Math.min(100, prev + 5));
      try {
        fetch('/api/reboot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durationMins: 25 }),
        });
      } catch {}
      alert("✨ Reset Focus Session Complete! +5 points added to your Cognitive Index.");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResetTimerActive, resetTimerSeconds]);

  const startResetSession = (mins = 25) => {
    setResetTimerSeconds(mins * 60);
    setIsResetTimerActive(true);
    if (!isPlaying) {
      playTrack(PRESET_TRACKS[0]); // Start 40Hz Gamma Focus automatically
    }
  };

  const stopResetSession = () => {
    setIsResetTimerActive(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoadingUser,
        refreshUser,
        logout,
        isSidebarOpen,
        setIsSidebarOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isAiAssistOpen,
        setIsAiAssistOpen,
        aiAssistContext,
        setAiAssistContext,
        openAiWithContext,
        currentStream,
        setCurrentStream,
        currentTrack,
        isPlaying,
        volume,
        setVolume,
        playTrack,
        togglePlay,
        reelsToday,
        setReelsToday,
        doomscrollMins,
        setDoomscrollMins,
        focusScore,
        setFocusScore,
        isResetTimerActive,
        resetTimerSeconds,
        startResetSession,
        stopResetSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
