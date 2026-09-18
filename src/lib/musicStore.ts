import { Playlist, DEFAULT_PLAYLISTS, TRACKS, Track, MusicCategory } from './musicData';

const STORAGE_KEYS = {
  LIKED_TRACKS: 'nivora_music_liked_tracks',
  CUSTOM_PLAYLISTS: 'nivora_music_custom_playlists',
  RECENTLY_PLAYED: 'nivora_music_recently_played',
  PREFERENCES: 'nivora_music_preferences',
  IMPORTED_TRACKS: 'nivora_music_imported_tracks',
};

export interface PlaybackPreferences {
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  lastTrackId?: string;
  enableMusicPlayer: boolean;
  autoplay: boolean;
  defaultVolume: number;
  playbackQuality: 'standard' | 'high';
  showMiniPlayer: boolean;
  musicNotifications: boolean;
  hasEverPlayed: boolean;
  isMiniPlayerMinimized: boolean;
}

const DEFAULT_PREFS: PlaybackPreferences = {
  volume: 0.65,
  isMuted: false,
  shuffle: false,
  repeatMode: 'off',
  lastTrackId: 'track-1',
  enableMusicPlayer: true,
  autoplay: false,
  defaultVolume: 0.65,
  playbackQuality: 'high',
  showMiniPlayer: true,
  musicNotifications: true,
  hasEverPlayed: false,
  isMiniPlayerMinimized: false,
};

// Safe helper for localStorage
function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// --------------------------------------------------
// LIKED TRACKS
// --------------------------------------------------
export function getLikedTrackIds(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.LIKED_TRACKS, ['track-1', 'track-2', 'track-4']);
}

export function toggleLikeTrack(trackId: string): boolean {
  const current = getLikedTrackIds();
  let updated: string[];
  let isNowLiked = false;

  if (current.includes(trackId)) {
    updated = current.filter((id) => id !== trackId);
    isNowLiked = false;
  } else {
    updated = [trackId, ...current];
    isNowLiked = true;
  }

  safeSet(STORAGE_KEYS.LIKED_TRACKS, updated);
  return isNowLiked;
}

export function isLikedTrack(trackId: string): boolean {
  const current = getLikedTrackIds();
  return current.includes(trackId);
}

// --------------------------------------------------
// PLAYLISTS (Built-in + Custom)
// --------------------------------------------------
export function getCustomPlaylists(): Playlist[] {
  return safeGet<Playlist[]>(STORAGE_KEYS.CUSTOM_PLAYLISTS, []);
}

export function getAllPlaylists(): Playlist[] {
  const custom = getCustomPlaylists();
  return [...DEFAULT_PLAYLISTS, ...custom];
}

export function createCustomPlaylist(name: string, description = ''): Playlist {
  const custom = getCustomPlaylists();
  const newPlaylist: Playlist = {
    id: `playlist-custom-${Date.now()}`,
    name: name.trim() || 'My Focus Mix',
    description: description.trim() || 'Personal student curated study mix.',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    trackIds: [],
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  const updated = [newPlaylist, ...custom];
  safeSet(STORAGE_KEYS.CUSTOM_PLAYLISTS, updated);
  return newPlaylist;
}

export function renameCustomPlaylist(id: string, name: string, description?: string): void {
  const custom = getCustomPlaylists();
  const updated = custom.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        name: name.trim() || p.name,
        description: description !== undefined ? description : p.description,
      };
    }
    return p;
  });
  safeSet(STORAGE_KEYS.CUSTOM_PLAYLISTS, updated);
}

export function deleteCustomPlaylist(id: string): void {
  const custom = getCustomPlaylists();
  const updated = custom.filter((p) => p.id !== id);
  safeSet(STORAGE_KEYS.CUSTOM_PLAYLISTS, updated);
}

export function addTrackToPlaylist(playlistId: string, trackId: string): void {
  const custom = getCustomPlaylists();
  const updated = custom.map((p) => {
    if (p.id === playlistId && !p.trackIds.includes(trackId)) {
      return { ...p, trackIds: [...p.trackIds, trackId] };
    }
    return p;
  });
  safeSet(STORAGE_KEYS.CUSTOM_PLAYLISTS, updated);
}

export function removeTrackFromPlaylist(playlistId: string, trackId: string): void {
  const custom = getCustomPlaylists();
  const updated = custom.map((p) => {
    if (p.id === playlistId) {
      return { ...p, trackIds: p.trackIds.filter((tId) => tId !== trackId) };
    }
    return p;
  });
  safeSet(STORAGE_KEYS.CUSTOM_PLAYLISTS, updated);
}

export function reorderTracksInPlaylist(playlistId: string, fromIdx: number, toIdx: number): void {
  const custom = getCustomPlaylists();
  const updated = custom.map((p) => {
    if (p.id === playlistId) {
      const copy = [...p.trackIds];
      const [removed] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, removed);
      return { ...p, trackIds: copy };
    }
    return p;
  });
  safeSet(STORAGE_KEYS.CUSTOM_PLAYLISTS, updated);
}

// --------------------------------------------------
// RECENTLY PLAYED
// --------------------------------------------------
export function getRecentlyPlayedTrackIds(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.RECENTLY_PLAYED, ['track-1', 'track-4', 'track-2', 'track-3']);
}

export function recordRecentlyPlayed(trackId: string): void {
  const current = getRecentlyPlayedTrackIds();
  const filtered = current.filter((id) => id !== trackId);
  const updated = [trackId, ...filtered].slice(0, 30); // Max 30 recent tracks
  safeSet(STORAGE_KEYS.RECENTLY_PLAYED, updated);
}

export function clearRecentlyPlayed(): void {
  safeSet(STORAGE_KEYS.RECENTLY_PLAYED, []);
}

// --------------------------------------------------
// PREFERENCES
// --------------------------------------------------
export function getPlaybackPreferences(): PlaybackPreferences {
  return safeGet<PlaybackPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFS);
}

export function savePlaybackPreferences(prefs: Partial<PlaybackPreferences>): void {
  const current = getPlaybackPreferences();
  safeSet(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
}

export function clearLocalPreferences(): void {
  safeSet(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFS);
}

// --------------------------------------------------
// IMPORTED TRACKS
// --------------------------------------------------
export function getImportedTracks(): Track[] {
  return safeGet<Track[]>(STORAGE_KEYS.IMPORTED_TRACKS, []);
}

export function saveImportedTracks(tracks: Track[]): void {
  safeSet(STORAGE_KEYS.IMPORTED_TRACKS, tracks);
}

export function addImportedTracks(newTracks: Track[]): Track[] {
  const current = getImportedTracks();
  const map = new Map<string, Track>();
  current.forEach((t) => map.set(t.id, t));
  newTracks.forEach((t) => map.set(t.id, t));
  const updated = Array.from(map.values());
  saveImportedTracks(updated);
  return updated;
}

export function removeImportedTrack(trackId: string): Track[] {
  const current = getImportedTracks();
  const updated = current.filter((t) => t.id !== trackId);
  saveImportedTracks(updated);
  return updated;
}

export function updateImportedTrackCategory(trackId: string, category: MusicCategory): Track[] {
  const current = getImportedTracks();
  const updated = current.map((t) => (t.id === trackId ? { ...t, category } : t));
  saveImportedTracks(updated);
  return updated;
}

