'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import NivoraLogo from '@/components/ui/NivoraLogo';
import {
  Track,
  Artist,
  Album,
  Playlist,
  MusicCategory,
  TRACKS,
  ARTISTS,
  ALBUMS,
  DEFAULT_PLAYLISTS,
  CAMPUS_LOUNGES,
  STUDY_CONTEXT_MIXES,
  QUICK_ACCESS_CARDS,
} from '@/lib/musicData';
import { getRecentlyPlayedTrackIds } from '@/lib/musicStore';
import { useMusic } from '@/context/MusicContext';
import TrackRow from '@/components/music/TrackRow';
import MusicArtwork from '@/components/music/MusicArtwork';
import HoverPreview from '@/components/ui/HoverPreview';
import BulkMusicImporterModal from '@/components/music/BulkMusicImporterModal';
import MusicLibraryManagerView from '@/components/music/MusicLibraryManagerView';

export default function MusicPage() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playTrack,
    volume,
    setVolume,
    likedTrackIds,
    playlists,
    activeLounge,
    activeFocusSession,
    activeContextId,
    setActiveContextId,
    setSelectedLoungeForModal,
    setIsCreatePlaylistOpen,
    startContextFocusSession,
    deletePlaylist,
    allTracks,
    importedTracks,
    isImporterOpen,
    setIsImporterOpen,
    refreshLibrary,
  } = useMusic();

  // Sub-Navigation Views
  const [activeView, setActiveView] = useState<
    'home' | 'search' | 'library' | 'manage' | 'liked' | 'recent' | 'playlist' | 'album' | 'artist' | 'category'
  >('home');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'tracks' | 'artists' | 'albums' | 'playlists'>('all');

  // Library State
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'playlists' | 'liked' | 'albums' | 'artists'>('all');
  const [librarySort, setLibrarySort] = useState<'recent' | 'alpha' | 'count'>('recent');

  // Technical Engine Panel Toggle
  const [showTechnicalPanel, setShowTechnicalPanel] = useState(false);

  // Navigation Helper
  const navigateTo = (view: typeof activeView, id = '') => {
    setActiveView(view);
    setSelectedEntityId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------
  // COMPUTED DATA FOR VIEWS
  // --------------------------------------------------
  // Liked Tracks
  const likedTracks = useMemo(() => {
    return allTracks.filter((t) => likedTrackIds.includes(t.id));
  }, [allTracks, likedTrackIds]);

  // Recently Played Tracks from store
  const recentlyPlayedTracks = useMemo(() => {
    const ids = getRecentlyPlayedTrackIds();
    const list = ids
      .map((id) => allTracks.find((t) => t.id === id))
      .filter((t): t is Track => !!t);
    return list.length > 0 ? list : allTracks.slice(0, 4);
  }, [allTracks, currentTrack]);

  // Selected Playlist
  const selectedPlaylist = useMemo(() => {
    const all = [...playlists, ...DEFAULT_PLAYLISTS];
    return all.find((p) => p.id === selectedEntityId) || playlists[0] || DEFAULT_PLAYLISTS[0];
  }, [playlists, selectedEntityId]);

  const selectedPlaylistTracks = useMemo(() => {
    if (!selectedPlaylist) return [];
    return selectedPlaylist.trackIds
      .map((tId) => allTracks.find((t) => t.id === tId))
      .filter((t): t is Track => !!t);
  }, [allTracks, selectedPlaylist]);

  // Selected Album
  const selectedAlbum = useMemo(() => {
    return ALBUMS.find((a) => a.id === selectedEntityId) || ALBUMS[0];
  }, [selectedEntityId]);

  const selectedAlbumTracks = useMemo(() => {
    if (!selectedAlbum) return [];
    return selectedAlbum.trackIds
      .map((tId) => allTracks.find((t) => t.id === tId))
      .filter((t): t is Track => !!t);
  }, [allTracks, selectedAlbum]);

  // Selected Artist
  const selectedArtist = useMemo(() => {
    return ARTISTS.find((a) => a.id === selectedEntityId) || ARTISTS[0];
  }, [selectedEntityId]);

  const selectedArtistTracks = useMemo(() => {
    if (!selectedArtist) return [];
    return selectedArtist.popularTrackIds
      .map((tId) => allTracks.find((t) => t.id === tId))
      .filter((t): t is Track => !!t);
  }, [allTracks, selectedArtist]);

  const selectedArtistAlbums = useMemo(() => {
    if (!selectedArtist) return [];
    return ALBUMS.filter((a) => a.artistId === selectedArtist.id);
  }, [selectedArtist]);

  // Category Filtered Tracks
  const categoryTracks = useMemo(() => {
    return allTracks.filter((t) => t.category.toLowerCase() === selectedEntityId.toLowerCase());
  }, [allTracks, selectedEntityId]);

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }

    const matchedTracks = allTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.mood.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
        (t.whyThisTrack && t.whyThisTrack.toLowerCase().includes(q))
    );

    const matchedArtists = ARTISTS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
    );

    const matchedAlbums = ALBUMS.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q)
    );

    const matchedPlaylists = [...playlists, ...DEFAULT_PLAYLISTS].filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    return {
      tracks: matchedTracks,
      artists: matchedArtists,
      albums: matchedAlbums,
      playlists: matchedPlaylists,
    };
  }, [searchQuery, playlists]);

  // Total formatted time helper
  const calculateTotalDuration = (tracks: Track[]) => {
    const totalSecs = tracks.reduce((acc, t) => acc + t.duration, 0);
    const m = Math.floor(totalSecs / 60);
    return `${m} min`;
  };

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-lg pb-space-3xl animate-in fade-in duration-200">
      {/* -------------------------------------------------- */}
      {/* TOP STATUS & TELEMETRY STRIP                       */}
      {/* -------------------------------------------------- */}
      <section className="flex flex-col gap-space-xs">
        <div className="flex flex-wrap items-center justify-between gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-space-sm font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase flex-wrap">
            <NivoraLogo size="compact" href="/home" priority />
            <div className="h-4 w-px bg-outline-variant/40 hidden sm:block" />
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>LIFE CORE</span>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-bold">ACOUSTICS &amp; PEER SPACES</span>
            <span className="text-outline-variant">•</span>
            <span className="text-secondary font-bold">
              {activeLounge ? `IN ROOM: ${activeLounge.name}` : 'STUDENT AUDIO ENGINE'}
            </span>
          </div>

          <div className="flex items-center gap-space-md font-label-tag text-label-tag text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">sensors</span>
              142 Peers Connected
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <span className="material-symbols-outlined text-[14px] text-secondary">wifi_tethering</span>
              Bodleian Relay (14ms)
            </span>
          </div>
        </div>

        {/* Page Title & Context Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-xs">
          <div className="space-y-1">
            <h1 className="font-display-hero text-2xl sm:text-4xl text-on-surface font-bold tracking-tight">
              Music &amp; Focus Engine
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Context-adaptive academic audio, precision binaural frequencies, and synchronized study lounges built for sustained intellectual flow.
            </p>
          </div>

          <div className="flex items-center gap-space-xs flex-wrap">
            <button
              onClick={() => setIsImporterOpen(true)}
              className="flex items-center gap-space-2xs px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-all font-button-text text-button-text shadow-md font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>+ Add Music</span>
            </button>

            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="flex items-center gap-space-2xs px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors font-button-text text-button-text shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">playlist_add</span>
              <span>New Playlist</span>
            </button>

            <button
              onClick={() => {
                const gammaTrack = TRACKS.find((t) => t.id === 'track-1') || TRACKS[0];
                playTrack(gammaTrack);
              }}
              className="flex items-center gap-space-2xs px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all font-button-text text-button-text shadow-sm font-semibold hidden sm:flex"
            >
              <span className="material-symbols-outlined text-[18px]">headphones</span>
              <span>40Hz Boost</span>
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECONDARY NAVIGATION BAR (Music Tabs)              */}
      {/* -------------------------------------------------- */}
      <nav className="flex items-center justify-between border-b border-outline-variant/30 pb-2 overflow-x-auto gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigateTo('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
              activeView === 'home'
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Music Home</span>
          </button>

          <button
            onClick={() => navigateTo('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
              activeView === 'search'
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search</span>
          </button>

          <button
            onClick={() => navigateTo('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
              activeView === 'library'
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">library_music</span>
            <span>Your Library</span>
          </button>

          <button
            onClick={() => navigateTo('manage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
              activeView === 'manage'
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Manage Music</span>
          </button>

          <button
            onClick={() => navigateTo('liked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
              activeView === 'liked'
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">favorite</span>
            <span>Liked Tracks ({likedTracks.length})</span>
          </button>

          <button
            onClick={() => navigateTo('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
              activeView === 'recent'
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Recently Played</span>
          </button>
        </div>

        {/* Technical Engine Toggle */}
        <button
          onClick={() => setShowTechnicalPanel(!showTechnicalPanel)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-label-mono-wide uppercase transition-colors whitespace-nowrap border ${
            showTechnicalPanel
              ? 'bg-surface-container-high border-primary text-primary font-bold'
              : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
          }`}
          title="Toggle Acoustic Engine Console"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span className="hidden sm:inline">Acoustic Engine</span>
        </button>
      </nav>

      {/* -------------------------------------------------- */}
      {/* OPTIONAL TECHNICAL ACOUSTIC PANEL                  */}
      {/* -------------------------------------------------- */}
      {showTechnicalPanel && (
        <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/30 shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-2 font-label-tag text-xs uppercase text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
              Low-Latency Web Audio Synthesizer Telemetry
            </div>
            <span className="font-label-mono-wide text-[10px] text-on-surface-variant">
              Engine: WebAudio API 44.1kHz • Buffer 2048 • 0.0ms Relay
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
              <div className="font-label-tag text-[10px] uppercase text-on-surface-variant">Active Mode</div>
              <div className="font-headline-sm text-xs font-bold text-on-surface uppercase">
                {currentTrack.soundType} Carrier
              </div>
              <div className="font-label-mono-wide text-[10px] text-primary">
                {currentTrack.freq ? `${currentTrack.freq}Hz Delta Frequency` : 'Multi-pole Filtered'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
              <div className="font-label-tag text-[10px] uppercase text-on-surface-variant">Master Gain</div>
              <div className="font-headline-sm text-xs font-bold text-on-surface">
                {Math.round(volume * 100)}% ({((volume - 1) * 36).toFixed(1)} dB)
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 accent-primary bg-surface-container-highest rounded"
              />
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
              <div className="font-label-tag text-[10px] uppercase text-on-surface-variant">Audio Masking</div>
              <div className="font-headline-sm text-xs font-bold text-on-surface">
                Pink / Brown Noise Attenuation
              </div>
              <div className="font-label-mono-wide text-[10px] text-secondary">
                Speech Intelligibility Supression Active
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
              <div className="font-label-tag text-[10px] uppercase text-on-surface-variant">Stereo Separation</div>
              <div className="font-headline-sm text-xs font-bold text-on-surface">
                ±85% Binaural Pan Offset
              </div>
              <div className="font-label-mono-wide text-[10px] text-on-surface-variant">
                Phase aligned for headphone acoustics
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: MUSIC HOME                                   */}
      {/* ================================================== */}
      {activeView === 'home' && (
        <div className="space-y-space-xl">
          {/* Section: "What are you doing right now?" Study Context Picker */}
          <section className="space-y-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-label-tag text-xs uppercase tracking-widest text-primary font-bold">
                  STUDY CONTEXT ENGINE
                </span>
                <span className="text-on-surface-variant text-xs">• What are you doing right now?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {STUDY_CONTEXT_MIXES.map((mix) => {
                const isActive = activeContextId === mix.id || activeFocusSession?.name === mix.title;
                return (
                  <button
                    key={mix.id}
                    onClick={() => {
                      const contextTracks = TRACKS.filter(
                        (t) =>
                          t.category === mix.contextTag.toLowerCase() ||
                          (t.tags && t.tags.includes(mix.contextTag.toLowerCase())) ||
                          (t.tags && t.tags.includes(mix.title.toLowerCase()))
                      );
                      const primaryTrack =
                        TRACKS.find((t) => t.id === mix.defaultTrackId) || contextTracks[0] || TRACKS[0];
                      playTrack(primaryTrack, contextTracks.length > 0 ? contextTracks : TRACKS);
                      startContextFocusSession(mix.title, mix.durationMins, mix.id);
                    }}
                    className={`p-3 rounded-xl text-left transition-all group space-y-1 shadow-sm relative ${
                      isActive
                        ? 'bg-surface-container border-2 border-primary shadow-md ring-1 ring-primary/40'
                        : 'bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform ${
                          isActive ? 'text-primary scale-110' : 'text-primary group-hover:scale-110'
                        }`}
                      >
                        {mix.icon}
                      </span>
                      <div className="flex items-center gap-1">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
                        <span className="font-label-mono-wide text-[9px] text-on-surface-variant font-semibold">
                          {mix.durationMins}m
                        </span>
                      </div>
                    </div>
                    <div
                      className={`font-headline-sm text-xs font-bold transition-colors truncate ${
                        isActive ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                      }`}
                    >
                      {mix.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-label-tag text-[9px] text-on-surface-variant truncate">
                        {mix.contextTag}
                      </span>
                      {isActive && (
                        <span className="font-label-mono-wide text-[8px] uppercase tracking-wider text-primary font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section: QUICK ACCESS CATEGORIES */}
          <section className="space-y-space-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Nivora Sound Categories
              </h2>
              <span className="font-label-mono-wide text-xs text-on-surface-variant">7 Soundscapes</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {QUICK_ACCESS_CARDS.map((card) => (
                <div
                  key={card.id}
                  onClick={() => navigateTo('category', card.category)}
                  className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-outline-variant/30 hover:border-primary/50 cursor-pointer shadow-sm transition-all"
                >
                  <MusicArtwork
                    src={card.artwork}
                    alt={card.title}
                    category={card.category}
                    title={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                    <h3 className="font-headline-sm text-xs font-bold text-white group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="font-label-tag text-[9px] text-white/70 truncate">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: CONTINUE LISTENING */}
          <section className="space-y-space-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Continue Listening
              </h2>
              <button
                onClick={() => navigateTo('recent')}
                className="font-label-mono-wide text-xs text-primary hover:underline"
              >
                View History
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentlyPlayedTracks.slice(0, 4).map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, recentlyPlayedTracks)}
                  className="group p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/70 transition-all flex items-center justify-between gap-3 shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30">
                      <MusicArtwork
                        src={track.artwork}
                        alt={track.title}
                        category={track.category}
                        title={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </h4>
                      <p className="font-label-tag text-[10px] text-on-surface-variant truncate">
                        {track.artist}
                      </p>
                      <span className="font-label-mono-wide text-[9px] text-primary uppercase font-semibold">
                        {track.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentTrack.id === track.id && isPlaying) {
                        togglePlay();
                      } else {
                        playTrack(track, recentlyPlayedTracks);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 hover:bg-primary-fixed transition-colors shadow-sm font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {currentTrack.id === track.id && isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Section: MADE FOR YOUR STUDY (Personalized playlists) */}
          <section className="space-y-space-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-base font-bold text-on-surface">
                  Made For Your Study
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Contextual student study mixes tailored for intense cognitive cadences.
                </p>
              </div>
              <button
                onClick={() => navigateTo('library')}
                className="font-label-mono-wide text-xs text-primary hover:underline"
              >
                All Playlists ({DEFAULT_PLAYLISTS.length})
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {DEFAULT_PLAYLISTS.slice(0, 6).map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => navigateTo('playlist', playlist.id)}
                  className="group p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 cursor-pointer shadow-sm transition-all space-y-2.5"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/30">
                    <MusicArtwork
                      src={playlist.artwork}
                      alt={playlist.name}
                      category={playlist.contextTag}
                      title={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const tracks = playlist.trackIds
                            .map((id) => TRACKS.find((t) => t.id === id))
                            .filter((t): t is Track => !!t);
                          if (tracks.length > 0) {
                            playTrack(tracks[0], tracks);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                        title={`Play ${playlist.name}`}
                      >
                        <span className="material-symbols-outlined text-[24px]">play_arrow</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {playlist.name}
                    </h4>
                    <p className="font-body-sm text-[10.5px] text-on-surface-variant line-clamp-2 mt-0.5 leading-tight">
                      {playlist.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Two-Column Section: Curated Soundscapes (8 cols) & Campus Lounges (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left: Study Soundscapes */}
            <div className="lg:col-span-7 space-y-space-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-base font-bold text-on-surface">
                  Curated Academic Soundscapes
                </h3>
                <span className="font-label-mono-wide text-xs text-on-surface-variant">Binaural &amp; Acoustic</span>
              </div>

              <div className="space-y-1.5 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 shadow-sm">
                {TRACKS.slice(0, 7).map((track, i) => (
                  <TrackRow key={track.id} track={track} index={i} contextQueue={TRACKS} />
                ))}
              </div>
            </div>

            {/* Right: Live Campus Lounges */}
            <div className="lg:col-span-5 space-y-space-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-base font-bold text-on-surface">
                  Live Study Lounges
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-[10px] font-bold">
                  {CAMPUS_LOUNGES.length} Active Rooms
                </span>
              </div>

              <div className="space-y-2 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30 shadow-sm">
                {CAMPUS_LOUNGES.map((lounge) => {
                  const isCurrentLounge = activeLounge?.id === lounge.id;
                  return (
                    <div
                      key={lounge.id}
                      className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isCurrentLounge ? 'bg-primary animate-ping' : 'bg-secondary'}`} />
                          <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate">
                            {lounge.name}
                          </h4>
                        </div>
                        <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
                          {lounge.peers} students connected • Host: {lounge.host}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLoungeForModal(lounge)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-button-text font-bold transition-all shrink-0 ${
                          isCurrentLounge
                            ? 'bg-secondary-container text-on-secondary-container border border-primary/30'
                            : 'bg-primary text-on-primary hover:bg-primary-fixed shadow-sm'
                        }`}
                      >
                        {isCurrentLounge ? 'In Room' : 'Join'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: SEARCH SYSTEM                                */}
      {/* ================================================== */}
      {activeView === 'search' && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          {/* Search Input Field */}
          <div className="relative max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">
              search
            </span>
            <input
              type="text"
              autoFocus
              placeholder="Search tracks, artists, albums, playlists, genres, or moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary font-body-md text-sm shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['all', 'tracks', 'artists', 'albums', 'playlists'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
                  searchCategory === cat
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Empty Search State */}
          {!searchQuery.trim() ? (
            <div className="py-12 text-center space-y-4">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
                manage_search
              </span>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-headline-md text-base font-bold text-on-surface">
                  Search Nivora Academic Audio
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Find neuro-acoustic carrier tones, rain soundscapes, lo-fi coding grooves, or classical felt piano studies.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-xs text-on-surface-variant">Popular searches:</span>
                {['40Hz Gamma', 'Bodleian Rain', 'Chopin Focus', 'LoFi Compiler', 'Deep Flow'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setSearchQuery(hint)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-mono-wide text-xs"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="space-y-6">
              {/* Tracks Section */}
              {(searchCategory === 'all' || searchCategory === 'tracks') && searchResults.tracks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Tracks ({searchResults.tracks.length})
                  </h3>
                  <div className="bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 space-y-1">
                    {searchResults.tracks.map((t, idx) => (
                      <TrackRow
                        key={t.id}
                        track={t}
                        index={idx}
                        contextQueue={searchResults.tracks}
                        onNavigateArtist={(artistId) => navigateTo('artist', artistId)}
                        onNavigateAlbum={(albumId) => navigateTo('album', albumId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Artists Section */}
              {(searchCategory === 'all' || searchCategory === 'artists') && searchResults.artists.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Artists ({searchResults.artists.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {searchResults.artists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => navigateTo('artist', artist.id)}
                        className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer transition-all text-center space-y-2"
                      >
                        <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border border-outline-variant/30 shadow-sm">
                          <MusicArtwork
                            src={artist.artwork}
                            alt={artist.name}
                            title={artist.name}
                            category="artist"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
                            {artist.name}
                          </div>
                          <div className="font-label-tag text-[9px] text-on-surface-variant truncate">
                            {artist.genre}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Albums Section */}
              {(searchCategory === 'all' || searchCategory === 'albums') && searchResults.albums.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Albums ({searchResults.albums.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {searchResults.albums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => navigateTo('album', album.id)}
                        className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer transition-all space-y-2"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
                          <MusicArtwork
                            src={album.artwork}
                            alt={album.title}
                            title={album.title}
                            category={album.genre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
                            {album.title}
                          </div>
                          <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
                            {album.artist} • {album.releaseYear}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlists Section */}
              {(searchCategory === 'all' || searchCategory === 'playlists') && searchResults.playlists.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Playlists ({searchResults.playlists.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {searchResults.playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => navigateTo('playlist', pl.id)}
                        className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer transition-all space-y-2"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
                          <MusicArtwork
                            src={pl.artwork}
                            alt={pl.name}
                            title={pl.name}
                            category={pl.contextTag || 'playlist'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
                            {pl.name}
                          </div>
                          <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
                            {pl.trackIds.length} Tracks
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Fallback */}
              {searchResults.tracks.length === 0 &&
                searchResults.artists.length === 0 &&
                searchResults.albums.length === 0 &&
                searchResults.playlists.length === 0 && (
                  <div className="py-12 text-center space-y-2">
                    <p className="font-headline-sm text-sm font-bold text-on-surface">
                      No matching soundscapes found for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Try searching by keyword like &ldquo;Gamma&rdquo;, &ldquo;Focus&rdquo;, &ldquo;Rain&rdquo;, or &ldquo;Coding&rdquo;.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: YOUR LIBRARY                                 */}
      {/* ================================================== */}
      {activeView === 'library' && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          {/* Library Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['all', 'playlists', 'liked', 'albums', 'artists'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLibraryFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-label-mono-wide uppercase transition-colors whitespace-nowrap ${
                    libraryFilter === filter
                      ? 'bg-secondary-container text-on-secondary-container font-bold'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-label-tag text-xs uppercase text-on-surface-variant">Sort:</span>
              <select
                value={librarySort}
                onChange={(e) => setLibrarySort(e.target.value as any)}
                className="bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-label-mono-wide uppercase rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="recent">Recently Added</option>
                <option value="alpha">Alphabetical</option>
                <option value="count">Track Count</option>
              </select>

              <button
                onClick={() => setIsImporterOpen(true)}
                className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-button-text font-bold hover:bg-primary-fixed shadow-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>+ Add Music</span>
              </button>

              <button
                onClick={() => navigateTo('manage')}
                className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-bright border border-outline-variant/30 text-on-surface text-xs font-button-text font-semibold shadow-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Manage Music</span>
              </button>

              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-button-text font-semibold shadow-sm border border-outline-variant/20"
              >
                + New Playlist
              </button>
            </div>
          </div>

          {/* Library Grid Items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Liked Songs Special Card */}
            {(libraryFilter === 'all' || libraryFilter === 'liked') && (
              <div
                onClick={() => navigateTo('liked')}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#1C2A30] to-[#172329] border border-primary/40 hover:border-primary cursor-pointer shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-md">
                  <span className="material-symbols-outlined text-[28px] filled">favorite</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface">Liked Tracks</h4>
                  <p className="font-label-tag text-[10px] text-primary font-semibold mt-0.5">
                    {likedTracks.length} Saved Tracks
                  </p>
                </div>
              </div>
            )}

            {/* Manage Library / Imported Tracks Card */}
            {(libraryFilter === 'all' || libraryFilter === 'playlists') && (
              <div
                onClick={() => navigateTo('manage')}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#1A2822] to-[#121F1A] border border-[#8FC5A7]/30 hover:border-[#8FC5A7] cursor-pointer shadow-md transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#8FC5A7]/15 border border-[#8FC5A7]/25 text-[#8FC5A7] flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">library_music</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface">Manage Music</h4>
                  <p className="font-label-tag text-[10px] text-[#8FC5A7] font-semibold mt-0.5">
                    {importedTracks.length} Imported Tracks • Full Manager
                  </p>
                </div>
              </div>
            )}

            {/* Playlists */}
            {(libraryFilter === 'all' || libraryFilter === 'playlists') &&
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => navigateTo('playlist', pl.id)}
                  className="group p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer shadow-sm transition-all space-y-2"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
                    <MusicArtwork
                      src={pl.artwork}
                      alt={pl.name}
                      title={pl.name}
                      category={pl.contextTag || 'playlist'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {pl.name}
                    </h4>
                    <p className="font-label-tag text-[10px] text-on-surface-variant truncate">
                      {pl.isCustom ? 'Custom Playlist' : 'Nivora Mix'} • {pl.trackIds.length} Tracks
                    </p>
                  </div>
                </div>
              ))}

            {/* Saved Albums */}
            {(libraryFilter === 'all' || libraryFilter === 'albums') &&
              ALBUMS.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => navigateTo('album', alb.id)}
                  className="group p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer shadow-sm transition-all space-y-2"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
                    <MusicArtwork
                      src={alb.artwork}
                      alt={alb.title}
                      title={alb.title}
                      category={alb.genre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {alb.title}
                    </h4>
                    <p className="font-label-tag text-[10px] text-on-surface-variant truncate">
                      {alb.artist} • {alb.releaseYear}
                    </p>
                  </div>
                </div>
              ))}

            {/* Saved Artists */}
            {(libraryFilter === 'all' || libraryFilter === 'artists') &&
              ARTISTS.map((art) => (
                <div
                  key={art.id}
                  onClick={() => navigateTo('artist', art.id)}
                  className="group p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer shadow-sm transition-all space-y-2 text-center"
                >
                  <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border border-outline-variant/30 shadow-sm">
                    <MusicArtwork
                      src={art.artwork}
                      alt={art.name}
                      title={art.name}
                      category="artist"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {art.name}
                    </h4>
                    <p className="font-label-tag text-[10px] text-on-surface-variant truncate">
                      {art.genre}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: LIKED TRACKS                                 */}
      {/* ================================================== */}
      {activeView === 'liked' && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-container-low to-surface-container border border-outline-variant/30 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-md shrink-0">
                <span className="material-symbols-outlined text-[44px] filled">favorite</span>
              </div>
              <div className="space-y-1">
                <span className="font-label-tag text-xs uppercase text-primary font-bold tracking-widest">
                  PLAYLIST
                </span>
                <h2 className="font-display-hero text-2xl sm:text-4xl text-on-surface font-bold">
                  Liked Tracks
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {likedTracks.length} tracks • {calculateTotalDuration(likedTracks)} total audio
                </p>
              </div>
            </div>

            {likedTracks.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playTrack(likedTracks[0], likedTracks)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold hover:bg-primary-fixed shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  <span>Play All</span>
                </button>
              </div>
            )}
          </div>

          {/* Liked Tracks List */}
          {likedTracks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
                favorite_border
              </span>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                Your sound starts here
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto">
                Like tracks while listening to build your personal library of study soundscapes.
              </p>
            </div>
          ) : (
            <div className="bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 space-y-1">
              {likedTracks.map((t, idx) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  index={idx}
                  contextQueue={likedTracks}
                  onNavigateArtist={(artistId) => navigateTo('artist', artistId)}
                  onNavigateAlbum={(albumId) => navigateTo('album', albumId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: RECENTLY PLAYED                              */}
      {/* ================================================== */}
      {activeView === 'recent' && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h2 className="font-headline-md text-lg font-bold text-on-surface">Recently Played</h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                History of your focus and acoustic study sessions.
              </p>
            </div>
            {recentlyPlayedTracks.length > 0 && (
              <button
                onClick={() => playTrack(recentlyPlayedTracks[0], recentlyPlayedTracks)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold hover:bg-primary-fixed shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Play All</span>
              </button>
            )}
          </div>

          {recentlyPlayedTracks.length > 0 ? (
            <div className="bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 space-y-1">
              {recentlyPlayedTracks.map((t, idx) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  index={idx}
                  contextQueue={recentlyPlayedTracks}
                  onNavigateArtist={(artistId) => navigateTo('artist', artistId)}
                  onNavigateAlbum={(albumId) => navigateTo('album', albumId)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">history</span>
              <div className="font-headline-sm text-sm font-semibold text-on-surface">
                No recently played tracks yet
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant max-w-sm mx-auto">
                Start listening to any soundscape, study mix, or category and your playback history will appear here.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
              >
                Explore Music Home
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: PLAYLIST DETAIL                              */}
      {/* ================================================== */}
      {activeView === 'playlist' && selectedPlaylist && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1 text-xs font-label-mono-wide text-on-surface-variant hover:text-on-surface uppercase"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </button>

          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-end justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <MusicArtwork
                src={selectedPlaylist.artwork}
                alt={selectedPlaylist.name}
                title={selectedPlaylist.name}
                category="focus"
                className="w-28 h-28 rounded-2xl object-cover border border-outline-variant/40 shadow-lg shrink-0"
              />
              <div className="space-y-1.5">
                <span className="font-label-tag text-xs uppercase text-primary font-bold tracking-widest">
                  {selectedPlaylist.isCustom ? 'USER PLAYLIST' : 'STUDY MIX'}
                </span>
                <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
                  {selectedPlaylist.name}
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-xl">
                  {selectedPlaylist.description}
                </p>
                <div className="font-label-mono-wide text-[10.5px] text-on-surface-variant/80">
                  {selectedPlaylistTracks.length} tracks • {calculateTotalDuration(selectedPlaylistTracks)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedPlaylistTracks.length > 0 && (
                <button
                  onClick={() => playTrack(selectedPlaylistTracks[0], selectedPlaylistTracks)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold hover:bg-primary-fixed shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  <span>Play Mix</span>
                </button>
              )}

              {selectedPlaylist.isCustom && (
                <button
                  onClick={() => {
                    deletePlaylist(selectedPlaylist.id);
                    navigateTo('library');
                  }}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors"
                  title="Delete Playlist"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 space-y-1">
            {selectedPlaylistTracks.map((t, idx) => (
              <TrackRow
                key={t.id}
                track={t}
                index={idx}
                contextQueue={selectedPlaylistTracks}
                onNavigateArtist={(artistId) => navigateTo('artist', artistId)}
                onNavigateAlbum={(albumId) => navigateTo('album', albumId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: ALBUM DETAIL                                 */}
      {/* ================================================== */}
      {activeView === 'album' && selectedAlbum && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1 text-xs font-label-mono-wide text-on-surface-variant hover:text-on-surface uppercase"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </button>

          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-end justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <MusicArtwork
                src={selectedAlbum.artwork}
                alt={selectedAlbum.title}
                title={selectedAlbum.title}
                category="ambient"
                className="w-28 h-28 rounded-2xl object-cover border border-outline-variant/40 shadow-lg shrink-0"
              />
              <div className="space-y-1.5">
                <span className="font-label-tag text-xs uppercase text-primary font-bold tracking-widest">
                  ALBUM
                </span>
                <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
                  {selectedAlbum.title}
                </h2>
                <div className="flex items-center gap-2 font-body-md text-xs text-on-surface font-semibold">
                  <span
                    onClick={() => navigateTo('artist', selectedAlbum.artistId)}
                    className="hover:text-primary cursor-pointer hover:underline"
                  >
                    {selectedAlbum.artist}
                  </span>
                  <span>•</span>
                  <span>{selectedAlbum.releaseYear}</span>
                  <span>•</span>
                  <span className="text-on-surface-variant font-normal">
                    {selectedAlbumTracks.length} tracks ({calculateTotalDuration(selectedAlbumTracks)})
                  </span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-xl">
                  {selectedAlbum.description}
                </p>
              </div>
            </div>

            {selectedAlbumTracks.length > 0 && (
              <button
                onClick={() => playTrack(selectedAlbumTracks[0], selectedAlbumTracks)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold hover:bg-primary-fixed shadow-md flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Play Album</span>
              </button>
            )}
          </div>

          <div className="bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 space-y-1">
            {selectedAlbumTracks.map((t, idx) => (
              <TrackRow
                key={t.id}
                track={t}
                index={idx}
                contextQueue={selectedAlbumTracks}
                onNavigateArtist={(artistId) => navigateTo('artist', artistId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: ARTIST PROFILE                               */}
      {/* ================================================== */}
      {activeView === 'artist' && selectedArtist && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1 text-xs font-label-mono-wide text-on-surface-variant hover:text-on-surface uppercase"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </button>

          {/* Artist Hero Header */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <MusicArtwork
                src={selectedArtist.artwork}
                alt={selectedArtist.name}
                title={selectedArtist.name}
                category="classical"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-outline-variant/40 shadow-lg shrink-0"
              />
              <div className="space-y-1.5">
                <span className="font-label-tag text-xs uppercase text-primary font-bold tracking-widest">
                  VERIFIED SOUND ARTIST
                </span>
                <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
                  {selectedArtist.name}
                </h2>
                <div className="font-label-mono-wide text-xs text-secondary font-semibold">
                  {selectedArtist.monthlyListeners}
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-xl">
                  {selectedArtist.bio}
                </p>
              </div>
            </div>

            {selectedArtistTracks.length > 0 && (
              <button
                onClick={() => playTrack(selectedArtistTracks[0], selectedArtistTracks)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold hover:bg-primary-fixed shadow-md flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Play Top Tracks</span>
              </button>
            )}
          </div>

          {/* Popular Tracks */}
          <div className="space-y-2">
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">Popular Soundscapes</h3>
            <div className="bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 space-y-1">
              {selectedArtistTracks.map((t, idx) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  index={idx}
                  contextQueue={selectedArtistTracks}
                  onNavigateAlbum={(albumId) => navigateTo('album', albumId)}
                />
              ))}
            </div>
          </div>

          {/* Discography Albums */}
          {selectedArtistAlbums.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">Discography</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedArtistAlbums.map((alb) => (
                  <div
                    key={alb.id}
                    onClick={() => navigateTo('album', alb.id)}
                    className="group p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 cursor-pointer shadow-sm transition-all space-y-2"
                  >
                    <MusicArtwork
                      src={alb.artwork}
                      alt={alb.title}
                      title={alb.title}
                      category="ambient"
                      className="w-full aspect-square rounded-xl object-cover border border-outline-variant/30 shadow-sm"
                    />
                    <div>
                      <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {alb.title}
                      </h4>
                      <p className="font-label-tag text-[10px] text-on-surface-variant truncate">
                        {alb.releaseYear} • {alb.genre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: CATEGORY FILTER VIEW                         */}
      {/* ================================================== */}
      {activeView === 'category' && (
        <div className="space-y-space-md animate-in fade-in duration-150">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1 text-xs font-label-mono-wide text-on-surface-variant hover:text-on-surface uppercase"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </button>

          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-label-tag text-xs uppercase text-primary font-bold tracking-widest">
                NIVORA SOUND CATEGORY
              </span>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface uppercase">
                {selectedEntityId}
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Curated soundscapes filtered specifically for {selectedEntityId} study workflows.
              </p>
            </div>

            {categoryTracks.length > 0 && (
              <button
                onClick={() => playTrack(categoryTracks[0], categoryTracks)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold hover:bg-primary-fixed shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Play Category</span>
              </button>
            )}
          </div>

          <div className="bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 space-y-1">
            {categoryTracks.map((t, idx) => (
              <TrackRow
                key={t.id}
                track={t}
                index={idx}
                contextQueue={categoryTracks}
                onNavigateArtist={(artistId) => navigateTo('artist', artistId)}
                onNavigateAlbum={(albumId) => navigateTo('album', albumId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW: MUSIC LIBRARY MANAGER / ADMIN               */}
      {/* ================================================== */}
      {activeView === 'manage' && (
        <MusicLibraryManagerView
          onBack={() => navigateTo('library')}
          onOpenImporter={() => setIsImporterOpen(true)}
          onNavigateArtist={(artistId) => navigateTo('artist', artistId)}
          onNavigateAlbum={(albumId) => navigateTo('album', albumId)}
        />
      )}

      {/* ================================================== */}
      {/* BULK MUSIC IMPORTER MODAL                          */}
      {/* ================================================== */}
      <BulkMusicImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onSuccess={() => {
          refreshLibrary();
        }}
      />
    </div>
  );
}
