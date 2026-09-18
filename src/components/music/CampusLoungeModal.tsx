'use client';

import React from 'react';
import { useMusic } from '@/context/MusicContext';
import { TRACKS } from '@/lib/musicData';
import MusicArtwork from '@/components/music/MusicArtwork';

export default function CampusLoungeModal() {
  const {
    selectedLoungeForModal,
    setSelectedLoungeForModal,
    activeLounge,
    joinLounge,
    leaveLounge,
  } = useMusic();

  if (!selectedLoungeForModal) return null;

  const lounge = selectedLoungeForModal;
  const isUserInThisLounge = activeLounge?.id === lounge.id;
  const soundscapeTrack = TRACKS.find((t) => t.id === lounge.trackId) || TRACKS[0];

  const simulatedPeers = [
    { name: lounge.host, role: 'Room Host' },
    { name: 'Alex K. (Year 3)', role: 'Deep Flow' },
    { name: 'Maya S. (Year 2)', role: 'Sprint Active' },
    { name: 'David L. (Year 4)', role: 'Reading' },
    { name: 'Elena R. (Year 1)', role: 'Quiet Study' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-150 text-on-surface">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-outline-variant/20">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-tag text-[10px] uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              LIVE PEER SYNC ACTIVE
            </div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              {lounge.name}
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Hosted by {lounge.host} • {lounge.peers} students connected
            </p>
          </div>

          <button
            onClick={() => setSelectedLoungeForModal(null)}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Description & Tags */}
        <div className="space-y-3">
          <p className="font-body-md text-xs text-on-surface leading-relaxed">
            {lounge.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            {lounge.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface font-label-tag text-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Current Soundscape Card */}
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MusicArtwork
              src={soundscapeTrack.artwork}
              alt={soundscapeTrack.title}
              title={soundscapeTrack.title}
              category={soundscapeTrack.category}
              className="w-11 h-11 rounded-lg object-cover border border-outline-variant/30 shrink-0"
            />
            <div>
              <div className="font-label-tag text-[9px] uppercase text-primary font-bold">
                Synchronized Soundscape
              </div>
              <div className="font-headline-sm text-xs font-bold text-on-surface">
                {soundscapeTrack.title}
              </div>
              <div className="font-label-mono-wide text-[10px] text-on-surface-variant">
                {lounge.carrierInfo}
              </div>
            </div>
          </div>

          <span className="material-symbols-outlined text-primary text-[24px]">graphic_eq</span>
        </div>

        {/* Live Peers Grid */}
        <div className="space-y-2">
          <div className="font-label-tag text-[10px] uppercase text-on-surface-variant font-bold tracking-widest">
            Connected Peers ({lounge.peers})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {simulatedPeers.map((peer, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-surface-container/60 border border-outline-variant/20 flex items-center gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-label-mono-wide text-[10px] text-primary font-bold">
                  {peer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-body-sm text-xs font-semibold text-on-surface truncate">
                    {peer.name}
                  </div>
                  <div className="font-label-tag text-[9px] text-on-surface-variant truncate">
                    {peer.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="font-label-mono-wide text-[10px] text-secondary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Zero-latency acoustic relay
          </div>

          <div className="flex items-center gap-2">
            {isUserInThisLounge ? (
              <button
                onClick={() => {
                  leaveLounge();
                  setSelectedLoungeForModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-error-container/20 text-error hover:bg-error-container/30 text-xs font-button-text font-bold transition-colors"
              >
                Leave Room
              </button>
            ) : (
              <button
                onClick={() => {
                  joinLounge(lounge);
                  setSelectedLoungeForModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-button-text font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span>Join &amp; Sync Audio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
