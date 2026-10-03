'use client';

import React, { useState, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';
import { Track, dbRecordToTrack } from '@/lib/musicData';
import MusicSongRow from './MusicSongRow';

interface PlaylistDetailViewProps {
  playlistId: string;
  onBack: () => void;
  onAddToPlaylist?: (track: Track) => void;
}

export default function PlaylistDetailView({
  playlistId,
  onBack,
  onAddToPlaylist,
}: PlaylistDetailViewProps) {
  const { playTrack, deletePlaylist, removeTrackFromPlaylist } = useMusic();
  const [playlist, setPlaylist] = useState<any>(null);
  const [items, setItems] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const loadPlaylist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/music/playlists/${playlistId}`);
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data.playlist);
        setEditName(data.playlist.name);
        setEditDesc(data.playlist.description || '');
        if (data.playlist.items && Array.isArray(data.playlist.items)) {
          setItems(data.playlist.items.map((i: any) => dbRecordToTrack(i, 'focus')));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch playlist detail:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const handlePlayAll = (shuffle = false) => {
    if (items.length === 0) return;
    let queueTracks = [...items];
    if (shuffle) {
      queueTracks = queueTracks.sort(() => Math.random() - 0.5);
    }
    playTrack(queueTracks[0], queueTracks);
  };

  const handleSaveRename = async () => {
    try {
      const res = await fetch(`/api/music/playlists/${playlistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc }),
      });
      if (res.ok) {
        setIsEditing(false);
        loadPlaylist();
      }
    } catch (e) {
      console.warn('Rename error:', e);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${playlist?.name}"?`)) {
      await deletePlaylist(playlistId);
      onBack();
    }
  };

  const handleRemoveTrack = async (track: Track) => {
    await removeTrackFromPlaylist(playlistId, track.id);
    setItems((prev) => prev.filter((t) => t.id !== track.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-8">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-surface-container animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-surface-container rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-surface-container rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-on-surface-variant">Playlist not found.</p>
        <button
          onClick={onBack}
          className="text-xs text-primary font-bold hover:underline cursor-pointer"
        >
          ← Back to Playlists
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer group"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </span>
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 p-5 rounded-2xl bg-surface-container/60 border border-white/10">
        <img
          src={playlist.artwork || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'}
          alt={playlist.name}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shrink-0 border border-white/10 shadow-lg"
        />

        <div className="flex-1 space-y-2 min-w-0 w-full">
          <div className="text-[10px] uppercase font-bold tracking-wider text-primary">
            Student Playlist
          </div>

          {isEditing ? (
            <div className="space-y-2 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container border border-primary text-sm text-on-surface focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-1 rounded-lg bg-surface-container border border-white/10 text-xs text-on-surface focus:outline-none"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveRename}
                  className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface truncate">
                {playlist.name}
              </h2>
              {playlist.description && (
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex items-center gap-3 text-xs text-on-surface-variant pt-1">
            <span>{items.length} {items.length === 1 ? 'song' : 'songs'}</span>
            <span>•</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              <span>Rename</span>
            </button>
            <span>•</span>
            <button
              onClick={handleDelete}
              className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              <span>Delete</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-3">
            <button
              disabled={items.length === 0}
              onClick={() => handlePlayAll(false)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary-fixed disabled:opacity-40 transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Play All</span>
            </button>

            <button
              disabled={items.length === 0}
              onClick={() => handlePlayAll(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-white/10 text-on-surface text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">shuffle</span>
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Track List */}
      <div className="space-y-1.5">
        <h3 className="text-xs uppercase font-bold text-on-surface-variant tracking-wider px-1">
          Tracks ({items.length})
        </h3>

        {items.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-container/30 border border-white/5 space-y-2">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">
              music_off
            </span>
            <p className="text-xs text-on-surface-variant">No songs in this playlist yet.</p>
            <p className="text-[11px] text-on-surface-variant/60">
              Search for study tracks and click &quot;Add to Playlist&quot; to populate your mix.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((track, idx) => (
              <MusicSongRow
                key={track.id + idx}
                track={track}
                index={idx}
                onAddToPlaylist={onAddToPlaylist}
                onRemoveFromPlaylist={handleRemoveTrack}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
