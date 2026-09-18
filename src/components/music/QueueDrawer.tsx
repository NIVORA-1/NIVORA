'use client';

import React from 'react';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from '@/components/music/MusicArtwork';

export default function QueueDrawer() {
  const {
    currentTrack,
    isPlaying,
    queue,
    isQueueOpen,
    setIsQueueOpen,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = useMusic();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-surface-container-low/98 backdrop-blur-xl border-l border-outline-variant/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">queue_music</span>
          <h3 className="font-headline-sm text-sm font-bold text-on-surface">Playback Queue</h3>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-[11px] font-label-mono-wide uppercase text-on-surface-variant hover:text-error transition-colors px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Scrollable Queue Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Section 1: Now Playing */}
        <div className="space-y-2">
          <div className="font-label-tag text-[10px] uppercase text-primary tracking-widest font-bold">
            Now Playing
          </div>
          <div className="p-3 rounded-xl bg-surface-container-high border border-primary/40 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30">
                <MusicArtwork
                  src={currentTrack.artwork}
                  alt={currentTrack.title}
                  category={currentTrack.category}
                  title={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
                  {currentTrack.title}
                </div>
                <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
                  {currentTrack.artist}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="font-label-mono-wide text-[10px] text-primary font-bold">
                {isPlaying ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Up Next */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-label-tag text-[10px] uppercase text-on-surface-variant tracking-widest font-bold">
            <span>Next in Queue</span>
            <span>{queue.length} Tracks</span>
          </div>

          {queue.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">
                playlist_play
              </span>
              <p className="font-headline-sm text-xs font-bold text-on-surface">Queue is empty</p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">
                Add tracks from study soundscapes, playlists, or search to build your sequence.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className="group p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 flex items-center justify-between transition-colors"
                >
                  <div
                    onClick={() => {
                      playTrack(track);
                      removeFromQueue(idx);
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="font-label-mono-wide text-[10px] text-on-surface-variant/60 w-4">
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-outline-variant/30">
                      <MusicArtwork
                        src={track.artwork}
                        alt={track.title}
                        category={track.category}
                        title={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-headline-sm text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </div>
                      <div className="font-label-tag text-[10px] text-on-surface-variant truncate">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  {/* Reorder & Remove Actions */}
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        onClick={() => reorderQueue(idx, idx - 1)}
                        className="p-1 text-on-surface-variant hover:text-on-surface"
                        title="Move Up"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                    )}
                    {idx < queue.length - 1 && (
                      <button
                        onClick={() => reorderQueue(idx, idx + 1)}
                        className="p-1 text-on-surface-variant hover:text-on-surface"
                        title="Move Down"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      </button>
                    )}
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 text-on-surface-variant hover:text-error"
                      title="Remove from Queue"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Close */}
      <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/50">
        <button
          onClick={() => setIsQueueOpen(false)}
          className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-xs font-bold transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
