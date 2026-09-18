'use client';

import React, { useState } from 'react';
import { useMusic } from '@/context/MusicContext';

export default function CreatePlaylistModal() {
  const { isCreatePlaylistOpen, setIsCreatePlaylistOpen, createPlaylist } = useMusic();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name, description);
    setName('');
    setDescription('');
    setIsCreatePlaylistOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 text-on-surface">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">playlist_add</span>
            <h3 className="font-headline-md text-base font-bold text-on-surface">Create Study Playlist</h3>
          </div>
          <button
            onClick={() => setIsCreatePlaylistOpen(false)}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-label-tag text-xs uppercase text-on-surface-variant font-bold">
              Playlist Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Midterms Deep Work Sprint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary font-body-md text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-tag text-xs uppercase text-on-surface-variant font-bold">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Target study goals, duration, or focus notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary font-body-md text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatePlaylistOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-button-text font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-button-text font-bold hover:bg-primary-fixed disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
