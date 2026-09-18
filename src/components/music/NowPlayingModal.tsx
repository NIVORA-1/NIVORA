'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from '@/components/music/MusicArtwork';
import NivoraLogo from '@/components/ui/NivoraLogo';

export default function NowPlayingModal() {
  const {
    currentTrack,
    isPlaying,
    playbackPosition,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    isQueueOpen,
    setIsQueueOpen,
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
    getFrequencyData,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'visualizer' | 'notes'>('visualizer');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const liked = isLiked(currentTrack.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Real-time canvas audio visualizer
  useEffect(() => {
    if (!isNowPlayingOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(32);

    const render = () => {
      getFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / dataArray.length) * 1.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        // Normalize 0-255
        const value = isPlaying ? Math.max(12, dataArray[i]) : 8;
        const barHeight = (value / 255) * height * 0.85;

        // Mint gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(143, 197, 167, 0.2)');
        gradient.addColorStop(0.5, 'rgba(143, 197, 167, 0.8)');
        gradient.addColorStop(1, 'rgba(170, 225, 194, 1.0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth - 3, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isNowPlayingOpen, isPlaying, getFrequencyData]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNowPlayingOpen) {
        setIsNowPlayingOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNowPlayingOpen, setIsNowPlayingOpen]);

  if (!isNowPlayingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F171B]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNowPlayingOpen(false)}
            className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            title="Minimize"
          >
            <span className="material-symbols-outlined text-[22px]">keyboard_arrow_down</span>
          </button>
          <div className="flex items-center gap-2 font-label-mono-wide text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="uppercase tracking-widest text-primary font-bold">NOW PLAYING</span>
            <span className="text-outline-variant">•</span>
            <span className="uppercase">{currentTrack.category}</span>
          </div>
        </div>

        {/* Nivora Brand Mark */}
        <div className="hidden sm:block">
          <NivoraLogo size="compact" priority />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-mono-wide uppercase transition-colors ${
              isQueueOpen
                ? 'bg-primary text-on-primary font-bold'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">queue_music</span>
            <span>Queue</span>
          </button>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="w-full max-w-5xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Big Artwork & Canvas Visualizer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-72 sm:w-80 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 group">
            <MusicArtwork
              src={currentTrack.artwork}
              alt={currentTrack.title}
              category={currentTrack.category}
              title={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Carrier Frequency Badge */}
            {currentTrack.freq && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-primary/40 font-label-mono-wide text-xs text-primary font-bold">
                {currentTrack.freq}Hz Delta
              </div>
            )}
          </div>

          {/* Real-time Web Audio Visualizer Canvas */}
          <div className="w-72 sm:w-80 h-14 rounded-xl bg-surface-container-low border border-outline-variant/20 p-2 flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} width={280} height={40} className="w-full h-full" />
          </div>
        </div>

        {/* Right: Metadata, "Why this track?", Controls & Notes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Title & Artist & Like */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-container font-label-tag text-[10px] uppercase text-primary font-bold">
                <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
                {currentTrack.mood}
              </div>
              <h1 className="font-display-hero text-2xl sm:text-4xl text-on-surface font-bold tracking-tight truncate">
                {currentTrack.title}
              </h1>
              <div className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant font-medium">
                <span>{currentTrack.artist}</span>
                <span>•</span>
                <span>{currentTrack.album}</span>
              </div>
            </div>

            <button
              onClick={() => toggleLike(currentTrack.id)}
              className="p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
              title={liked ? 'Remove from Liked' : 'Save to Liked Songs'}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${
                  liked ? 'text-primary filled' : 'text-on-surface-variant'
                }`}
              >
                favorite
              </span>
            </button>
          </div>

          {/* Tab Switcher: "Why this track?" vs Focus Notes */}
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`text-xs font-label-mono-wide uppercase pb-1 transition-colors ${
                activeTab === 'visualizer'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Why This Track?
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`text-xs font-label-mono-wide uppercase pb-1 transition-colors ${
                activeTab === 'notes'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Study Focus Notes &amp; Spectrum
            </button>
          </div>

          {/* Context Explainer / Notes card */}
          {activeTab === 'visualizer' ? (
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-2 font-label-tag text-[10px] uppercase text-secondary font-bold">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                Cognitive Alignment Rationale
              </div>
              <p className="font-body-md text-xs sm:text-sm text-on-surface leading-relaxed">
                {currentTrack.whyThisTrack}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-2 font-label-tag text-[10px] uppercase text-primary font-bold">
                <span className="material-symbols-outlined text-[16px]">description</span>
                Acoustic Notes &amp; Guidance
              </div>
              <p className="font-label-mono-wide text-xs text-on-surface-variant whitespace-pre-line leading-relaxed">
                {currentTrack.lyricsOrNotes || 'Synthesized pure tone acoustic stream with zero vocal distractions.'}
              </p>
            </div>
          )}

          {/* Progress Bar with Current / Total Time */}
          <div className="space-y-2 pt-2">
            <div className="relative group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={playbackPosition}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="flex justify-between font-label-mono-wide text-xs text-on-surface-variant">
              <span>{formatTime(playbackPosition)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Big Playback Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors ${
                shuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <span className="material-symbols-outlined text-[20px]">shuffle</span>
            </button>

            <button
              onClick={prevTrack}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
              title="Previous"
            >
              <span className="material-symbols-outlined text-[28px]">skip_previous</span>
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-fixed shadow-xl hover:scale-105 transition-all font-bold"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <span className="material-symbols-outlined text-[36px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              onClick={nextTrack}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
              title="Next"
            >
              <span className="material-symbols-outlined text-[28px]">skip_next</span>
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-lg transition-colors ${
                repeatMode !== 'off' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
              </span>
            </button>
          </div>

          {/* Volume Slider row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={toggleMute}
              className="text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[20px]">
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
              className="w-28 accent-primary h-1 bg-surface-container rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Footer Hotkey Reminder */}
      <div className="w-full max-w-5xl mx-auto pt-2 border-t border-outline-variant/10 text-center font-label-mono-wide text-[11px] text-on-surface-variant/70 flex flex-wrap items-center justify-center gap-4">
        <span>Space: Play/Pause</span>
        <span>•</span>
        <span>← / →: Seek 5s</span>
        <span>•</span>
        <span>M: Mute</span>
        <span>•</span>
        <span>N: Next</span>
        <span>•</span>
        <span>P: Prev</span>
        <span>•</span>
        <span>Esc: Minimize</span>
      </div>
    </div>
  );
}
