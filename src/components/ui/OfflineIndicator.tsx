'use client';

import React, { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capacitor Network listener
    let removeCapListener: (() => void) | null = null;
    async function initCapNetwork() {
      try {
        const { Network } = await import('@capacitor/network');
        const status = await Network.getStatus();
        setIsOffline(!status.connected);

        const listener = await Network.addListener('networkStatusChange', (s) => {
          setIsOffline(!s.connected);
        });
        removeCapListener = () => listener.remove();
      } catch (e) {
        // Capacitor network not active (regular web browser)
      }
    }

    initCapNetwork();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (removeCapListener) removeCapListener();
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
      if (res.ok || res.status) {
        setIsOffline(false);
      }
    } catch (e) {
      setIsOffline(true);
    } finally {
      setTimeout(() => setIsChecking(false), 500);
    }
  };

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-950/90 text-amber-200 border-b border-amber-800/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-xs animate-in slide-in-from-top-full duration-300 shadow-md"
    >
      <div className="flex items-center gap-2 max-w-[80%]">
        <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0">
          wifi_off
        </span>
        <span>
          <strong>You are currently offline.</strong> Streaming music, Nivora AI, and cloud sync will resume once reconnected.
        </span>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        disabled={isChecking}
        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold border border-amber-500/40 text-[11px] transition-colors shrink-0 disabled:opacity-50"
      >
        {isChecking ? 'Checking...' : 'Retry'}
      </button>
    </div>
  );
}
