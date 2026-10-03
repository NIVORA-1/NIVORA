'use client';

import React, { useState } from 'react';
import { useMusic } from '@/context/MusicContext';
import { Track } from '@/lib/musicData';

interface AddToPlaylistModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToPlaylistModal({ track, isOpen, onClose }: AddToPlaylistModalProps) {
  const { userPlaylists, addTrackToPlaylist, setIsCreatePlaylistOpen } = useMusic();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !track) return null;

  const handleSelectPlaylist = async (playlistId: string) => {
    setIsSaving(true);
    try {
      await addTrackToPlaylist(playlistId, track);
      setAddedMap((prev) => ({ ...prev, [playlistId]: true }));
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (e) {
      console.error('Error adding track to playlist:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-on-surface">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">playlist_add</span>
            <h3 className="text-sm font-bold text-on-surface">Add to Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Selected Track Pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container border border-outline-variant/20">
          <img
            src={track.artwork || track.coverUrl}
            alt={track.title}
            className="w-9 h-9 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-on-surface truncate">{track.title}</div>
            <div className="text-[10px] text-on-surface-variant truncate">
              {track.channelTitle || track.artist}
            </div>
          </div>
        </div>

        {/* Playlists List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {userPlaylists.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-on-surface-variant">No playlists created yet.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsCreatePlaylistOpen(true);
                }}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                + Create your first playlist
              </button>
            </div>
          ) : (
            userPlaylists.map((playlist) => {
              const isAdded = addedMap[playlist.id];
              return (
                <button
                  key={playlist.id}
                  disabled={isSaving || isAdded}
                  onClick={() => handleSelectPlaylist(playlist.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isAdded
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/20 hover:border-primary/40'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-xs font-semibold text-on-surface truncate">
                      {playlist.name}
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      {playlist.trackCount || 0} tracks
                    </div>
                  </div>
                  {isAdded ? (
                    <span className="material-symbols-outlined text-[18px] text-emerald-400 shrink-0">
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
                      add
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsCreatePlaylistOpen(true);
            }}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Playlist</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface-variant font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
