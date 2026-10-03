'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useMusic } from '@/context/MusicContext';

// Stable constant ID for persistent player container (Requirement 5 & 8)
const PLAYER_CONTAINER_ID = 'nivora-youtube-iframe-player';

// Module-level singletons to prevent multiple YouTube player instances (Requirement 5 & 12)
let scriptLoadingPromise: Promise<any> | null = null;
let persistentYTPlayer: any = null;

function loadYouTubeIframeApi(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available during SSR'));
  }

  const win = window as any;
  if (win.YT && win.YT.Player) {
    return Promise.resolve(win.YT);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript && win.YT && win.YT.Player) {
      resolve(win.YT);
      return;
    }

    const prevOnReady = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === 'function') {
        try {
          prevOnReady();
        } catch {}
      }
      resolve(win.YT);
    };

    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = (err) => {
        scriptLoadingPromise = null;
        reject(err);
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  });

  return scriptLoadingPromise;
}

export default function YouTubePlayerBridge() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    setIsPlaying,
    setPlaybackPosition,
    setDuration,
    setPlaybackError,
    clearPlaybackError,
    nextTrack,
    registerPlayerControls,
  } = useMusic();

  const playerRef = useRef<any>(persistentYTPlayer);
  const isReadyRef = useRef<boolean>(Boolean(persistentYTPlayer));
  const currentVideoIdRef = useRef<string>('');
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;
  const repeatModeRef = useRef<string>(repeatMode);
  repeatModeRef.current = repeatMode;
  const nextTrackRef = useRef<() => void>(nextTrack);
  nextTrackRef.current = nextTrack;
  const pendingTrackIdRef = useRef<string | null>(null);

  // Handle track ended event (Requirement 7 & 10)
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (repeatModeRef.current === 'one') {
      const player = playerRef.current;
      if (player && typeof player.seekTo === 'function') {
        try {
          player.seekTo(0, true);
          player.unMute();
          player.setVolume(100);
          player.playVideo();
          setIsPlaying(true);
        } catch {}
      }
      return;
    }
    nextTrackRef.current();
  }, [setIsPlaying]);

  // Expose imperative controls to MusicContext
  const setupControls = useCallback(
    (player: any) => {
      registerPlayerControls({
        loadAndPlay: (id: string, startSec = 0) => {
          currentVideoIdRef.current = id;
          try {
            player.loadVideoById({ videoId: id, startSeconds: startSec });
            // Requirement 3 & 4: Unmute, set volume 100, and play immediately on user action
            player.unMute();
            player.setVolume(100);
            player.playVideo();
          } catch (e) {
            console.warn('[YouTubePlayerBridge] Error in loadAndPlay:', e);
          }
        },
        loadVideoById: (id: string, startSec = 0) => {
          currentVideoIdRef.current = id;
          try {
            player.loadVideoById({ videoId: id, startSeconds: startSec });
            player.unMute();
            player.setVolume(100);
            player.playVideo();
          } catch (e) {
            console.warn('[YouTubePlayerBridge] Error in loadVideoById:', e);
          }
        },
        playVideo: () => {
          try {
            // Requirement 3 & 4: Unmute, ensure full volume, play
            player.unMute();
            player.setVolume(100);
            player.playVideo();
          } catch (e) {
            console.warn('[YouTubePlayerBridge] Error in playVideo:', e);
          }
        },
        pauseVideo: () => {
          try {
            player.pauseVideo();
          } catch (e) {
            console.warn('[YouTubePlayerBridge] Error in pauseVideo:', e);
          }
        },
        seekTo: (seconds: number) => {
          try {
            // Requirement 11: Seeking must use player.seekTo()
            player.seekTo(seconds, true);
          } catch (e) {
            console.warn('[YouTubePlayerBridge] Error in seekTo:', e);
          }
        },
        setVolume: (volPercent: number) => {
          try {
            // Requirement 9: Volume slider must control player.setVolume()
            player.setVolume(volPercent);
            if (volPercent > 0) player.unMute();
          } catch {}
        },
        mute: () => {
          try {
            player.mute();
          } catch {}
        },
        unMute: () => {
          try {
            player.unMute();
          } catch {}
        },
      });
    },
    [registerPlayerControls]
  );

  // Initialize official YouTube IFrame Player once inside useEffect (Requirement 3, 4, 5, 12, 13)
  useEffect(() => {
    let isMounted = true;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (!isMounted || !YT || !YT.Player) return;

        // Requirement 5 & 12: If persistent instance already exists, reuse it
        if (persistentYTPlayer) {
          playerRef.current = persistentYTPlayer;
          isReadyRef.current = true;
          setupControls(persistentYTPlayer);
          return;
        }

        const container = document.getElementById(PLAYER_CONTAINER_ID);
        if (!container) return;

        const initialTrackId =
          pendingTrackIdRef.current ||
          currentTrackRef.current?.videoId ||
          currentTrackRef.current?.id ||
          undefined;

        try {
          const playerInstance = new YT.Player(PLAYER_CONTAINER_ID, {
            height: '200',
            width: '200',
            videoId: initialTrackId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            },
            events: {
              onReady: (event: any) => {
                if (!isMounted) return;
                isReadyRef.current = true;
                playerRef.current = event.target;
                persistentYTPlayer = event.target;

                setupControls(event.target);

                // Set full initial volume and ensure unmuted
                try {
                  event.target.unMute();
                  event.target.setVolume(100);
                } catch {}

                // If user selected a track while player was mounting, start playback (Requirement 1, 2, 3)
                const targetId =
                  pendingTrackIdRef.current ||
                  currentTrackRef.current?.videoId ||
                  currentTrackRef.current?.id;

                if (targetId && isPlayingRef.current) {
                  currentVideoIdRef.current = targetId;
                  pendingTrackIdRef.current = null;
                  try {
                    event.target.loadVideoById({ videoId: targetId, startSeconds: 0 });
                    event.target.unMute();
                    event.target.setVolume(100);
                    event.target.playVideo();
                  } catch (e) {
                    console.warn('[YouTubePlayerBridge] Error playing pending track on ready:', e);
                  }
                }
              },
              // Requirement 6: Correctly handle PLAYING, PAUSED, ENDED, BUFFERING, CUED
              onStateChange: (event: any) => {
                if (!isMounted) return;
                const state = event.data;

                // 1 = PLAYING
                if (state === 1) {
                  setIsPlaying(true);
                  clearPlaybackError();
                  try {
                    if (event.target.isMuted()) event.target.unMute();
                  } catch {}
                  try {
                    const dur = Math.floor(event.target.getDuration() || 0);
                    if (dur > 0) setDuration(dur);
                  } catch {}
                }
                // 2 = PAUSED
                else if (state === 2) {
                  setIsPlaying(false);
                }
                // 3 = BUFFERING
                else if (state === 3) {
                  setIsPlaying(true);
                  clearPlaybackError();
                }
                // 5 = CUED
                else if (state === 5) {
                  // Video is loaded and cued; if user intended playback, start playing immediately
                  if (isPlayingRef.current) {
                    try {
                      event.target.unMute();
                      event.target.setVolume(100);
                      event.target.playVideo();
                    } catch {}
                  }
                }
                // 0 = ENDED (Requirement 7: automatically move to next track)
                else if (state === 0) {
                  handleEnded();
                }
              },
              onError: (event: any) => {
                if (!isMounted) return;
                console.warn('[YouTubePlayerBridge] YouTube Player error event code:', event.data);
                // Requirement 18: User-friendly error message
                setPlaybackError('Unable to play this track. Try another track.');
                setIsPlaying(false);
              },
            },
          });

          playerRef.current = playerInstance;
          persistentYTPlayer = playerInstance;
        } catch (e) {
          console.warn('[YouTubePlayerBridge] Error initializing YT.Player:', e);
        }
      })
      .catch((e) => {
        console.warn('[YouTubePlayerBridge] Failed to load YouTube script:', e);
      });

    return () => {
      isMounted = false;
    };
  }, [
    handleEnded,
    setupControls,
    setIsPlaying,
    clearPlaybackError,
    setDuration,
    setPlaybackError,
  ]);

  // Synchronize track changes (Requirement 1, 2, 3)
  useEffect(() => {
    const targetVideoId = currentTrack?.videoId || currentTrack?.id;
    if (!targetVideoId) return;

    if (targetVideoId !== currentVideoIdRef.current) {
      currentVideoIdRef.current = targetVideoId;
      const player = playerRef.current;
      if (isReadyRef.current && player && typeof player.loadVideoById === 'function') {
        try {
          player.loadVideoById({ videoId: targetVideoId, startSeconds: 0 });
          if (isPlaying) {
            player.unMute();
            player.setVolume(100);
            player.playVideo();
          }
        } catch (e) {
          console.warn('[YouTubePlayerBridge] Error loading video by id:', e);
        }
      } else {
        pendingTrackIdRef.current = targetVideoId;
      }
    }
  }, [currentTrack, isPlaying]);

  // Synchronize play/pause state changes (Requirement 8)
  useEffect(() => {
    const player = playerRef.current;
    if (!isReadyRef.current || !player) return;

    try {
      const state = player.getPlayerState?.();
      if (isPlaying && state !== 1 && state !== 3) {
        player.unMute();
        player.setVolume(100);
        player.playVideo();
      } else if (!isPlaying && state === 1) {
        player.pauseVideo();
      }
    } catch {}
  }, [isPlaying]);

  // Synchronize volume and mute (Requirement 9)
  useEffect(() => {
    const player = playerRef.current;
    if (!isReadyRef.current || !player) return;
    try {
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(Math.round(volume * 100));
      }
    } catch {}
  }, [volume, isMuted]);

  // Time tracking interval while playing (Requirement 10)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const player = playerRef.current;
        if (player && typeof player.getCurrentTime === 'function') {
          try {
            const currentTime = Math.floor(player.getCurrentTime());
            setPlaybackPosition(currentTime);
            const dur = Math.floor(player.getDuration() || 0);
            if (dur > 0) setDuration(dur);
          } catch {}
        }
      }, 250);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, setPlaybackPosition, setDuration]);

  // Requirement 15 & 16: Keep embedded player compact, visually unobtrusive under AudioPlayerBar (z-40)
  // Positive z-index (35) ensures Chromium compositor does not cull the iframe media pipeline
  return (
    <div
      id="nivora-youtube-player-host"
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: '0px',
        right: '0px',
        width: '200px',
        height: '200px',
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: 35,
        overflow: 'hidden',
      }}
    >
      <div id={PLAYER_CONTAINER_ID} />
    </div>
  );
}
