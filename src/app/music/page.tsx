'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMusic, UserPlaylist } from '@/context/MusicContext';
import { useApp } from '@/context/AppContext';
import { Track, youtubeItemToTrack } from '@/lib/musicData';
import MusicSongRow from '@/components/music/MusicSongRow';
import MusicCard from '@/components/music/MusicCard';
import PlaylistDetailView from '@/components/music/PlaylistDetailView';
import AddToPlaylistModal from '@/components/music/AddToPlaylistModal';

type MusicNavTab = 'home' | 'search' | 'library' | 'playlists' | 'recent';

const FILTER_TAGS = ['Focus', 'Coding', 'Study', 'Reading', 'Relax', 'Workout'] as const;

// Exact query mappings per requirements
const FILTER_QUERIES: Record<string, string> = {
  Focus: 'deep focus instrumental music',
  Coding: 'coding music',
  Study: 'lofi study music',
  Reading: 'reading ambient music',
  Relax: 'calm relaxing music',
  Workout: 'workout music',
};

const FILTER_CATEGORY_MAP: Record<string, 'focus' | 'lofi' | 'ambient'> = {
  Focus: 'focus',
  Coding: 'focus',
  Study: 'lofi',
  Reading: 'ambient',
  Relax: 'ambient',
  Workout: 'focus',
};

const SEARCH_SUGGESTIONS = [
  'lofi study',
  'deep focus',
  'coding music',
  'calm piano',
  'instrumental study',
  'ambient focus',
];

export default function MusicPage() {
  const { user } = useApp();
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    favorites,
    recentlyPlayed,
    userPlaylists,
    setIsCreatePlaylistOpen,
  } = useMusic();

  // Navigation tab: Home, Search, Library, Playlists, Recently Played
  const [activeTab, setActiveTab] = useState<MusicNavTab>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Home filter state
  const [selectedFilter, setSelectedFilter] = useState<string>('Focus');
  const [filterRecommendations, setFilterRecommendations] = useState<Track[]>([]);
  const [isLoadingFilterRecs, setIsLoadingFilterRecs] = useState<boolean>(true);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchHasSearched, setSearchHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Library sub-filter
  const [librarySubTab, setLibrarySubTab] = useState<'liked' | 'recent' | 'playlists'>('liked');

  // Add to Playlist modal state
  const [trackForPlaylistModal, setTrackForPlaylistModal] = useState<Track | null>(null);

  // ----------------------------------------------------
  // FETCH RECOMMENDATIONS WHEN FILTER CHANGES
  // ----------------------------------------------------
  const fetchFilterRecs = useCallback(async (tag: string) => {
    setIsLoadingFilterRecs(true);
    setFilterError(null);
    const query = FILTER_QUERIES[tag] || 'deep focus instrumental music';
    const category = FILTER_CATEGORY_MAP[tag] || 'focus';

    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data.error ||
          (res.status === 503 ? 'Music service is not configured.' : 'Unable to load music right now.');
        setFilterError(errorMsg);
        setFilterRecommendations([]);
        return;
      }

      if (data.items && Array.isArray(data.items)) {
        const mapped = data.items.map((item: any) => youtubeItemToTrack(item, category));
        setFilterRecommendations(mapped);
        setFilterError(null);
      } else {
        setFilterRecommendations([]);
      }
    } catch (e) {
      console.warn('Error fetching YouTube music:', e);
      setFilterError('Unable to load music right now.');
      setFilterRecommendations([]);
    } finally {
      setIsLoadingFilterRecs(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterRecs(selectedFilter);
  }, [selectedFilter, fetchFilterRecs]);

  // ----------------------------------------------------
  // DEBOUNCED SEARCH EXECUTION (350ms)
  // ----------------------------------------------------
  const executeSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchHasSearched(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchHasSearched(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data.error ||
          (res.status === 503 ? 'Music service is not configured.' : 'Unable to load music right now.');
        setSearchError(errorMsg);
        setSearchResults([]);
        return;
      }

      if (data.items && Array.isArray(data.items)) {
        const mapped = data.items.map((item: any) => youtubeItemToTrack(item, 'focus'));
        setSearchResults(mapped);
        setSearchError(null);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.warn('Search API error:', e);
      setSearchError('Unable to load music right now.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      executeSearch(val);
    }, 350);
  };

  const handleSearchSuggestionClick = (query: string) => {
    setSearchQuery(query);
    executeSearch(query);
  };

  // Navigation handlers
  const handleNavClick = (tab: MusicNavTab) => {
    setActiveTab(tab);
    setSelectedPlaylistId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickFavorites = () => {
    setActiveTab('library');
    setLibrarySubTab('liked');
    setSelectedPlaylistId(null);
  };

  const handleOpenAddToPlaylist = (track: Track) => {
    setTrackForPlaylistModal(track);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 pb-28 animate-in fade-in duration-200">
      {/* -------------------------------------------------- */}
      {/* 1. CLEAN MODERN HEADER (PART 3)                    */}
      {/* -------------------------------------------------- */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Music
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Focus, study, relax, or recharge.
          </p>
        </div>

        {/* Right side clean actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <button
            type="button"
            onClick={() => handleNavClick('search')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-surface-container hover:bg-surface-container-high border-white/10 text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>Search</span>
          </button>

          {/* Quick Favorites */}
          <button
            type="button"
            onClick={handleQuickFavorites}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 text-on-surface text-xs font-semibold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">favorite</span>
            <span>Favorites ({favorites.length})</span>
          </button>

          {/* Create Playlist */}
          <button
            type="button"
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">playlist_add</span>
            <span>Create Playlist</span>
          </button>
        </div>
      </header>

      {/* Unauthenticated notice */}
      {!user && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-container border border-primary/20 text-xs text-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">info</span>
            <span>Sign in to save your favorites, playlists, and listening history across devices.</span>
          </div>
          <a
            href="/login"
            className="text-primary font-bold hover:underline shrink-0 text-xs"
          >
            Sign in
          </a>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 2. NEW CLEAN NAVIGATION (PART 2)                   */}
      {/* -------------------------------------------------- */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5 scrollbar-none">
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'home' && !selectedPlaylistId
              ? 'bg-primary text-on-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('search')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'search'
              ? 'bg-primary text-on-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('library')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'library' && !selectedPlaylistId
              ? 'bg-primary text-on-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">library_music</span>
          <span>Library</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('playlists')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'playlists' || selectedPlaylistId
              ? 'bg-primary text-on-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">queue_music</span>
          <span>Playlists ({userPlaylists.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('recent')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'recent'
              ? 'bg-primary text-on-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>Recently Played</span>
        </button>
      </nav>

      {/* -------------------------------------------------- */}
      {/* 3. PLAYLIST DETAIL SUB-VIEW (If selected)          */}
      {/* -------------------------------------------------- */}
      {selectedPlaylistId && (
        <PlaylistDetailView
          playlistId={selectedPlaylistId}
          onBack={() => setSelectedPlaylistId(null)}
          onAddToPlaylist={handleOpenAddToPlaylist}
        />
      )}

      {/* -------------------------------------------------- */}
      {/* 4. HOME VIEW (PART 4)                              */}
      {/* -------------------------------------------------- */}
      {!selectedPlaylistId && activeTab === 'home' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Section 1: What do you want to listen to? */}
          <section className="space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
              What do you want to listen to?
            </h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {FILTER_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedFilter(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                    selectedFilter === tag
                      ? 'bg-primary border-primary text-on-primary shadow-sm font-bold'
                      : 'bg-surface-container hover:bg-surface-container-high border-white/10 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Error Message Alert Banner */}
          {filterError && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300">
              <span className="material-symbols-outlined text-2xl shrink-0">warning</span>
              <div>
                <p className="text-sm font-semibold">{filterError}</p>
                {filterError === 'Music service is not configured.' && (
                  <p className="text-xs text-amber-300/80 mt-0.5">Please configure YOUTUBE_API_KEY in the server environment.</p>
                )}
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoadingFilterRecs && (
            <div className="space-y-8">
              <div className="space-y-3.5">
                <div className="h-4 w-44 bg-surface-container rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-surface-container animate-pulse space-y-3">
                      <div className="aspect-video w-full rounded-xl bg-surface-container-high" />
                      <div className="h-4 w-3/4 bg-surface-container-high rounded" />
                      <div className="h-3 w-1/2 bg-surface-container-high rounded" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="h-4 w-48 bg-surface-container rounded animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-surface-container animate-pulse space-y-2">
                      <div className="aspect-video sm:aspect-square w-full rounded-xl bg-surface-container-high" />
                      <div className="h-3 w-3/4 bg-surface-container-high rounded" />
                      <div className="h-2.5 w-1/2 bg-surface-container-high rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real YouTube API Results */}
          {!isLoadingFilterRecs && !filterError && filterRecommendations.length > 0 && (
            <>
              {/* Section 2: Featured Real YouTube Music */}
              <section className="space-y-3.5">
                <h2 className="text-sm font-bold text-on-surface">Featured {selectedFilter} Music</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filterRecommendations.slice(0, 4).map((track) => {
                    const targetVideoId = track?.videoId || track?.id;
                    const isTrackPlaying =
                      isPlaying &&
                      Boolean(targetVideoId) &&
                      ((Boolean(currentTrack?.videoId) && (currentTrack.videoId === targetVideoId || currentTrack.videoId === track.id)) ||
                       (Boolean(currentTrack?.id) && (currentTrack.id === targetVideoId || currentTrack.id === track.id)));

                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          if (targetVideoId) playTrack(track, filterRecommendations);
                        }}
                        className="group relative flex flex-col justify-between p-4 rounded-2xl bg-surface-container/70 hover:bg-surface-container border border-white/5 hover:border-white/15 transition-all shadow-sm cursor-pointer overflow-hidden"
                      >
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-surface-container-high border border-white/10 mb-3">
                          <img
                            src={track.artwork || track.coverUrl || `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          {track.durationFormatted && (
                            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono font-semibold text-white/90">
                              {track.durationFormatted}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!targetVideoId) return;
                              if (isTrackPlaying) togglePlay();
                              else playTrack(track, filterRecommendations);
                            }}
                            className={`absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transition-all cursor-pointer font-bold ${
                              isTrackPlaying ? 'scale-100 opacity-100' : 'opacity-90 group-hover:scale-110'
                            }`}
                            title={isTrackPlaying ? 'Pause' : 'Play'}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isTrackPlaying ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1" title={track.title}>
                            {track.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant truncate">
                            {track.channelTitle || track.artist}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 3: Made For Your Study (Real Music Cards) */}
              {filterRecommendations.length > 4 && (
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-on-surface">Made For Your Study</h2>
                      <p className="text-xs text-on-surface-variant">
                        Curated {selectedFilter.toLowerCase()} soundtracks for focused sessions
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {filterRecommendations.slice(4).map((track) => (
                      <MusicCard
                        key={track.id}
                        track={track}
                        onAddToPlaylist={handleOpenAddToPlaylist}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Empty state when no results and no error */}
          {!isLoadingFilterRecs && !filterError && filterRecommendations.length === 0 && (
            <div className="py-16 text-center space-y-2 rounded-2xl bg-surface-container/30 border border-white/5">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                music_off
              </span>
              <p className="text-sm text-on-surface-variant font-medium">No music found.</p>
            </div>
          )}

          {/* Section 4: Continue Listening (Real Supabase history only) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">Continue Listening</h2>
              {recentlyPlayed.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleNavClick('recent')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  View All ({recentlyPlayed.length})
                </button>
              )}
            </div>

            {recentlyPlayed.length === 0 ? (
              <div className="p-6 rounded-2xl bg-surface-container/40 border border-white/5 text-center text-xs text-on-surface-variant">
                Your listening history will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentlyPlayed.slice(0, 4).map((track, idx) => (
                  <MusicSongRow
                    key={track.id + idx}
                    track={track}
                    showIndex={false}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Your Library Quick Access */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-on-surface">Your Library</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Liked Songs Tile */}
              <div
                onClick={() => {
                  setActiveTab('library');
                  setLibrarySubTab('liked');
                }}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-container/70 hover:bg-surface-container border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px] filled">favorite</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Liked Songs
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {favorites.length} {favorites.length === 1 ? 'track' : 'tracks'}
                  </div>
                </div>
              </div>

              {/* Recently Played Tile */}
              <div
                onClick={() => handleNavClick('recent')}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-container/70 hover:bg-surface-container border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">history</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-on-surface group-hover:text-secondary transition-colors">
                    Recently Played
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {recentlyPlayed.length} {recentlyPlayed.length === 1 ? 'track' : 'tracks'}
                  </div>
                </div>
              </div>

              {/* Playlists Tile */}
              <div
                onClick={() => handleNavClick('playlists')}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-container/70 hover:bg-surface-container border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">queue_music</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Your Playlists
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {userPlaylists.length} {userPlaylists.length === 1 ? 'playlist' : 'playlists'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 5. SEARCH VIEW (PART 5)                            */}
      {/* -------------------------------------------------- */}
      {!selectedPlaylistId && activeTab === 'search' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Large Search Input */}
          <div className="relative w-full max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[22px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              autoFocus
              placeholder="Search songs, artists, playlists..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-surface-container border border-white/10 focus:border-primary text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none transition-all shadow-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setSearchHasSearched(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Search Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">
              Popular Searches
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSearchSuggestionClick(suggestion)}
                  className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Area */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {isSearching
                  ? 'Searching YouTube...'
                  : searchHasSearched
                  ? `Results (${searchResults.length})`
                  : 'Recommended Study Soundtracks'}
              </h3>
            </div>

            {/* Search Error Alert Banner */}
            {searchError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300">
                <span className="material-symbols-outlined text-2xl shrink-0">warning</span>
                <div>
                  <p className="text-sm font-semibold">{searchError}</p>
                  {searchError === 'Music service is not configured.' && (
                    <p className="text-xs text-amber-300/80 mt-0.5">Please configure YOUTUBE_API_KEY in the server environment.</p>
                  )}
                </div>
              </div>
            )}

            {/* Skeleton Loading State */}
            {isSearching && (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-container animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-1/3 bg-surface-container-high rounded" />
                      <div className="h-2.5 w-1/4 bg-surface-container-high rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Empty State */}
            {!isSearching && !searchError && searchHasSearched && searchResults.length === 0 && (
              <div className="py-16 text-center space-y-2 rounded-2xl bg-surface-container/30 border border-white/5">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                  search_off
                </span>
                <p className="text-sm text-on-surface-variant font-medium">No music found.</p>
                <p className="text-xs text-on-surface-variant/60">
                  Try searching for &quot;lofi study&quot;, &quot;deep focus&quot;, or &quot;coding music&quot;.
                </p>
              </div>
            )}

            {/* Search Results List */}
            {!isSearching && !searchError && searchResults.length > 0 && (
              <div className="space-y-1.5">
                {searchResults.map((track, idx) => (
                  <MusicSongRow
                    key={track.id + idx}
                    track={track}
                    index={idx}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                  />
                ))}
              </div>
            )}

            {/* Initial suggestions if no search performed yet */}
            {!isSearching && !searchHasSearched && !searchError && (
              <div className="space-y-1.5">
                {filterRecommendations.map((track, idx) => (
                  <MusicSongRow
                    key={track.id + idx}
                    track={track}
                    index={idx}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 6. LIBRARY VIEW (PART 18)                          */}
      {/* -------------------------------------------------- */}
      {!selectedPlaylistId && activeTab === 'library' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-Tabs: Liked Songs | Recently Played | Saved Playlists */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => setLibrarySubTab('liked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                librarySubTab === 'liked'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Liked Songs ({favorites.length})
            </button>

            <button
              type="button"
              onClick={() => setLibrarySubTab('recent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                librarySubTab === 'recent'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Recently Played ({recentlyPlayed.length})
            </button>

            <button
              type="button"
              onClick={() => setLibrarySubTab('playlists')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                librarySubTab === 'playlists'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Saved Playlists ({userPlaylists.length})
            </button>
          </div>

          {/* SubTab A: Liked Songs */}
          {librarySubTab === 'liked' && (
            <div className="space-y-3">
              {favorites.length === 0 ? (
                <div className="py-14 text-center rounded-2xl bg-surface-container/30 border border-white/5 space-y-2">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                    favorite_border
                  </span>
                  <p className="text-sm text-on-surface-variant">No liked songs yet.</p>
                  <p className="text-xs text-on-surface-variant/60">
                    Click the heart icon on any song to add it to your favorites.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {favorites.map((track, idx) => (
                    <MusicSongRow
                      key={track.id + idx}
                      track={track}
                      index={idx}
                      onAddToPlaylist={handleOpenAddToPlaylist}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab B: Recently Played */}
          {librarySubTab === 'recent' && (
            <div className="space-y-3">
              {recentlyPlayed.length === 0 ? (
                <div className="py-14 text-center rounded-2xl bg-surface-container/30 border border-white/5 space-y-2">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                    history
                  </span>
                  <p className="text-sm text-on-surface-variant">Your listening history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentlyPlayed.map((track, idx) => (
                    <MusicSongRow
                      key={track.id + idx}
                      track={track}
                      index={idx}
                      onAddToPlaylist={handleOpenAddToPlaylist}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab C: Saved Playlists */}
          {librarySubTab === 'playlists' && (
            <div className="space-y-3">
              {userPlaylists.length === 0 ? (
                <div className="py-14 text-center rounded-2xl bg-surface-container/30 border border-white/5 space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                    playlist_add
                  </span>
                  <p className="text-sm text-on-surface-variant">No playlists created yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsCreatePlaylistOpen(true)}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed shadow-md"
                  >
                    Create Your First Playlist
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {userPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-container/70 hover:bg-surface-container border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                    >
                      <img
                        src={pl.artwork || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'}
                        alt={pl.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                          {pl.name}
                        </div>
                        <div className="text-xs text-on-surface-variant truncate">
                          {pl.trackCount || 0} {pl.trackCount === 1 ? 'song' : 'songs'}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:translate-x-1 transition-transform">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 7. PLAYLISTS TAB (PART 16 & 17)                    */}
      {/* -------------------------------------------------- */}
      {!selectedPlaylistId && activeTab === 'playlists' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">Your Playlists</h2>
            <button
              type="button"
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Playlist</span>
            </button>
          </div>

          {userPlaylists.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-surface-container/30 border border-white/5 space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                queue_music
              </span>
              <p className="text-sm text-on-surface-variant">You don&apos;t have any playlists yet.</p>
              <p className="text-xs text-on-surface-variant/60 max-w-sm mx-auto">
                Create custom playlists to group your favorite study soundtracks, lo-fi beats, or ambient noise.
              </p>
              <button
                type="button"
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-fixed shadow-md mt-2 cursor-pointer"
              >
                + Create Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl bg-surface-container/70 hover:bg-surface-container border border-white/5 hover:border-white/10 transition-all shadow-sm cursor-pointer"
                >
                  <img
                    src={pl.artwork || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'}
                    alt={pl.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      {pl.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">
                      {pl.description || `${pl.trackCount || 0} tracks`}
                    </p>
                    <div className="text-[10px] text-on-surface-variant/60 mt-1">
                      {pl.trackCount || 0} {pl.trackCount === 1 ? 'song' : 'songs'}
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-on-surface-variant text-[22px] group-hover:text-primary group-hover:translate-x-1 transition-all">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 8. RECENTLY PLAYED TAB                             */}
      {/* -------------------------------------------------- */}
      {!selectedPlaylistId && activeTab === 'recent' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">Recently Played Tracks</h2>
            <span className="text-xs text-on-surface-variant">
              {recentlyPlayed.length} {recentlyPlayed.length === 1 ? 'track' : 'tracks'}
            </span>
          </div>

          {recentlyPlayed.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-surface-container/30 border border-white/5 space-y-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                history
              </span>
              <p className="text-sm text-on-surface-variant">Your listening history will appear here.</p>
              <p className="text-xs text-on-surface-variant/60">
                Start playing any track and it will automatically be remembered here.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentlyPlayed.map((track, idx) => (
                <MusicSongRow
                  key={track.id + idx}
                  track={track}
                  index={idx}
                  onAddToPlaylist={handleOpenAddToPlaylist}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        track={trackForPlaylistModal}
        isOpen={Boolean(trackForPlaylistModal)}
        onClose={() => setTrackForPlaylistModal(null)}
      />
    </div>
  );
}
