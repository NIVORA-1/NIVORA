'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import {
  Track,
  Playlist,
  CampusLounge,
  MusicCategory,
  TRACKS,
  DEFAULT_PLAYLISTS,
  CAMPUS_LOUNGES,
  mapDbTrackToTrack,
} from '@/lib/musicData';
import {
  getLikedTrackIds,
  toggleLikeTrack,
  isLikedTrack,
  getAllPlaylists,
  createCustomPlaylist,
  deleteCustomPlaylist,
  addTrackToPlaylist as addTrackToStore,
  removeTrackFromPlaylist as removeTrackFromStore,
  getRecentlyPlayedTrackIds,
  recordRecentlyPlayed,
  getPlaybackPreferences,
  savePlaybackPreferences,
  getImportedTracks,
  addImportedTracks,
  removeImportedTrack,
  saveImportedTracks,
  clearRecentlyPlayed as clearRecentlyPlayedStore,
  clearLocalPreferences as clearLocalPreferencesStore,
} from '@/lib/musicStore';

export interface ActiveFocusSession {
  name: string;
  totalMins: number;
  secondsLeft: number;
  isComplete: boolean;
}

interface MusicContextType {
  // Active state
  currentTrack: Track;
  isPlaying: boolean;
  playbackPosition: number; // in seconds
  duration: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  history: Track[];
  likedTrackIds: string[];
  playlists: Playlist[];
  activeLounge: CampusLounge | null;
  activeFocusSession: ActiveFocusSession | null;
  activeContextId: string | null;
  setActiveContextId: (id: string | null) => void;

  // Modals & Panels
  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  isCreatePlaylistOpen: boolean;
  setIsCreatePlaylistOpen: (open: boolean) => void;
  isImporterOpen: boolean;
  setIsImporterOpen: (open: boolean) => void;
  selectedLoungeForModal: CampusLounge | null;
  setSelectedLoungeForModal: (lounge: CampusLounge | null) => void;

  // Analyser node for visualizers
  getFrequencyData: (dataArray: Uint8Array) => void;

  // Playback actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  // Queue actions
  addToQueue: (track: Track, playNext?: boolean) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIdx: number, toIdx: number) => void;
  clearQueue: () => void;

  // Library & Playlists
  allTracks: Track[];
  importedTracks: Track[];
  toggleLike: (trackId: string) => boolean;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  importTracks: (tracks: Track[]) => void;
  deleteTrack: (trackId: string) => Promise<void>;
  bulkDeleteTracks: (trackIds: string[]) => Promise<void>;
  bulkUpdateCategory: (trackIds: string[], category: MusicCategory) => Promise<void>;
  bulkAddToPlaylist: (trackIds: string[], playlistId: string) => void;
  refreshLibrary: () => Promise<void>;

  // Lounge & Focus engine
  joinLounge: (lounge: CampusLounge) => void;
  leaveLounge: () => void;
  startContextFocusSession: (name: string, mins: number, contextId?: string) => void;
  stopContextFocusSession: () => void;
  dismissFocusCompletion: () => void;

  // Settings & Preferences
  enableMusicPlayer: boolean;
  setEnableMusicPlayer: (enable: boolean) => void;
  autoplay: boolean;
  setAutoplay: (autoplay: boolean) => void;
  defaultVolume: number;
  setDefaultVolume: (vol: number) => void;
  playbackQuality: 'standard' | 'high';
  setPlaybackQuality: (quality: 'standard' | 'high') => void;
  showMiniPlayer: boolean;
  setShowMiniPlayer: (show: boolean) => void;
  musicNotifications: boolean;
  setMusicNotifications: (notify: boolean) => void;
  hasEverPlayed: boolean;
  setHasEverPlayed: (hasPlayed: boolean) => void;
  isMiniPlayerMinimized: boolean;
  setIsMiniPlayerMinimized: (minimized: boolean) => void;
  clearRecentlyPlayed: () => void;
  clearLocalPreferences: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  // Load saved preferences
  const initialPrefs = useRef(getPlaybackPreferences());
  const initialTrack = TRACKS.find((t) => t.id === initialPrefs.current.lastTrackId) || TRACKS[0];

  const [currentTrack, setCurrentTrack] = useState<Track>(initialTrack);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialTrack.duration);
  const [volume, setVolumeState] = useState<number>(initialPrefs.current.volume);
  const [isMuted, setIsMuted] = useState<boolean>(initialPrefs.current.isMuted);
  const [shuffle, setShuffle] = useState<boolean>(initialPrefs.current.shuffle);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>(initialPrefs.current.repeatMode);

  // Queue & History
  const [queue, setQueue] = useState<Track[]>(() => {
    // Initial up-next queue from TRACKS
    return TRACKS.filter((t) => t.id !== initialTrack.id).slice(0, 8);
  });
  const [history, setHistory] = useState<Track[]>([]);

  // User Library
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);

  // Lounges & Context
  const [activeLounge, setActiveLounge] = useState<CampusLounge | null>(null);
  const [activeFocusSession, setActiveFocusSession] = useState<ActiveFocusSession | null>(null);
  const [activeContextId, setActiveContextId] = useState<string | null>('context-focus');

  // Modals
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [selectedLoungeForModal, setSelectedLoungeForModal] = useState<CampusLounge | null>(null);

  // Playback & Shell Preferences
  const [enableMusicPlayer, setEnableMusicPlayerState] = useState<boolean>(initialPrefs.current.enableMusicPlayer ?? true);
  const [autoplay, setAutoplayState] = useState<boolean>(initialPrefs.current.autoplay ?? false);
  const [defaultVolume, setDefaultVolumeState] = useState<number>(initialPrefs.current.defaultVolume ?? 0.65);
  const [playbackQuality, setPlaybackQualityState] = useState<'standard' | 'high'>(initialPrefs.current.playbackQuality ?? 'high');
  const [showMiniPlayer, setShowMiniPlayerState] = useState<boolean>(initialPrefs.current.showMiniPlayer ?? true);
  const [musicNotifications, setMusicNotificationsState] = useState<boolean>(initialPrefs.current.musicNotifications ?? true);
  const [hasEverPlayed, setHasEverPlayedState] = useState<boolean>(initialPrefs.current.hasEverPlayed ?? false);
  const [isMiniPlayerMinimized, setIsMiniPlayerMinimizedState] = useState<boolean>(initialPrefs.current.isMiniPlayerMinimized ?? false);

  // Dynamic Imported Tracks
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);

  // Web Audio Context & Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<{
    oscillators?: OscillatorNode[];
    noiseSource?: AudioBufferSourceNode;
    gains?: GainNode[];
    filters?: BiquadFilterNode[];
  } | null>(null);

  // HTMLAudioElement for local MP3 and external audio files
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceConnectedRef = useRef<boolean>(false);

  // Load client store data & server database tracks on mount
  useEffect(() => {
    setLikedTrackIds(getLikedTrackIds());
    setPlaylists(getAllPlaylists());
    const local = getImportedTracks();
    setImportedTracks(local);

    const loadServerTracks = async () => {
      try {
        const res = await fetch('/api/music/tracks');
        if (res.ok) {
          const data = await res.json();
          if (data.tracks && Array.isArray(data.tracks)) {
            const formatted = data.tracks.map(mapDbTrackToTrack);
            const merged = addImportedTracks(formatted);
            setImportedTracks(merged);
          }
        }
      } catch (err) {
        console.warn('Failed to load server tracks:', err);
      }
    };
    loadServerTracks();
  }, []);

  // Merged dynamic catalog (built-in curated tracks + user imported tracks)
  const allTracks = useMemo(() => {
    const map = new Map<string, Track>();
    TRACKS.forEach((t) => map.set(t.id, t));
    importedTracks.forEach((t) => map.set(t.id, t));
    return Array.from(map.values());
  }, [importedTracks]);

  // Update duration when currentTrack changes
  useEffect(() => {
    setDuration(currentTrack.duration);
    setPlaybackPosition(0);
    recordRecentlyPlayed(currentTrack.id);
    savePlaybackPreferences({ lastTrackId: currentTrack.id });
  }, [currentTrack]);

  // Ensure AudioContext is initialized
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const masterGain = ctx.createGain();
      const effectiveVol = isMuted ? 0 : volume * 0.09;
      masterGain.gain.setValueAtTime(effectiveVol, ctx.currentTime);

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      masterGainRef.current = masterGain;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return {
      ctx: audioCtxRef.current,
      analyser: analyserRef.current,
      masterGain: masterGainRef.current,
    };
  }, [volume, isMuted]);

  // Stop active synthesis generators and audio element
  const stopSynthesizer = useCallback(() => {
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
      } catch {}
    }
    if (activeNodesRef.current) {
      const { oscillators, noiseSource, gains } = activeNodesRef.current;
      const ctx = audioCtxRef.current;
      const now = ctx ? ctx.currentTime : 0;

      // Soft release
      if (gains && ctx) {
        gains.forEach((g) => {
          try {
            g.gain.setTargetAtTime(0, now, 0.05);
          } catch {}
        });
      }

      setTimeout(() => {
        if (oscillators) {
          oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
        }
        if (noiseSource) {
          try {
            noiseSource.stop();
            noiseSource.disconnect();
          } catch {}
        }
        activeNodesRef.current = null;
      }, 70);
    }
  }, []);

  // Procedural Web Audio generator for any track
  const startSynthesizer = useCallback(
    (track: Track) => {
      stopSynthesizer();
      const { ctx, masterGain } = getAudioContext();
      if (!ctx || !masterGain) return;

      const now = ctx.currentTime;
      const oscList: OscillatorNode[] = [];
      const gainList: GainNode[] = [];
      const filterList: BiquadFilterNode[] = [];
      let noiseNode: AudioBufferSourceNode | undefined;

      switch (track.soundType) {
        case 'binaural': {
          // Precise dual carrier tones with stereo separation
          const baseFreq = track.baseTone || 216;
          const diff = track.freq || 40;

          const oscLeft = ctx.createOscillator();
          const oscRight = ctx.createOscillator();
          const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          const trackGain = ctx.createGain();

          oscLeft.type = 'sine';
          oscLeft.frequency.setValueAtTime(baseFreq, now);

          oscRight.type = 'sine';
          oscRight.frequency.setValueAtTime(baseFreq + diff, now);

          trackGain.gain.setValueAtTime(0.001, now);
          trackGain.gain.exponentialRampToValueAtTime(1.0, now + 0.1);

          if (pannerLeft && pannerRight) {
            pannerLeft.pan.setValueAtTime(-0.85, now);
            pannerRight.pan.setValueAtTime(0.85, now);
            oscLeft.connect(pannerLeft);
            oscRight.connect(pannerRight);
            pannerLeft.connect(trackGain);
            pannerRight.connect(trackGain);
          } else {
            oscLeft.connect(trackGain);
            oscRight.connect(trackGain);
          }

          trackGain.connect(masterGain);
          oscLeft.start(now);
          oscRight.start(now);

          oscList.push(oscLeft, oscRight);
          gainList.push(trackGain);
          break;
        }

        case 'rain': {
          // Filtered pink noise with soft resonance
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          noise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.Q.setValueAtTime(1.2, now);

          const trackGain = ctx.createGain();
          trackGain.gain.setValueAtTime(0.001, now);
          trackGain.gain.exponentialRampToValueAtTime(0.9, now + 0.1);

          noise.connect(filter);
          filter.connect(trackGain);
          trackGain.connect(masterGain);
          noise.start(now);

          noiseNode = noise;
          filterList.push(filter);
          gainList.push(trackGain);
          break;
        }

        case 'drone':
        case 'ambient': {
          // Lush harmonic ambient pads with gentle detuning
          const root = track.baseTone || 144;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const osc3 = ctx.createOscillator();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(root, now);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(root * 1.5, now); // Fifth

          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(root * 2.01, now); // Octave detuned

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now);

          const trackGain = ctx.createGain();
          trackGain.gain.setValueAtTime(0.001, now);
          trackGain.gain.exponentialRampToValueAtTime(0.7, now + 0.2);

          osc1.connect(filter);
          osc2.connect(filter);
          osc3.connect(filter);
          filter.connect(trackGain);
          trackGain.connect(masterGain);

          osc1.start(now);
          osc2.start(now);
          osc3.start(now);

          oscList.push(osc1, osc2, osc3);
          filterList.push(filter);
          gainList.push(trackGain);
          break;
        }

        case 'lofi': {
          // Warm 7th chord cadence & subtle tape saturation
          const root = 130.81; // C3
          const notes = [root, root * 1.2, root * 1.5, root * 1.875]; // Maj7 chord
          const trackGain = ctx.createGain();
          trackGain.gain.setValueAtTime(0.001, now);
          trackGain.gain.exponentialRampToValueAtTime(0.65, now + 0.1);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);

          notes.forEach((freq) => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.connect(filter);
            osc.start(now);
            oscList.push(osc);
          });

          filter.connect(trackGain);
          trackGain.connect(masterGain);

          filterList.push(filter);
          gainList.push(trackGain);
          break;
        }

        case 'nature':
        case 'noise':
        default: {
          // Oceanic brown noise / organic focus
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          noise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, now);

          const trackGain = ctx.createGain();
          trackGain.gain.setValueAtTime(0.001, now);
          trackGain.gain.exponentialRampToValueAtTime(0.75, now + 0.1);

          noise.connect(filter);
          filter.connect(trackGain);
          trackGain.connect(masterGain);
          noise.start(now);

          noiseNode = noise;
          filterList.push(filter);
          gainList.push(trackGain);
          break;
        }
      }

      activeNodesRef.current = {
        oscillators: oscList,
        noiseSource: noiseNode,
        gains: gainList,
        filters: filterList,
      };
    },
    [getAudioContext, stopSynthesizer]
  );

  const setEnableMusicPlayer = useCallback((enable: boolean) => {
    setEnableMusicPlayerState(enable);
    savePlaybackPreferences({ enableMusicPlayer: enable });
    if (!enable) {
      stopSynthesizer();
      if (audioElRef.current) {
        try { audioElRef.current.pause(); } catch {}
      }
      setIsPlaying(false);
    }
  }, [stopSynthesizer]);

  const setAutoplay = useCallback((auto: boolean) => {
    setAutoplayState(auto);
    savePlaybackPreferences({ autoplay: auto });
  }, []);

  const setDefaultVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    setDefaultVolumeState(clamped);
    setVolumeState(clamped);
    savePlaybackPreferences({ defaultVolume: clamped, volume: clamped });
  }, []);

  const setPlaybackQuality = useCallback((qual: 'standard' | 'high') => {
    setPlaybackQualityState(qual);
    savePlaybackPreferences({ playbackQuality: qual });
  }, []);

  const setShowMiniPlayer = useCallback((show: boolean) => {
    setShowMiniPlayerState(show);
    savePlaybackPreferences({ showMiniPlayer: show });
  }, []);

  const setMusicNotifications = useCallback((notify: boolean) => {
    setMusicNotificationsState(notify);
    savePlaybackPreferences({ musicNotifications: notify });
  }, []);

  const setHasEverPlayed = useCallback((val: boolean) => {
    setHasEverPlayedState(val);
    savePlaybackPreferences({ hasEverPlayed: val });
  }, []);

  const setIsMiniPlayerMinimized = useCallback((val: boolean) => {
    setIsMiniPlayerMinimizedState(val);
    savePlaybackPreferences({ isMiniPlayerMinimized: val });
  }, []);

  const clearRecentlyPlayed = useCallback(() => {
    clearRecentlyPlayedStore();
  }, []);

  const clearLocalPreferences = useCallback(() => {
    clearLocalPreferencesStore();
    setEnableMusicPlayerState(true);
    setAutoplayState(false);
    setDefaultVolumeState(0.65);
    setPlaybackQualityState('high');
    setShowMiniPlayerState(true);
    setMusicNotificationsState(true);
    setHasEverPlayedState(false);
    setIsMiniPlayerMinimizedState(false);
  }, []);

  // Synchronize Master Gain when volume / mute changes
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const target = isMuted ? 0 : volume * 0.09;
      masterGainRef.current.gain.setTargetAtTime(target, audioCtxRef.current.currentTime, 0.05);
    }
    savePlaybackPreferences({ volume, isMuted });
  }, [volume, isMuted]);

  // Helper to start playback for any track (either local MP3 or procedural synthesizer)
  const startPlaybackForTrack = useCallback(
    (track: Track, startPosition = 0) => {
      if (track.audioSrc) {
        // Stop procedural synthesizer
        stopSynthesizer();

        // Ensure AudioContext is ready for oscilloscope/visualizer
        const { ctx, analyser, masterGain } = getAudioContext();

        if (!audioElRef.current && typeof window !== 'undefined') {
          audioElRef.current = new Audio();
          audioElRef.current.preload = 'auto';
        }

        const audio = audioElRef.current;
        if (audio) {
          const targetSrc = track.audioSrc;
          if (!audio.src || (!audio.src.endsWith(targetSrc) && audio.src !== targetSrc)) {
            audio.src = targetSrc;
          }
          audio.currentTime = startPosition;
          audio.volume = isMuted ? 0 : volume;

          // Connect to analyser for real-time oscilloscope visualization if not yet connected
          if (ctx && analyser && !mediaSourceConnectedRef.current) {
            try {
              const sourceNode = ctx.createMediaElementSource(audio);
              sourceNode.connect(analyser);
              mediaSourceConnectedRef.current = true;
            } catch {
              // Direct audio element output fallback
            }
          }

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('Audio element play exception:', err);
            });
          }
        }
      } else {
        // Stop audio element if it was playing
        if (audioElRef.current) {
          try {
            audioElRef.current.pause();
          } catch {}
        }
        startSynthesizer(track);
      }
    },
    [getAudioContext, stopSynthesizer, startSynthesizer, isMuted, volume]
  );

  // Playback actions
  const playTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      setHasEverPlayed(true);
      setHistory((prev) => [currentTrack, ...prev.filter((t) => t.id !== currentTrack.id)].slice(0, 30));
      setCurrentTrack(track);
      setIsPlaying(true);
      setPlaybackPosition(0);
      recordRecentlyPlayed(track.id);

      if (newQueue && newQueue.length > 0) {
        const trackIdx = newQueue.findIndex((t) => t.id === track.id);
        if (trackIdx !== -1) {
          const upcoming = [...newQueue.slice(trackIdx + 1), ...newQueue.slice(0, trackIdx)];
          setQueue(upcoming);
        } else {
          setQueue(newQueue.filter((t) => t.id !== track.id));
        }
      }
      startPlaybackForTrack(track, 0);
    },
    [currentTrack, startPlaybackForTrack, setHasEverPlayed]
  );

  const seek = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(seconds, duration));
      setPlaybackPosition(clamped);
      if (currentTrack.audioSrc && audioElRef.current) {
        try {
          audioElRef.current.currentTime = clamped;
        } catch {}
      }
    },
    [duration, currentTrack.audioSrc]
  );

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setHistory((prev) => [currentTrack, ...prev.filter((t) => t.id !== currentTrack.id)].slice(0, 30));
      setQueue((prev) => prev.slice(1));
      setCurrentTrack(next);
      setIsPlaying(true);
      setPlaybackPosition(0);
      recordRecentlyPlayed(next.id);
      startPlaybackForTrack(next, 0);
    } else {
      // Loop over current album/catalog if repeatAll or shuffle
      if (repeatMode === 'one') {
        seek(0);
        return;
      }
      const catalog = allTracks;
      const currentIndex = catalog.findIndex((t) => t.id === currentTrack.id);
      let nextIndex: number;
      if (shuffle) {
        nextIndex = Math.floor(Math.random() * catalog.length);
      } else {
        nextIndex = (currentIndex + 1) % catalog.length;
      }
      playTrack(catalog[nextIndex]);
    }
  }, [queue, currentTrack, repeatMode, shuffle, allTracks, playTrack, seek, startPlaybackForTrack]);

  const prevTrack = useCallback(() => {
    if (playbackPosition > 3) {
      seek(0);
    } else if (history.length > 0) {
      const prev = history[0];
      setHistory((h) => h.slice(1));
      setQueue((q) => [currentTrack, ...q]);
      setCurrentTrack(prev);
      setIsPlaying(true);
      setPlaybackPosition(0);
      recordRecentlyPlayed(prev.id);
      startPlaybackForTrack(prev, 0);
    } else {
      const catalog = allTracks;
      const currentIndex = catalog.findIndex((t) => t.id === currentTrack.id);
      const prevIndex = (currentIndex - 1 + catalog.length) % catalog.length;
      playTrack(catalog[prevIndex]);
    }
  }, [playbackPosition, history, currentTrack, allTracks, seek, playTrack, startPlaybackForTrack]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (currentTrack.audioSrc && audioElRef.current) {
        try {
          audioElRef.current.pause();
        } catch {}
      } else {
        stopSynthesizer();
      }
      setIsPlaying(false);
    } else {
      setHasEverPlayed(true);
      setIsPlaying(true);
      startPlaybackForTrack(currentTrack, playbackPosition);
    }
  }, [isPlaying, currentTrack, playbackPosition, startPlaybackForTrack, stopSynthesizer, setHasEverPlayed]);

  const setVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(vol, 1));
      setVolumeState(clamped);
      if (isMuted && clamped > 0) {
        setIsMuted(false);
      }
      if (audioElRef.current) {
        audioElRef.current.volume = isMuted ? 0 : clamped;
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioElRef.current) {
        audioElRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);


  // Real-time audio element event listener for local MP3 tracks
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!audioElRef.current) {
      audioElRef.current = new Audio();
      audioElRef.current.preload = 'auto';
    }
    const audio = audioElRef.current;

    const handleTimeUpdate = () => {
      if (currentTrack.audioSrc) {
        setPlaybackPosition(Math.floor(audio.currentTime));
      }
    };

    const handleLoadedMetadata = () => {
      if (currentTrack.audioSrc && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack.audioSrc, repeatMode, nextTrack]);

  // Playback timer ticker for procedural synthetic tracks
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !currentTrack.audioSrc) {
      interval = setInterval(() => {
        setPlaybackPosition((prev) => {
          if (prev >= duration) {
            if (repeatMode === 'one') {
              return 0;
            } else {
              nextTrack();
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, repeatMode, currentTrack.audioSrc, nextTrack]);

  // Context Focus Session countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeFocusSession && !activeFocusSession.isComplete && activeFocusSession.secondsLeft > 0) {
      interval = setInterval(() => {
        setActiveFocusSession((prev) => {
          if (!prev) return null;
          if (prev.secondsLeft <= 1) {
            return { ...prev, secondsLeft: 0, isComplete: true };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeFocusSession]);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const next = !s;
      savePlaybackPreferences({ shuffle: next });
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((m) => {
      const next = m === 'off' ? 'all' : m === 'all' ? 'one' : 'off';
      savePlaybackPreferences({ repeatMode: next });
      return next;
    });
  }, []);

  // Queue actions
  const addToQueue = useCallback((track: Track, playNext = false) => {
    setQueue((q) => {
      if (playNext) {
        return [track, ...q];
      }
      return [...q, track];
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((q) => q.filter((_, i) => i !== index));
  }, []);

  const reorderQueue = useCallback((fromIdx: number, toIdx: number) => {
    setQueue((q) => {
      const copy = [...q];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Library actions
  const toggleLike = useCallback((trackId: string) => {
    const isNowLiked = toggleLikeTrack(trackId);
    setLikedTrackIds(getLikedTrackIds());
    return isNowLiked;
  }, []);

  const isLiked = useCallback(
    (trackId: string) => {
      return likedTrackIds.includes(trackId);
    },
    [likedTrackIds]
  );

  const createPlaylist = useCallback((name: string, description?: string) => {
    const created = createCustomPlaylist(name, description);
    setPlaylists(getAllPlaylists());
    return created;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    deleteCustomPlaylist(id);
    setPlaylists(getAllPlaylists());
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string) => {
    addTrackToStore(playlistId, trackId);
    setPlaylists(getAllPlaylists());
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    removeTrackFromStore(playlistId, trackId);
    setPlaylists(getAllPlaylists());
  }, []);

  // Bulk import and library management actions
  const importTracks = useCallback((newTracks: Track[]) => {
    const updated = addImportedTracks(newTracks);
    setImportedTracks(updated);
  }, []);

  const refreshLibrary = useCallback(async () => {
    try {
      const res = await fetch('/api/music/tracks');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks)) {
          const formatted = data.tracks.map(mapDbTrackToTrack);
          const merged = addImportedTracks(formatted);
          setImportedTracks(merged);
        }
      }
    } catch (e) {
      console.warn('Refresh library error:', e);
    }
  }, []);

  const deleteTrack = useCallback(async (trackId: string) => {
    const updated = removeImportedTrack(trackId);
    setImportedTracks(updated);
    try {
      await fetch(`/api/music/tracks?id=${encodeURIComponent(trackId)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Delete track API error:', e);
    }
  }, []);

  const bulkDeleteTracks = useCallback(async (trackIds: string[]) => {
    let current = getImportedTracks();
    const idSet = new Set(trackIds);
    current = current.filter((t) => !idSet.has(t.id));
    saveImportedTracks(current);
    setImportedTracks(current);
    try {
      await fetch('/api/music/tracks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: trackIds }),
      });
    } catch (e) {
      console.warn('Bulk delete API error:', e);
    }
  }, []);

  const bulkUpdateCategory = useCallback(async (trackIds: string[], category: MusicCategory) => {
    let current = getImportedTracks();
    const idSet = new Set(trackIds);
    current = current.map((t) => (idSet.has(t.id) ? { ...t, category } : t));
    saveImportedTracks(current);
    setImportedTracks(current);
    try {
      await fetch('/api/music/tracks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: trackIds, category }),
      });
    } catch (e) {
      console.warn('Bulk update category API error:', e);
    }
  }, []);

  const bulkAddToPlaylist = useCallback((trackIds: string[], playlistId: string) => {
    trackIds.forEach((id) => {
      addTrackToStore(playlistId, id);
    });
    setPlaylists(getAllPlaylists());
  }, []);

  // Lounge & Focus engine
  const joinLounge = useCallback(
    (lounge: CampusLounge) => {
      setActiveLounge(lounge);
      const loungeTrack = TRACKS.find((t) => t.id === lounge.trackId) || TRACKS[0];
      playTrack(loungeTrack);
    },
    [playTrack]
  );

  const leaveLounge = useCallback(() => {
    setActiveLounge(null);
  }, []);

  const startContextFocusSession = useCallback(
    (name: string, mins: number, contextId?: string) => {
      if (contextId) {
        setActiveContextId(contextId);
      }
      setActiveFocusSession({
        name,
        totalMins: mins,
        secondsLeft: mins * 60,
        isComplete: false,
      });
      // Start matching soundscape automatically
      if (!isPlaying) {
        togglePlay();
      }
    },
    [isPlaying, togglePlay]
  );

  const stopContextFocusSession = useCallback(() => {
    setActiveFocusSession(null);
  }, []);

  const dismissFocusCompletion = useCallback(() => {
    setActiveFocusSession(null);
  }, []);

  // Visualizer Frequency Data Provider
  const getFrequencyData = useCallback((dataArray: Uint8Array) => {
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(dataArray as any);
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seek(playbackPosition - 5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(playbackPosition + 5);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        nextTrack();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        prevTrack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, playbackPosition, toggleMute, nextTrack, prevTrack]);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playbackPosition,
        duration,
        volume,
        isMuted,
        shuffle,
        repeatMode,
        queue,
        history,
        allTracks,
        importedTracks,
        likedTrackIds,
        playlists,
        activeLounge,
        activeFocusSession,
        activeContextId,
        setActiveContextId,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        isQueueOpen,
        setIsQueueOpen,
        isCreatePlaylistOpen,
        setIsCreatePlaylistOpen,
        isImporterOpen,
        setIsImporterOpen,
        selectedLoungeForModal,
        setSelectedLoungeForModal,
        getFrequencyData,
        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        toggleLike,
        isLiked,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        importTracks,
        deleteTrack,
        bulkDeleteTracks,
        bulkUpdateCategory,
        bulkAddToPlaylist,
        refreshLibrary,
        joinLounge,
        leaveLounge,
        startContextFocusSession,
        stopContextFocusSession,
        dismissFocusCompletion,
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
        hasEverPlayed,
        setHasEverPlayed,
        isMiniPlayerMinimized,
        setIsMiniPlayerMinimized,
        clearRecentlyPlayed,
        clearLocalPreferences,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
