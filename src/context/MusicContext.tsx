'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Track,
  Playlist,
  CampusLounge,
  MusicCategory,
  youtubeItemToTrack,
  dbRecordToTrack,
} from '@/lib/musicData';
import {
  getPlaybackPreferences,
  savePlaybackPreferences,
} from '@/lib/musicStore';

export interface ActiveFocusSession {
  name: string;
  totalMins: number;
  secondsLeft: number;
  isComplete: boolean;
}

export interface UserPlaylist {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  trackCount: number;
  artwork: string;
  items?: Track[];
}

export interface YouTubePlayerControls {
  loadAndPlay: (id: string, startSec?: number) => void;
  loadVideoById: (id: string, startSec?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volPercent: number) => void;
  mute: () => void;
  unMute: () => void;
}

interface MusicContextType {
  // Active state
  currentTrack: Track;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackPosition: number; // in seconds
  setPlaybackPosition: (pos: number) => void;
  duration: number; // in seconds
  setDuration: (dur: number) => void;
  volume: number; // 0 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  history: Track[];
  likedTrackIds: string[];
  playlists: Playlist[];
  userPlaylists: UserPlaylist[];
  activeLounge: CampusLounge | null;
  activeFocusSession: ActiveFocusSession | null;
  activeContextId: string | null;
  setActiveContextId: (id: string | null) => void;
  playbackError: string | null;
  setPlaybackError: (err: string | null) => void;
  clearPlaybackError: () => void;
  registerPlayerControls: (controls: YouTubePlayerControls | null) => void;

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

  // Analyser node dummy for visualizer compatibility
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
  favorites: Track[];
  recentlyPlayed: Track[];
  toggleLike: (trackId: string, trackMeta?: Track) => Promise<boolean>;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  refreshPlaylists: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshRecentlyPlayed: () => Promise<void>;

  // Legacy stubs for compatibility
  importedTracks: Track[];
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

// Initial default genuine empty track
export const EMPTY_INITIAL_TRACK: Track = {
  id: '',
  videoId: '',
  title: 'Choose something to play',
  artist: 'Nivora Music',
  channelTitle: 'Nivora Music',
  album: 'Nivora',
  artwork: '',
  coverUrl: '',
  duration: 0,
  category: 'focus',
  soundType: 'focus',
};

export function MusicProvider({ children }: { children: ReactNode }) {
  // Deterministic initial states for SSR and initial hydration (Requirement 7 & 9)
  const [currentTrack, setCurrentTrack] = useState<Track>(EMPTY_INITIAL_TRACK);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Queue & History
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);

  // Real Supabase data state
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);

  // Focus & Lounge
  const [activeLounge, setActiveLounge] = useState<CampusLounge | null>(null);
  const [activeFocusSession, setActiveFocusSession] = useState<ActiveFocusSession | null>(null);
  const [activeContextId, setActiveContextId] = useState<string | null>('context-focus');
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const clearPlaybackError = useCallback(() => setPlaybackError(null), []);

  // Modals
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [selectedLoungeForModal, setSelectedLoungeForModal] = useState<CampusLounge | null>(null);

  // Shell Preferences
  const [enableMusicPlayer, setEnableMusicPlayerState] = useState<boolean>(true);
  const [autoplay, setAutoplayState] = useState<boolean>(false);
  const [defaultVolume, setDefaultVolumeState] = useState<number>(0.7);
  const [playbackQuality, setPlaybackQualityState] = useState<'standard' | 'high'>('high');
  const [showMiniPlayer, setShowMiniPlayerState] = useState<boolean>(true);
  const [musicNotifications, setMusicNotificationsState] = useState<boolean>(true);
  const [hasEverPlayed, setHasEverPlayedState] = useState<boolean>(false);
  const [isMiniPlayerMinimized, setIsMiniPlayerMinimizedState] = useState<boolean>(false);

  // References
  const currentTrackRef = useRef<Track>(currentTrack);
  currentTrackRef.current = currentTrack;
  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;
  const repeatModeRef = useRef<'off' | 'all' | 'one'>(repeatMode);
  repeatModeRef.current = repeatMode;
  const queueRef = useRef<Track[]>(queue);
  queueRef.current = queue;

  // Registered player controls from client-only YouTubePlayerBridge (Requirement 3, 13)
  const playerControlsRef = useRef<YouTubePlayerControls | null>(null);
  const registerPlayerControls = useCallback((controls: YouTubePlayerControls | null) => {
    playerControlsRef.current = controls;
  }, []);

  // Safe client-only preference loading after initial hydration (Requirement 9)
  useEffect(() => {
    const prefs = getPlaybackPreferences();
    if (typeof prefs.volume === 'number') setVolumeState(prefs.volume);
    if (typeof prefs.isMuted === 'boolean') setIsMuted(prefs.isMuted);
    if (typeof prefs.shuffle === 'boolean') setShuffle(prefs.shuffle);
    if (prefs.repeatMode) setRepeatMode(prefs.repeatMode);
    if (typeof prefs.enableMusicPlayer === 'boolean') setEnableMusicPlayerState(prefs.enableMusicPlayer);
    if (typeof prefs.autoplay === 'boolean') setAutoplayState(prefs.autoplay);
    if (typeof prefs.defaultVolume === 'number') setDefaultVolumeState(prefs.defaultVolume);
    if (prefs.playbackQuality) setPlaybackQualityState(prefs.playbackQuality);
    if (typeof prefs.showMiniPlayer === 'boolean') setShowMiniPlayerState(prefs.showMiniPlayer);
    if (typeof prefs.musicNotifications === 'boolean') setMusicNotificationsState(prefs.musicNotifications);
    if (typeof prefs.hasEverPlayed === 'boolean') setHasEverPlayedState(prefs.hasEverPlayed);
    if (typeof prefs.isMiniPlayerMinimized === 'boolean') setIsMiniPlayerMinimizedState(prefs.isMiniPlayerMinimized);
  }, []);

  // ----------------------------------------------------
  // SYNC SUPABASE DATA ON MOUNT
  // ----------------------------------------------------
  const refreshFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/music/favorites');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          const mapped = data.items.map((r: any) => dbRecordToTrack(r, 'focus'));
          setFavorites(mapped);
          setLikedTrackIds(mapped.map((t: Track) => t.id));
        }
      }
    } catch (e) {
      console.warn('Error refreshing favorites from Supabase:', e);
    }
  }, []);

  const refreshRecentlyPlayed = useCallback(async () => {
    try {
      const res = await fetch('/api/music/recently-played');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          const mapped = data.items.map((r: any) => dbRecordToTrack(r, 'focus'));
          setRecentlyPlayed(mapped);
        }
      }
    } catch (e) {
      console.warn('Error refreshing recently played from Supabase:', e);
    }
  }, []);

  const refreshPlaylists = useCallback(async () => {
    try {
      const res = await fetch('/api/music/playlists');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setUserPlaylists(data.items);
        }
      }
    } catch (e) {
      console.warn('Error refreshing playlists from Supabase:', e);
    }
  }, []);

  useEffect(() => {
    refreshFavorites();
    refreshRecentlyPlayed();
    refreshPlaylists();
  }, [refreshFavorites, refreshRecentlyPlayed, refreshPlaylists]);

  // Backward compatible Playlist[] format for existing views
  const playlists: Playlist[] = useMemo(() => {
    return userPlaylists.map((up) => ({
      id: up.id,
      name: up.name,
      description: up.description,
      artwork: up.artwork || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      trackIds: up.items ? up.items.map((t) => t.id) : [],
      isCustom: true,
      createdAt: up.createdAt,
    }));
  }, [userPlaylists]);

  // Combined tracks catalog for instant search/queue
  const allTracks = useMemo(() => {
    const map = new Map<string, Track>();
    favorites.forEach((t) => map.set(t.id, t));
    recentlyPlayed.forEach((t) => map.set(t.id, t));
    return Array.from(map.values());
  }, [favorites, recentlyPlayed]);

  // ----------------------------------------------------
  // PLAYER DELEGATION & ACTION HANDLERS
  // ----------------------------------------------------
  const nextTrackRef = useRef<() => void>(() => {});

  // ----------------------------------------------------
  // PLAYBACK ACTIONS
  // ----------------------------------------------------
  const playTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      // Requirement 16: Verify that the clicked card's videoId is not undefined/null
      const targetVideoId = track?.videoId || track?.id;
      if (!targetVideoId) {
        console.warn('[Music] Cannot play track: videoId is null or undefined', track);
        setPlaybackError('Unable to play this track. Try another track.');
        return;
      }

      // Requirement 17: Add safe debugging (never log API key)
      console.log({
        event: 'music-play',
        videoId: targetVideoId,
      });

      // Requirement 2 & 13: Store track & videoId in React state
      setPlaybackError(null);
      setHasEverPlayedState(true);
      savePlaybackPreferences({ hasEverPlayed: true, lastTrackId: targetVideoId });

      // Save to local history state
      if (currentTrackRef.current && (currentTrackRef.current.id || currentTrackRef.current.videoId)) {
        setHistory((prev) => [
          currentTrackRef.current,
          ...prev.filter((t) => (t.videoId || t.id) !== (currentTrackRef.current.videoId || currentTrackRef.current.id)),
        ].slice(0, 30));
      }
      setCurrentTrack(track);
      setPlaybackPosition(0);
      setDuration(track.duration || 210);
      setIsPlaying(true);

      // Save track into Supabase recently played history in background (Requirement 19)
      fetch('/api/music/recently-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: targetVideoId,
          title: track.title,
          channelTitle: track.channelTitle || track.artist,
          thumbnailUrl: track.artwork || track.coverUrl,
          duration: track.durationFormatted || '3:30',
        }),
      })
        .then(() => refreshRecentlyPlayed())
        .catch(() => {});

      // Update queue
      if (newQueue && newQueue.length > 0) {
        const trackIdx = newQueue.findIndex((t) => (t.videoId || t.id) === targetVideoId);
        if (trackIdx !== -1) {
          const upcoming = [...newQueue.slice(trackIdx + 1), ...newQueue.slice(0, trackIdx)];
          setQueue(upcoming);
        } else {
          setQueue(newQueue.filter((t) => (t.videoId || t.id) !== targetVideoId));
        }
      }

      // Requirement 3: On user Play action: player.unMute(), player.setVolume(100), player.playVideo()
      if (playerControlsRef.current) {
        try {
          playerControlsRef.current.loadAndPlay(targetVideoId, 0);
        } catch (e) {
          console.warn('[Music] Error calling loadAndPlay on player bridge:', e);
          setPlaybackError('Unable to play this track. Try another track.');
        }
      }
    },
    [refreshRecentlyPlayed]
  );

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (playerControlsRef.current) {
        try { playerControlsRef.current.pauseVideo(); } catch {}
      }
      setIsPlaying(false);
    } else {
      setHasEverPlayedState(true);
      setIsPlaying(true);
      if (playerControlsRef.current) {
        try {
          // Requirement 3: unMute, setVolume(100), playVideo
          playerControlsRef.current.unMute();
          playerControlsRef.current.setVolume(Math.round(volumeRef.current * 100) || 100);
          playerControlsRef.current.playVideo();
        } catch {}
      } else if (currentTrackRef.current && (currentTrackRef.current.id || currentTrackRef.current.videoId)) {
        playTrack(currentTrackRef.current);
      }
    }
  }, [isPlaying, playTrack]);

  const seek = useCallback((seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, duration || 100));
    setPlaybackPosition(clamped);
    if (playerControlsRef.current) {
      try {
        playerControlsRef.current.seekTo(clamped);
      } catch {}
    }
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    savePlaybackPreferences({ volume: clamped });
    if (isMuted && clamped > 0) {
      setIsMuted(false);
      isMutedRef.current = false;
    }
    if (playerControlsRef.current) {
      try {
        playerControlsRef.current.setVolume(Math.round(clamped * 100));
        if (clamped > 0) playerControlsRef.current.unMute();
      } catch {}
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      savePlaybackPreferences({ isMuted: next });
      if (playerControlsRef.current) {
        try {
          if (next) playerControlsRef.current.mute();
          else playerControlsRef.current.unMute();
        } catch {}
      }
      return next;
    });
  }, []);

  const nextTrack = useCallback(() => {
    const currentQ = queueRef.current;
    if (currentQ.length > 0) {
      const next = currentQ[0];
      setHistory((prev) => [currentTrackRef.current, ...prev.filter((t) => t.id !== currentTrackRef.current.id)].slice(0, 30));
      setQueue((prev) => prev.slice(1));
      playTrack(next);
    } else {
      if (repeatModeRef.current === 'one') {
        seek(0);
        return;
      }
      const catalog = allTracks;
      if (catalog.length === 0) return;
      const currentIndex = catalog.findIndex((t) => t.id === currentTrackRef.current.id);
      let nextIndex: number;
      if (shuffle) {
        nextIndex = Math.floor(Math.random() * catalog.length);
      } else {
        nextIndex = (currentIndex + 1) % catalog.length;
      }
      playTrack(catalog[nextIndex]);
    }
  }, [allTracks, playTrack, seek, shuffle]);

  nextTrackRef.current = nextTrack;

  const prevTrack = useCallback(() => {
    if (playbackPosition > 3) {
      seek(0);
    } else if (history.length > 0) {
      const prev = history[0];
      setHistory((h) => h.slice(1));
      setQueue((q) => [currentTrackRef.current, ...q]);
      playTrack(prev);
    } else {
      const catalog = allTracks;
      if (catalog.length === 0) return;
      const currentIndex = catalog.findIndex((t) => t.id === currentTrackRef.current.id);
      const prevIndex = (currentIndex - 1 + catalog.length) % catalog.length;
      playTrack(catalog[prevIndex]);
    }
  }, [playbackPosition, history, allTracks, seek, playTrack]);

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
      repeatModeRef.current = next;
      savePlaybackPreferences({ repeatMode: next });
      return next;
    });
  }, []);

  // ----------------------------------------------------
  // QUEUE ACTIONS
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // SUPABASE FAVORITES & PLAYLISTS
  // ----------------------------------------------------
  const toggleLike = useCallback(
    async (trackId: string, trackMeta?: Track): Promise<boolean> => {
      const isCurrentlyLiked = likedTrackIds.includes(trackId);
      const targetTrack = trackMeta || allTracks.find((t) => t.id === trackId) || currentTrackRef.current;

      // Optimistic UI update
      if (isCurrentlyLiked) {
        setLikedTrackIds((prev) => prev.filter((id) => id !== trackId));
        setFavorites((prev) => prev.filter((t) => t.id !== trackId));
      } else {
        setLikedTrackIds((prev) => [trackId, ...prev]);
        setFavorites((prev) => [targetTrack, ...prev.filter((t) => t.id !== trackId)]);
      }

      try {
        const res = await fetch('/api/music/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: trackId,
            title: targetTrack.title,
            channelTitle: targetTrack.channelTitle || targetTrack.artist,
            thumbnailUrl: targetTrack.artwork || targetTrack.coverUrl,
            duration: targetTrack.durationFormatted || '3:30',
            action: isCurrentlyLiked ? 'delete' : 'add',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return Boolean(data.favorited);
        }
      } catch (e) {
        console.warn('Toggle favorite API error:', e);
      }
      return !isCurrentlyLiked;
    },
    [likedTrackIds, allTracks]
  );

  const isLiked = useCallback(
    (trackId: string) => {
      return likedTrackIds.includes(trackId);
    },
    [likedTrackIds]
  );

  const createPlaylist = useCallback(async (name: string, description?: string): Promise<Playlist> => {
    try {
      const res = await fetch('/api/music/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshPlaylists();
        return {
          id: data.playlist.id,
          name: data.playlist.name,
          description: data.playlist.description,
          artwork: data.playlist.artwork,
          trackIds: [],
          isCustom: true,
          createdAt: data.playlist.createdAt,
        };
      }
    } catch (e) {
      console.warn('Error creating playlist:', e);
    }
    // Fallback playlist structure
    const fallback: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description: description || '',
      artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      trackIds: [],
      isCustom: true,
    };
    return fallback;
  }, [refreshPlaylists]);

  const deletePlaylist = useCallback(async (id: string) => {
    setUserPlaylists((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/music/playlists/${id}`, { method: 'DELETE' });
      await refreshPlaylists();
    } catch (e) {
      console.warn('Delete playlist API error:', e);
    }
  }, [refreshPlaylists]);

  const addTrackToPlaylist = useCallback(async (playlistId: string, track: Track) => {
    try {
      await fetch(`/api/music/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: track.videoId || track.id,
          title: track.title,
          channelTitle: track.channelTitle || track.artist,
          thumbnailUrl: track.artwork || track.coverUrl,
          duration: track.durationFormatted || '3:30',
        }),
      });
      await refreshPlaylists();
    } catch (e) {
      console.warn('Add track to playlist API error:', e);
    }
  }, [refreshPlaylists]);

  const removeTrackFromPlaylist = useCallback(async (playlistId: string, videoId: string) => {
    try {
      await fetch(`/api/music/playlists/${playlistId}/items?videoId=${encodeURIComponent(videoId)}`, {
        method: 'DELETE',
      });
      await refreshPlaylists();
    } catch (e) {
      console.warn('Remove track from playlist API error:', e);
    }
  }, [refreshPlaylists]);

  // Backward compatibility stubs for legacy views
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);
  const importTracks = useCallback((newTracks: Track[]) => {
    setImportedTracks((prev) => [...newTracks, ...prev]);
  }, []);
  const deleteTrack = useCallback(async (trackId: string) => {
    setImportedTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, []);
  const bulkDeleteTracks = useCallback(async (trackIds: string[]) => {
    const idSet = new Set(trackIds);
    setImportedTracks((prev) => prev.filter((t) => !idSet.has(t.id)));
  }, []);
  const bulkUpdateCategory = useCallback(async () => {}, []);
  const bulkAddToPlaylist = useCallback(() => {}, []);
  const refreshLibrary = useCallback(async () => {
    await Promise.all([refreshFavorites(), refreshRecentlyPlayed(), refreshPlaylists()]);
  }, [refreshFavorites, refreshRecentlyPlayed, refreshPlaylists]);

  // Lounge & Focus engine
  const joinLounge = useCallback(
    (lounge: CampusLounge) => {
      setActiveLounge(lounge);
      const fallbackTrack = allTracks[0] || EMPTY_INITIAL_TRACK;
      playTrack(fallbackTrack);
    },
    [allTracks, playTrack]
  );

  const leaveLounge = useCallback(() => {
    setActiveLounge(null);
  }, []);

  const startContextFocusSession = useCallback(
    (name: string, mins: number, contextId?: string) => {
      if (contextId) setActiveContextId(contextId);
      setActiveFocusSession({
        name,
        totalMins: mins,
        secondsLeft: mins * 60,
        isComplete: false,
      });
      if (!isPlaying) togglePlay();
    },
    [isPlaying, togglePlay]
  );

  const stopContextFocusSession = useCallback(() => {
    setActiveFocusSession(null);
  }, []);

  const dismissFocusCompletion = useCallback(() => {
    setActiveFocusSession(null);
  }, []);

  const getFrequencyData = useCallback((dataArray: Uint8Array) => {
    // Generate synthetic audio visualizer bars when playing
    if (isPlaying) {
      const now = Date.now() / 150;
      for (let i = 0; i < dataArray.length; i++) {
        const val = Math.floor(Math.sin(now + i * 0.4) * 80 + 120);
        dataArray[i] = Math.max(20, Math.min(255, val));
      }
    } else {
      dataArray.fill(0);
    }
  }, [isPlaying]);

  // Global Keyboard Shortcuts (Space, ArrowLeft, ArrowRight, M, N, P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
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

  // Shell Preferences
  const setEnableMusicPlayer = useCallback((enable: boolean) => {
    setEnableMusicPlayerState(enable);
    savePlaybackPreferences({ enableMusicPlayer: enable });
    if (!enable) {
      const player = playerControlsRef.current;
      if (player?.pauseVideo) {
        try { player.pauseVideo(); } catch {}
      }
      setIsPlaying(false);
    }
  }, []);

  const setAutoplay = useCallback((auto: boolean) => {
    setAutoplayState(auto);
    savePlaybackPreferences({ autoplay: auto });
  }, []);

  const setDefaultVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    setDefaultVolumeState(clamped);
    setVolume(clamped);
    savePlaybackPreferences({ defaultVolume: clamped, volume: clamped });
  }, [setVolume]);

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
    setRecentlyPlayed([]);
  }, []);

  const clearLocalPreferences = useCallback(() => {
    setEnableMusicPlayerState(true);
    setAutoplayState(false);
    setDefaultVolumeState(0.7);
    setPlaybackQualityState('high');
    setShowMiniPlayerState(true);
    setMusicNotificationsState(true);
    setHasEverPlayedState(false);
    setIsMiniPlayerMinimizedState(false);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        setIsPlaying,
        playbackPosition,
        setPlaybackPosition,
        duration,
        setDuration,
        volume,
        isMuted,
        shuffle,
        repeatMode,
        queue,
        history,
        likedTrackIds,
        playlists,
        userPlaylists,
        activeLounge,
        activeFocusSession,
        activeContextId,
        setActiveContextId,
        playbackError,
        setPlaybackError,
        clearPlaybackError,
        registerPlayerControls,

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

        allTracks,
        favorites,
        recentlyPlayed,
        toggleLike,
        isLiked,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        refreshPlaylists,
        refreshFavorites,
        refreshRecentlyPlayed,

        importedTracks,
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
