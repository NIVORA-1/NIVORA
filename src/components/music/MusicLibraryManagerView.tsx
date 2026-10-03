'use client';

import React, { useState, useMemo } from 'react';
import { useMusic } from '@/context/MusicContext';
import { MusicCategory, Track } from '@/lib/musicData';
import MusicArtwork from './MusicArtwork';

interface MusicLibraryManagerViewProps {
  onBack: () => void;
  onOpenImporter: () => void;
  onNavigateArtist?: (artistId: string) => void;
  onNavigateAlbum?: (albumId: string) => void;
}

export default function MusicLibraryManagerView({
  onBack,
  onOpenImporter,
  onNavigateArtist,
  onNavigateAlbum,
}: MusicLibraryManagerViewProps) {
  const {
    allTracks,
    importedTracks,
    playlists,
    playTrack,
    currentTrack,
    isPlaying,
    toggleLike,
    isLiked,
    bulkDeleteTracks,
    bulkUpdateCategory,
    bulkAddToPlaylist,
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [targetCategory, setTargetCategory] = useState<MusicCategory>('focus');
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Recently Added tracks
  const recentlyAddedTracks = useMemo(() => {
    if (importedTracks.length > 0) {
      return [...importedTracks].reverse().slice(0, 3);
    }
    return [...allTracks].slice(0, 3);
  }, [importedTracks, allTracks]);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return allTracks.filter((t) => {
      if (selectedCategory === 'imported') {
        const isImp = importedTracks.some((it) => it.id === t.id);
        if (!isImp) return false;
      } else if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchArtist = t.artist.toLowerCase().includes(q);
        const matchAlbum = (t.album || '').toLowerCase().includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        const matchTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchArtist && !matchAlbum && !matchCategory && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [allTracks, importedTracks, selectedCategory, searchQuery]);

  const allFilteredSelected =
    filteredTracks.length > 0 &&
    filteredTracks.every((t) => selectedTrackIds.includes(t.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedTrackIds([]);
    } else {
      setSelectedTrackIds(filteredTracks.map((t) => t.id));
    }
  };

  const toggleSelectTrack = (trackId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedTrackIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedTrackIds.length} track${
          selectedTrackIds.length === 1 ? '' : 's'
        }?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await bulkDeleteTracks(selectedTrackIds);
      setSelectedTrackIds([]);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkCategoryChange = async () => {
    if (selectedTrackIds.length === 0) return;
    await bulkUpdateCategory(selectedTrackIds, targetCategory);
  };

  const handleBulkAddToPlaylist = () => {
    if (selectedTrackIds.length === 0 || !targetPlaylistId) return;
    bulkAddToPlaylist(selectedTrackIds, targetPlaylistId);
    setTargetPlaylistId('');
    setSelectedTrackIds([]);
  };

  return (
    <div className="space-y-space-md animate-in fade-in duration-150">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-label-mono-wide text-on-surface-variant hover:text-on-surface uppercase mb-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Library</span>
          </button>
          <h2 className="font-headline-md text-2xl font-bold text-on-surface">
            Music Library Manager
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Manage audio tracks, assign acoustic study categories, and configure external audio streams.
          </p>
        </div>

        <button
          onClick={onOpenImporter}
          className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold hover:bg-primary-fixed shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Add Music</span>
        </button>
      </div>

      {/* Library Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="font-label-tag text-[10px] uppercase text-primary font-bold">
            Total Tracks
          </span>
          <div className="font-headline-md text-2xl font-bold text-on-surface">
            {allTracks.length}
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant">
            Catalog & configured soundscapes
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="font-label-tag text-[10px] uppercase text-secondary font-bold">
            Playlists
          </span>
          <div className="font-headline-md text-2xl font-bold text-on-surface">
            {playlists.length}
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant">
            Study mixes & custom playlists
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="font-label-tag text-[10px] uppercase text-primary font-bold">
            Sound Categories
          </span>
          <div className="font-headline-md text-2xl font-bold text-on-surface">
            7
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant">
            Calibrated focus frequencies
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <span className="font-label-tag text-[10px] uppercase text-amber-400 font-bold">
            External Tracks
          </span>
          <div className="font-headline-md text-2xl font-bold text-on-surface">
            {importedTracks.length}
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant">
            Configured external audio streams
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, artists, categories..."
            className="w-full bg-surface-container border border-outline-variant/40 rounded-xl pl-9 pr-8 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-label-mono-wide uppercase">
          {['all', 'imported', 'focus', 'lofi', 'ambient', 'classical', 'nature', 'binaural', 'campus'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat === 'all' ? 'All' : cat === 'imported' ? 'Imported' : cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bulk Actions Floating Toolbar (When items selected) */}
      {selectedTrackIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-surface-container border border-primary/40 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
          <div className="flex items-center gap-2 font-bold text-on-surface">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono text-[11px]">
              {selectedTrackIds.length}
            </span>
            <span>tracks selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Change Category */}
            <div className="flex items-center gap-1">
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value as MusicCategory)}
                className="bg-surface-container-high border border-outline-variant/40 rounded-lg px-2 py-1 text-xs text-on-surface font-label-mono-wide uppercase focus:outline-none"
              >
                <option value="focus">Focus</option>
                <option value="lofi">Lo-Fi</option>
                <option value="ambient">Ambient</option>
                <option value="classical">Classical</option>
                <option value="nature">Nature</option>
                <option value="binaural">Binaural</option>
                <option value="campus">Campus</option>
              </select>
              <button
                onClick={handleBulkCategoryChange}
                className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant border border-outline-variant/40 text-xs font-semibold text-on-surface"
              >
                Set Category
              </button>
            </div>

            {/* Bulk Add to Playlist */}
            {playlists.length > 0 && (
              <div className="flex items-center gap-1">
                <select
                  value={targetPlaylistId}
                  onChange={(e) => setTargetPlaylistId(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 rounded-lg px-2 py-1 text-xs text-on-surface font-label-mono-wide focus:outline-none max-w-[140px] truncate"
                >
                  <option value="">Add to Playlist...</option>
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAddToPlaylist}
                  disabled={!targetPlaylistId}
                  className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant border border-outline-variant/40 text-xs font-semibold text-on-surface disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            )}

            {/* Bulk Delete */}
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-3 py-1 rounded-lg bg-error-container/20 hover:bg-error-container/40 border border-error/30 text-xs font-bold text-error flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Recently Added Showcase */}
      {recentlyAddedTracks.length > 0 && (
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-2 font-label-tag text-xs uppercase text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">new_releases</span>
              Recently Added to Library
            </div>
            <span className="font-label-mono-wide text-[10px] text-on-surface-variant">
              Latest {recentlyAddedTracks.length} tracks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {recentlyAddedTracks.map((t) => {
              const isCurrent = currentTrack.id === t.id;
              return (
                <div
                  key={`recent-added-${t.id}`}
                  onClick={() => playTrack(t, allTracks)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30 bg-surface-container-high">
                      <MusicArtwork
                        src={t.artwork}
                        alt={t.title}
                        title={t.title}
                        category={t.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`font-headline-sm text-xs font-bold truncate group-hover:text-primary transition-colors ${
                          isCurrent ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
                        {t.artist}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-mono-wide text-[9px] uppercase font-bold border border-outline-variant/30">
                      {t.category}
                    </span>
                    <span className="font-label-mono-wide text-[10px] text-on-surface-variant">
                      {Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracks Table View */}
      <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/50 font-label-tag text-[10.5px] uppercase tracking-wider text-on-surface-variant">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Track</th>
                <th className="p-3 hidden md:table-cell">Album</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Duration</th>
                <th className="p-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredTracks.map((track, idx) => {
                const isSelected = selectedTrackIds.includes(track.id);
                const isCurrent = currentTrack.id === track.id;
                const liked = isLiked(track.id);

                return (
                  <tr
                    key={track.id}
                    className={`hover:bg-surface-container/50 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTrack(track.id)}
                        className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>

                    {/* Number / Play Action */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => playTrack(track, filteredTracks)}
                        className="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors mx-auto"
                        title="Play Track"
                      >
                        {isCurrent && isPlaying ? (
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            graphic_eq
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-primary">
                            play_arrow
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Track Info */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30">
                          <MusicArtwork
                            src={track.artwork}
                            alt={track.title}
                            title={track.title}
                            category={track.category}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`font-headline-sm font-bold truncate cursor-pointer hover:text-primary transition-colors ${
                              isCurrent ? 'text-primary' : 'text-on-surface'
                            }`}
                            onClick={() => playTrack(track, filteredTracks)}
                          >
                            {track.title}
                          </div>
                          <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
                            {track.artist}
                            {track.audioSrc && (
                              <span className="ml-2 text-[9px] px-1 py-0.2 rounded bg-surface-container text-primary font-mono uppercase">
                                Local Audio
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Album */}
                    <td className="p-3 hidden md:table-cell text-on-surface-variant truncate max-w-[150px]">
                      {track.album || '—'}
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-mono-wide text-[10px] uppercase font-bold border border-outline-variant/30">
                        {track.category}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="p-3 text-right font-label-mono-wide text-[11px] text-on-surface-variant">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleLike(track.id)}
                          className={`p-1 rounded hover:text-primary transition-colors ${
                            liked ? 'text-primary' : 'text-on-surface-variant/70'
                          }`}
                          title={liked ? 'Unlike' : 'Like'}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${liked ? 'filled' : ''}`}>
                            favorite
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTracks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl mb-1 text-on-surface-variant/40">
                      music_off
                    </span>
                    <div className="font-semibold text-xs">No tracks found</div>
                    <p className="text-[11px] mt-0.5">
                      Try adjusting your search query or import audio files using + Add Music.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
