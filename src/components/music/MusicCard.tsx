'use client';

import React from 'react';
import { useMusic } from '@/context/MusicContext';
import { Track } from '@/lib/musicData';

interface MusicCardProps {
  track: Track;
  onAddToPlaylist?: (track: Track) => void;
}

export default function MusicCard({ track, onAddToPlaylist }: MusicCardProps) {
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
      console.warn('[MusicCard] Cannot play track: videoId is missing', track);
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
      className={`group relative flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
        isCurrentTrack
          ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
          : 'bg-surface-container/70 hover:bg-surface-container border-white/5 hover:border-white/10 shadow-sm'
      }`}
    >
      {/* Artwork Container */}
      <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-surface-container-high border border-white/10">
        <img
          src={track.artwork || track.coverUrl || `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play Button Overlay (Centered or Bottom Right) */}
        <button
          type="button"
          onClick={handlePlayClick}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${
            isThisPlaying
              ? 'bg-primary text-on-primary scale-100 opacity-100'
              : 'bg-primary text-on-primary opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 hover:scale-110 active:scale-95'
          }`}
          title={isThisPlaying ? 'Pause' : 'Play'}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isThisPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Duration Badge */}
        {track.durationFormatted && (
          <div className="absolute bottom-2.5 left-2.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono font-semibold text-white/90">
            {track.durationFormatted}
          </div>
        )}
      </div>

      {/* Track Metadata */}
      <div className="pt-2.5 flex-1 flex flex-col justify-between">
        <div>
          <h4
            className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
              isCurrentTrack ? 'text-primary' : 'text-on-surface group-hover:text-primary'
            }`}
            title={track.title}
          >
            {track.title}
          </h4>
          <p className="text-[11px] text-on-surface-variant truncate mt-1">
            {track.channelTitle || track.artist || 'YouTube Artist'}
          </p>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5 text-on-surface-variant">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              liked ? 'text-primary' : 'hover:text-on-surface'
            }`}
            title={liked ? 'Unlike' : 'Favorite'}
          >
            <span className={`material-symbols-outlined text-[18px] ${liked ? 'filled' : ''}`}>
              favorite
            </span>
          </button>

          {onAddToPlaylist && (
            <button
              type="button"
              onClick={handleAddToPlaylistClick}
              className="p-1 rounded-lg hover:text-on-surface transition-colors cursor-pointer"
              title="Add to Playlist"
            >
              <span className="material-symbols-outlined text-[18px]">playlist_add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
