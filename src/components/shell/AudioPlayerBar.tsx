'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from '@/components/music/MusicArtwork';
import NowPlayingModal from '@/components/music/NowPlayingModal';
import QueueDrawer from '@/components/music/QueueDrawer';
import CreatePlaylistModal from '@/components/music/CreatePlaylistModal';
import CampusLoungeModal from '@/components/music/CampusLoungeModal';
import FocusSessionBanner from '@/components/music/FocusSessionBanner';

// Client-only persistent YouTube player instance (Requirement 3, 4, 6, 14, 15)
const YouTubePlayerBridge = dynamic(
  () => import('@/components/music/YouTubePlayerBridge'),
  { ssr: false }
);

export default function AudioPlayerBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isMusicPage = pathname?.startsWith('/music');

  const {
    currentTrack,
    isPlaying,
    playbackPosition,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    isQueueOpen,
    setIsQueueOpen,
    setIsNowPlayingOpen,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLiked,
    enableMusicPlayer,
    hasEverPlayed,
    playbackError,
    clearPlaybackError,
  } = useMusic();

  const liked = isLiked(currentTrack.id);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (playbackPosition / duration) * 100 : 0;

  // Modals and client-only YouTube bridge are always rendered
  const modals = (
    <>
      <YouTubePlayerBridge />
      <NowPlayingModal />
      <QueueDrawer />
      <CreatePlaylistModal />
      <CampusLoungeModal />
      <FocusSessionBanner />
    </>
  );

  // If user disabled music player globally in Settings
  if (!enableMusicPlayer) {
    return modals;
  }

  return (
    <>
      {/* Global Modals */}
      {modals}

      {/* Sticky Bottom Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121214]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] select-none transition-all">
        {/* Playback Error Alert Toast */}
        {playbackError && (
          <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-red-300">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-red-400">warning</span>
              <span>{playbackError}</span>
            </div>
            <button
              onClick={clearPlaybackError}
              className="text-white/70 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Thin top progress bar for mobile */}
        <div className="sm:hidden w-full h-1 bg-white/10 relative overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {/* Main Dock Container */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* STATE A: NO MUSIC PLAYING YET */}
          {!hasEverPlayed && !isPlaying ? (
            <div className="w-full flex items-center justify-between py-1">
              <div
                onClick={() => router.push('/music')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary border border-white/10">
                  <span className="material-symbols-outlined text-[20px]">headphones</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                    Choose something to play
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Focus, study, relax, or recharge
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary-fixed hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Play Focus Music</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE B: ACTIVE TRACK / PLAYING */
            <>
              {/* Left Column: Artwork, Track Title, Channel/Artist, Like */}
              <div className="flex items-center gap-3 min-w-0 max-w-[45%] sm:max-w-[28%] flex-1 sm:flex-initial">
                <div
                  onClick={() => setIsNowPlayingOpen(true)}
                  className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-sm cursor-pointer group bg-surface-container"
                  title="Expand Now Playing"
                >
                  <MusicArtwork
                    src={currentTrack.artwork || currentTrack.coverUrl}
                    alt={currentTrack.title}
                    category={currentTrack.category}
                    title={currentTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    onClick={() => setIsNowPlayingOpen(true)}
                    className="text-xs font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors leading-tight"
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </div>
                  <div className="text-[10px] text-on-surface-variant truncate mt-0.5">
                    {currentTrack.channelTitle || currentTrack.artist || 'YouTube Artist'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleLike(currentTrack.id, currentTrack)}
                  className={`p-1.5 rounded-lg transition-colors hidden sm:block cursor-pointer shrink-0 ${
                    liked ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  title={liked ? 'Unlike' : 'Favorite'}
                >
                  <span className={`material-symbols-outlined text-[18px] ${liked ? 'filled' : ''}`}>
                    favorite
                  </span>
                </button>
              </div>

              {/* Center Column: Desktop Transport & Progress Slider */}
              <div className="hidden sm:flex flex-col items-center justify-center flex-1 max-w-xl px-2">
                {/* Transport Buttons: Shuffle, Prev, Play/Pause, Next, Repeat */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleShuffle}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      shuffle ? 'text-primary font-bold' : 'text-on-surface-variant/70 hover:text-on-surface'
                    }`}
                    title={shuffle ? 'Shuffle: On' : 'Shuffle: Off'}
                  >
                    <span className="material-symbols-outlined text-[18px]">shuffle</span>
                  </button>

                  <button
                    type="button"
                    onClick={prevTrack}
                    className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    title="Previous Track (P)"
                  >
                    <span className="material-symbols-outlined text-[20px]">skip_previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer font-bold"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={nextTrack}
                    className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    title="Next Track (N)"
                  >
                    <span className="material-symbols-outlined text-[20px]">skip_next</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleRepeat}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      repeatMode !== 'off' ? 'text-primary font-bold' : 'text-on-surface-variant/70 hover:text-on-surface'
                    }`}
                    title={`Repeat: ${repeatMode}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
                    </span>
                  </button>
                </div>

                {/* Progress Bar & Current Time / Duration */}
                <div className="w-full flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-on-surface-variant w-8 text-right shrink-0">
                    {formatTime(playbackPosition)}
                  </span>

                  <div className="relative w-full flex items-center group">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={playbackPosition}
                      onChange={(e) => seek(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary group-hover:h-1.5 transition-all"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-on-surface-variant w-8 text-left shrink-0">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Mobile Right Quick Transport Controls */}
              <div className="flex sm:hidden items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer font-bold"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={nextTrack}
                  className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Next"
                >
                  <span className="material-symbols-outlined text-[22px]">skip_next</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isQueueOpen ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                  title="Queue"
                >
                  <span className="material-symbols-outlined text-[20px]">queue_music</span>
                </button>
              </div>

              {/* Right Column: Volume, Queue, Fullscreen (Desktop) */}
              <div className="hidden sm:flex items-center justify-end gap-3 shrink-0 sm:max-w-[28%]">
                {/* Volume Control */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    title={isMuted || volume === 0 ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-16 lg:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                </div>

                {/* Queue Toggle */}
                <button
                  type="button"
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                    isQueueOpen
                      ? 'bg-primary/20 text-primary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                  title="Playback Queue"
                >
                  <span className="material-symbols-outlined text-[18px]">queue_music</span>
                </button>

                {/* Expand Full Player Modal */}
                <button
                  type="button"
                  onClick={() => setIsNowPlayingOpen(true)}
                  className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                  title="Expand Now Playing"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
