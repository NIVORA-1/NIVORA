'use client';

import React, { useState } from 'react';
import { Track } from '@/lib/musicData';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from '@/components/music/MusicArtwork';
import HoverPreview from '@/components/ui/HoverPreview';
import TrackContextMenu from './TrackContextMenu';

interface TrackRowProps {
  track: Track;
  index?: number;
  showArtwork?: boolean;
  showAlbum?: boolean;
  contextQueue?: Track[];
  onRemove?: () => void;
  onNavigateArtist?: (artistId: string) => void;
  onNavigateAlbum?: (albumId: string) => void;
}

export default function TrackRow({
  track,
  index,
  showArtwork = true,
  showAlbum = true,
  contextQueue,
  onRemove,
  onNavigateArtist,
  onNavigateAlbum,
}: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLiked } = useMusic();
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const targetVideoId = track?.videoId || track?.id;
  const isCurrent = Boolean(targetVideoId) && (
    (Boolean(currentTrack?.videoId) && (currentTrack.videoId === targetVideoId || currentTrack.videoId === track.id)) ||
    (Boolean(currentTrack?.id) && (currentTrack.id === targetVideoId || currentTrack.id === track.id))
  );
  const liked = isLiked(track.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRowClick = () => {
    if (!targetVideoId) {
      console.warn('[TrackRow] Cannot play track: missing videoId', track);
      return;
    }
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, contextQueue);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const openContextMenuButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPos({ x: rect.right + 4, y: rect.top });
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onClick={handleRowClick}
        className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer select-none text-xs ${
          isCurrent
            ? 'bg-surface-container-high border border-primary/30 shadow-sm'
            : 'hover:bg-surface-container-high/60 border border-transparent'
        }`}
      >
        {/* Left: Index / Play Icon & Track Metadata */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Index or Play icon */}
          <div className="w-6 flex items-center justify-center shrink-0">
            {isCurrent && isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-0.5 bg-primary rounded-full animate-bounce h-3" />
                <span className="w-0.5 bg-primary-container rounded-full animate-bounce h-2" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 bg-secondary rounded-full animate-bounce h-3.5" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <>
                <span className={`font-label-mono-wide text-on-surface-variant/70 group-hover:hidden ${isCurrent ? 'text-primary font-bold' : ''}`}>
                  {typeof index === 'number' ? index + 1 : '•'}
                </span>
                <span className="material-symbols-outlined text-[18px] text-primary hidden group-hover:inline">
                  {isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </>
            )}
          </div>

          {/* Artwork Thumbnail */}
          {showArtwork && (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30 shadow-sm">
              <MusicArtwork
                src={track.artwork}
                alt={track.title}
                category={track.category}
                title={track.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          )}

          {/* Title & Artist */}
          <div className="min-w-0 flex-1 pr-2">
            <HoverPreview
              title={track.title}
              eyebrow={`${track.category.toUpperCase()} • ${track.mood}`}
              description={track.whyThisTrack}
              details={[
                { label: 'Artist', value: track.artist },
                ...(track.album ? [{ label: 'Album', value: track.album }] : []),
                { label: 'Type', value: track.soundType },
                ...(track.freq ? [{ label: 'Carrier', value: `${track.freq}Hz Delta` }] : []),
              ]}
              actionText="Play Track"
            >
              <div className={`font-headline-sm text-xs font-bold truncate ${isCurrent ? 'text-primary' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                {track.title}
              </div>
            </HoverPreview>

            <div className="flex items-center gap-1.5 font-label-tag text-[10px] text-on-surface-variant truncate mt-0.5">
              <span
                onClick={(e) => {
                  if (onNavigateArtist && track.artistId) {
                    e.stopPropagation();
                    onNavigateArtist(track.artistId);
                  }
                }}
                className={`truncate ${onNavigateArtist && track.artistId ? 'hover:text-on-surface hover:underline' : ''}`}
              >
                {track.artist}
              </span>
              {track.freq && (
                <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-label-mono-wide text-[9px] uppercase font-semibold">
                  {track.freq}Hz
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Album Name (Desktop) */}
        {showAlbum && (
          <div className="hidden md:block w-48 text-on-surface-variant text-[11px] truncate pr-4">
            <span
              onClick={(e) => {
                if (onNavigateAlbum && track.albumId) {
                  e.stopPropagation();
                  onNavigateAlbum(track.albumId);
                }
              }}
              className={`truncate ${onNavigateAlbum && track.albumId ? 'hover:text-on-surface hover:underline' : ''}`}
            >
              {track.album || ''}
            </span>
          </div>
        )}

        {/* Right: Like, Duration & Context Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              liked
                ? 'text-primary'
                : 'text-on-surface-variant/60 hover:text-on-surface opacity-0 group-hover:opacity-100'
            }`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <span className={`material-symbols-outlined text-[16px] ${liked ? 'filled' : ''}`}>
              favorite
            </span>
          </button>

          <span className="font-label-mono-wide text-[11px] text-on-surface-variant w-10 text-right">
            {formatTime(track.duration)}
          </span>

          <button
            onClick={openContextMenuButton}
            className="p-1 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container opacity-0 group-hover:opacity-100 transition-opacity"
            title="More options"
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded-lg text-on-surface-variant/60 hover:text-error hover:bg-surface-container opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Context Menu Modal */}
      {contextMenuPos && (
        <TrackContextMenu
          track={track}
          isOpen={!!contextMenuPos}
          position={contextMenuPos}
          onClose={() => setContextMenuPos(null)}
          onNavigateArtist={onNavigateArtist}
          onNavigateAlbum={onNavigateAlbum}
        />
      )}
    </>
  );
}
