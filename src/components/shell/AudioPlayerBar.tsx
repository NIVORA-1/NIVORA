import React from 'react';
import { usePathname } from 'next/navigation';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from '@/components/music/MusicArtwork';
import NowPlayingModal from '@/components/music/NowPlayingModal';
import QueueDrawer from '@/components/music/QueueDrawer';
import CreatePlaylistModal from '@/components/music/CreatePlaylistModal';
import CampusLoungeModal from '@/components/music/CampusLoungeModal';
import FocusSessionBanner from '@/components/music/FocusSessionBanner';

export default function AudioPlayerBar() {
  const pathname = usePathname();
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
    showMiniPlayer,
    hasEverPlayed,
    isMiniPlayerMinimized,
    setIsMiniPlayerMinimized,
  } = useMusic();

  const liked = isLiked(currentTrack.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Modals are always rendered so overlays function properly
  const modals = (
    <>
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

  // If no track has ever been played and not on /music, do not show music player at all
  if (!hasEverPlayed && !isMusicPage) {
    return modals;
  }

  return (
    <>
      {/* 1. ON NON-MUSIC PAGES: SHOW COMPACT FLOATING MINI PLAYER */}
      {!isMusicPage && showMiniPlayer && (
        <>
          {isMiniPlayerMinimized ? (
            /* Minimized Sleek Pill in Bottom Right */
            <div className="fixed bottom-5 right-5 sm:right-8 z-40 animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsMiniPlayerMinimized(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#172329]/95 dark:bg-[#172329]/95 light:bg-white/95 border border-[#29383D] dark:border-[#29383D] light:border-[#E0DDD4] shadow-2xl backdrop-blur-xl text-xs hover:border-[#8FC5A7] transition-all group cursor-pointer"
                title="Expand Mini Player"
              >
                <span className={`material-symbols-outlined text-[18px] text-[#8FC5A7] ${isPlaying ? 'animate-pulse' : ''}`}>
                  headphones
                </span>
                <span className="font-semibold text-on-surface truncate max-w-[130px]">
                  {currentTrack.title}
                </span>
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#8FC5A7] animate-ping' : 'bg-on-surface-variant/40'}`} />
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-[#8FC5A7] transition-colors">
                  expand_less
                </span>
              </button>
            </div>
          ) : (
            /* Floating Mini Player */
            <div className="fixed bottom-5 right-5 sm:right-8 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md w-[calc(100vw-2.5rem)] sm:w-auto select-none">
              <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-2 rounded-2xl bg-[#172329]/95 dark:bg-[#172329]/95 light:bg-white/95 border border-[#29383D] dark:border-[#29383D] light:border-[#E0DDD4] shadow-2xl backdrop-blur-xl">
                {/* Artwork & Title */}
                <div
                  onClick={() => setIsNowPlayingOpen(true)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                  title="Click to expand player"
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30 shadow-sm">
                    <MusicArtwork
                      src={currentTrack.artwork}
                      alt={currentTrack.title}
                      category={currentTrack.category}
                      title={currentTrack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 max-w-[100px] sm:max-w-[130px]">
                    <div className="text-xs font-bold text-on-surface truncate group-hover:text-[#8FC5A7] transition-colors">
                      {currentTrack.title}
                    </div>
                    <div className="text-[10px] text-on-surface-variant truncate">
                      {currentTrack.artist}
                    </div>
                  </div>
                </div>

                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-7 h-7 rounded-full bg-[#8FC5A7] text-[#0F171B] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Compact Progress Slider */}
                <div className="w-16 sm:w-24 hidden xs:flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={playbackPosition}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="w-full h-1 bg-[#29383D] rounded-lg appearance-none cursor-pointer accent-[#8FC5A7]"
                  />
                </div>

                {/* Volume / Mute Toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 text-on-surface-variant hover:text-on-surface transition-colors shrink-0 cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                  </span>
                </button>

                {/* Full Player Expand (⛶) */}
                <button
                  type="button"
                  onClick={() => setIsNowPlayingOpen(true)}
                  className="p-1 text-on-surface-variant hover:text-[#8FC5A7] transition-colors shrink-0 cursor-pointer"
                  title="Expand to Full Player"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                </button>

                {/* Minimize Button (✕) */}
                <button
                  type="button"
                  onClick={() => setIsMiniPlayerMinimized(true)}
                  className="p-1 text-on-surface-variant hover:text-[#8FC5A7] transition-colors shrink-0 cursor-pointer"
                  title="Minimize Player (Music continues playing)"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. ON MUSIC PAGE: SHOW FULL EXISTING PLAYER DOCK */}
      {isMusicPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-low/95 backdrop-blur-2xl border-t border-outline-variant/30 px-3 sm:px-6 py-2 shadow-2xl transition-all select-none">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-6">
          {/* Left Column: Artwork, Track Title, Artist, Like Button */}
          <div className="flex items-center gap-3 min-w-0 max-w-[40%] sm:w-1/4">
            <div
              onClick={() => setIsNowPlayingOpen(true)}
              className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30 shadow-sm cursor-pointer group"
              title="Expand Now Playing"
            >
              <MusicArtwork
                src={currentTrack.artwork}
                alt={currentTrack.title}
                category={currentTrack.category}
                title={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">open_in_full</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div
                onClick={() => setIsNowPlayingOpen(true)}
                className="font-headline-sm text-xs font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </div>
              <div className="flex items-center gap-1.5 font-label-tag text-[10px] text-on-surface-variant truncate">
                <span className="truncate">{currentTrack.artist}</span>
                {currentTrack.freq && (
                  <span className="px-1.5 py-0.2 rounded bg-surface-container text-primary font-label-mono-wide text-[9px] uppercase font-bold shrink-0">
                    {currentTrack.freq}Hz
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => toggleLike(currentTrack.id)}
              className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                liked ? 'text-primary' : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <span className={`material-symbols-outlined text-[18px] ${liked ? 'filled' : ''}`}>
                favorite
              </span>
            </button>
          </div>

          {/* Center Column: Playback Controls & Interactive Progress Bar */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-xl">
            {/* Top row: Transport Controls */}
            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={toggleShuffle}
                className={`p-1 rounded-lg transition-colors hidden sm:block ${
                  shuffle ? 'text-primary font-bold' : 'text-on-surface-variant/70 hover:text-on-surface'
                }`}
                title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
                <span className="material-symbols-outlined text-[18px]">shuffle</span>
              </button>

              <button
                onClick={prevTrack}
                className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                title="Previous Track (P)"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">skip_previous</span>
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-fixed shadow-md hover:scale-105 active:scale-95 transition-all font-bold"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                onClick={nextTrack}
                className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                title="Next Track (N)"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">skip_next</span>
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1 rounded-lg transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-primary font-bold' : 'text-on-surface-variant/70 hover:text-on-surface'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
                </span>
              </button>
            </div>

            {/* Bottom row: Time & Progress Slider */}
            <div className="w-full flex items-center gap-2 pt-1">
              <span className="font-label-mono-wide text-[10px] text-on-surface-variant w-8 text-right hidden sm:inline">
                {formatTime(playbackPosition)}
              </span>

              <div className="relative w-full flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={playbackPosition}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary group-hover:h-1.5 transition-all"
                />
              </div>

              <span className="font-label-mono-wide text-[10px] text-on-surface-variant w-8 text-left hidden sm:inline">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Column: Mini Equalizer, Queue, Volume, Fullscreen Expand */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0 max-w-[40%] sm:w-1/4">
            {/* Animated Equalizer */}
            <div
              onClick={() => setIsNowPlayingOpen(true)}
              className="hidden lg:flex items-end gap-0.5 h-4 px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/20 cursor-pointer"
              title="Acoustic Carrier Active"
            >
              <span className={`w-0.5 bg-primary rounded-full ${isPlaying ? 'animate-bounce h-3' : 'h-1'}`} />
              <span
                className={`w-0.5 bg-primary-container rounded-full ${isPlaying ? 'animate-bounce h-4' : 'h-2'}`}
                style={{ animationDelay: '150ms' }}
              />
              <span
                className={`w-0.5 bg-secondary rounded-full ${isPlaying ? 'animate-bounce h-2.5' : 'h-1.5'}`}
                style={{ animationDelay: '300ms' }}
              />
            </div>

            {/* Queue Toggle Button */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                isQueueOpen
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              title="Playback Queue"
            >
              <span className="material-symbols-outlined text-[18px]">queue_music</span>
            </button>

            {/* Volume Control (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant">
              <button
                onClick={toggleMute}
                className="hover:text-on-surface p-1"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isMuted || volume === 0
                    ? 'volume_off'
                    : volume > 0.5
                    ? 'volume_up'
                    : 'volume_down'}
                </span>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 accent-primary h-1 bg-surface-container rounded-lg cursor-pointer"
                title="Master Volume"
              />
            </div>

            {/* Fullscreen / Expand Button */}
            <button
              onClick={() => setIsNowPlayingOpen(true)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Expand to Fullscreen"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Persistent App Modals & Overlays */}
      <NowPlayingModal />
      <QueueDrawer />
      <CreatePlaylistModal />
      <CampusLoungeModal />
      <FocusSessionBanner />
    </>
  );
}
