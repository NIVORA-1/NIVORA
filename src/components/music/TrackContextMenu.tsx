'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Track } from '@/lib/musicData';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from '@/components/music/MusicArtwork';

interface TrackContextMenuProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onNavigateArtist?: (artistId: string) => void;
  onNavigateAlbum?: (albumId: string) => void;
}

export default function TrackContextMenu({
  track,
  isOpen,
  onClose,
  position,
  onNavigateArtist,
  onNavigateAlbum,
}: TrackContextMenuProps) {
  const {
    playTrack,
    addToQueue,
    toggleLike,
    isLiked,
    playlists,
    addTrackToPlaylist,
  } = useMusic();

  const [showPlaylistsSubmenu, setShowPlaylistsSubmenu] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const liked = isLiked(track.id);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Viewport clamping
  const menuWidth = 220;
  const menuHeight = 280;
  const padding = 16;
  const left = Math.min(position.x, window.innerWidth - menuWidth - padding);
  const top = Math.min(position.y, window.innerHeight - menuHeight - padding);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}/music?track=${track.id}`
      );
      setCopiedToast(true);
      setTimeout(() => {
        setCopiedToast(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 w-56 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 text-on-surface font-body-sm text-xs select-none backdrop-blur-xl"
    >
      {/* Header with track mini info */}
      <div className="px-2.5 py-1.5 border-b border-outline-variant/20 mb-1 flex items-center gap-2">
        <MusicArtwork
          src={track.artwork}
          alt={track.title}
          title={track.title}
          category={track.category}
          className="w-6 h-6 rounded object-cover border border-outline-variant/30 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
            {track.title}
          </div>
          <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
            {track.artist}
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        <button
          onClick={() => {
            playTrack(track);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
          <span>Play Now</span>
        </button>

        <button
          onClick={() => {
            addToQueue(track, true);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">playlist_play</span>
          <span>Play Next</span>
        </button>

        <button
          onClick={() => {
            addToQueue(track, false);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">queue_music</span>
          <span>Add to Queue</span>
        </button>

        <button
          onClick={() => {
            toggleLike(track.id);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${
              liked ? 'text-primary filled' : 'text-on-surface-variant'
            }`}
          >
            favorite
          </span>
          <span>{liked ? 'Remove from Liked' : 'Save to Liked Songs'}</span>
        </button>

        {/* Add to Playlist Submenu Trigger */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowPlaylistsSubmenu(true)}
            onClick={() => setShowPlaylistsSubmenu((prev) => !prev)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                playlist_add
              </span>
              <span>Add to Playlist</span>
            </div>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              chevron_right
            </span>
          </button>

          {showPlaylistsSubmenu && (
            <div
              onMouseLeave={() => setShowPlaylistsSubmenu(false)}
              className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-1.5 z-50 max-h-52 overflow-y-auto backdrop-blur-xl"
            >
              <div className="px-2 py-1 text-[10px] font-label-tag uppercase text-on-surface-variant font-semibold">
                Your Playlists
              </div>
              {playlists.map((pl) => {
                const alreadyIn = pl.trackIds.includes(track.id);
                return (
                  <button
                    key={pl.id}
                    disabled={alreadyIn}
                    onClick={() => {
                      addTrackToPlaylist(pl.id, track.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left truncate transition-colors ${
                      alreadyIn
                        ? 'opacity-40 cursor-default text-on-surface-variant'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <span className="truncate">{pl.name}</span>
                    {alreadyIn && (
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-px bg-outline-variant/20 my-1" />

        {onNavigateArtist && (
          <button
            onClick={() => {
              onNavigateArtist(track.artistId);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              person
            </span>
            <span>View Artist</span>
          </button>
        )}

        {onNavigateAlbum && (
          <button
            onClick={() => {
              onNavigateAlbum(track.albumId);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              album
            </span>
            <span>View Album</span>
          </button>
        )}

        <button
          onClick={handleShare}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            share
          </span>
          <span>{copiedToast ? 'Link Copied!' : 'Share Track'}</span>
        </button>
      </div>
    </div>
  );
}
