'use client';

import React from 'react';
import { useMusic } from '@/context/MusicContext';
import { Track } from '@/lib/musicData';

interface MusicSongRowProps {
  track: Track;
  index?: number;
  onAddToPlaylist?: (track: Track) => void;
  onRemoveFromPlaylist?: (track: Track) => void;
  showIndex?: boolean;
}

export default function MusicSongRow({
  track,
  index,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  showIndex = true,
}: MusicSongRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLiked } = useMusic();

  const targetVideoId = track?.videoId || track?.id;
  const isCurrentTrack = Boolean(targetVideoId) && (
    (Boolean(currentTrack?.videoId) && (currentTrack.videoId === targetVideoId || currentTrack.videoId === track.id)) ||
    (Boolean(currentTrack?.id) && (currentTrack.id === targetVideoId || currentTrack.id === track.id))
  );
  const isThisPlaying = isCurrentTrack && isPlaying;
  const liked = isLiked(track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetVideoId) {
      console.warn('[MusicSongRow] Cannot play track: videoId is missing', track);
      return;
    }
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track.id, track);
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToPlaylist) onAddToPlaylist(track);
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
        isCurrentTrack
          ? 'bg-primary/10 border-primary/30 text-on-surface'
          : 'bg-surface-container/60 hover:bg-surface-container border-white/5 hover:border-white/10 text-on-surface'
      }`}
    >
      {/* Left: Index / Play status + Thumbnail + Title + Channel */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showIndex && typeof index === 'number' && (
          <div className="w-5 text-center text-xs font-mono text-on-surface-variant group-hover:hidden shrink-0">
            {isThisPlaying ? (
              <span className="material-symbols-outlined text-primary text-[16px] animate-pulse">volume_up</span>
            ) : (
              index + 1
            )}
          </div>
        )}

        {/* Thumbnail with hover play overlay */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container border border-white/10">
          <img
            src={track.artwork || track.coverUrl || `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-white text-[20px]">
              {isThisPlaying ? 'pause' : 'play_arrow'}
            </span>
          </div>
        </div>

        {/* Track Title and Channel/Artist */}
        <div className="min-w-0 flex-1 pr-2">
          <div
            className={`text-xs font-bold truncate leading-tight transition-colors ${
              isCurrentTrack ? 'text-primary' : 'text-on-surface group-hover:text-primary'
            }`}
            title={track.title}
          >
            {track.title}
          </div>
          <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
            {track.channelTitle || track.artist || 'YouTube Artist'}
          </div>
        </div>
      </div>

      {/* Right Column: Duration + Actions (Heart, Add to Playlist, Remove) */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Duration */}
        <span className="text-[11px] font-mono text-on-surface-variant hidden xs:inline-block w-12 text-right">
          {track.durationFormatted || '3:30'}
        </span>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            liked ? 'text-primary' : 'text-on-surface-variant/60 hover:text-on-surface'
          }`}
          title={liked ? 'Unlike' : 'Favorite'}
        >
          <span className={`material-symbols-outlined text-[18px] ${liked ? 'filled' : ''}`}>
            favorite
          </span>
        </button>

        {/* Add to Playlist Button */}
        {onAddToPlaylist && (
          <button
            type="button"
            onClick={handleAddToPlaylistClick}
            className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer"
            title="Add to Playlist"
          >
            <span className="material-symbols-outlined text-[18px]">playlist_add</span>
          </button>
        )}

        {/* Remove from Playlist Button */}
        {onRemoveFromPlaylist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromPlaylist(track);
            }}
            className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Remove from playlist"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}

        {/* Quick Play Button */}
        <button
          type="button"
          onClick={handlePlayClick}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isThisPlaying
              ? 'bg-primary text-on-primary'
              : 'bg-white/10 text-on-surface hover:bg-primary hover:text-on-primary'
          }`}
          title={isThisPlaying ? 'Pause' : 'Play'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isThisPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>
      </div>
    </div>
  );
}
