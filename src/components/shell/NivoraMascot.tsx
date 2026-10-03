'use client';

import React from 'react';

export type MascotSize = 'compact' | 'default' | 'large';

interface NivoraMascotProps {
  size?: MascotSize;
  isActive?: boolean;
  isFloating?: boolean;
  className?: string;
  showTooltip?: boolean;
  tooltipText?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

const SIZE_CONFIGS: Record<
  MascotSize,
  {
    button: string;
    image: string;
    shadow: string;
    groundShadow: string;
  }
> = {
  // Mobile: 52-58px button area
  compact: {
    button: 'w-[54px] h-[54px]',
    image: 'w-[48px] h-auto',
    shadow: 'w-7 h-1.5',
    groundShadow: 'w-10 h-2',
  },
  // Desktop standard: 62-68px button area
  default: {
    button: 'w-[64px] h-[64px] sm:w-[68px] sm:h-[68px]',
    image: 'w-[56px] sm:w-[60px] h-auto',
    shadow: 'w-9 h-2',
    groundShadow: 'w-12 sm:w-14 h-2.5',
  },
  // Prominent: ~72px
  large: {
    button: 'w-[72px] h-[72px]',
    image: 'w-[64px] h-auto',
    shadow: 'w-10 h-2',
    groundShadow: 'w-14 h-3',
  },
};

/**
 * Nivora Mascot — Digital AI Companion
 *
 * Sculpted warm ivory porcelain pod with rose gold/coral metallic seams,
 * dark glossy visor, friendly glowing coral eyes, and hovering golden halo.
 * Features an organic floating animation with responsive ground shadow.
 */
export default function NivoraMascot({
  size = 'default',
  isActive = false,
  isFloating = true,
  className = '',
  showTooltip = true,
  tooltipText = 'Nivora AI',
  onClick,
  ariaLabel = 'Open Nivora AI Assistant',
}: NivoraMascotProps) {
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.default;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center group ${className}`}>
      {/* Desktop Hover Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="hidden md:flex absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-200 z-50 select-none"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/95 dark:bg-surface-bright/95 text-on-surface border border-outline-variant/40 shadow-lg backdrop-blur-md text-[11px] font-semibold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-deep-coral animate-pulse" />
            <span>{tooltipText}</span>
            <span className="text-primary font-mono text-[9px] opacity-75">✦</span>
          </div>
          {/* Subtle tooltip caret */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-surface-container-highest/95 dark:bg-surface-bright/95 border-r border-b border-outline-variant/40" />
        </div>
      )}

      {/* Floating Chatbot Mascot Body & Button Layer */}
      <div
        className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${
          isFloating && !isActive ? 'nivora-chatbot-floating' : ''
        }`}
      >
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          aria-expanded={isActive}
          className={`relative flex flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none ${
            config.button
          } ${
            isActive
              ? 'ring-2 ring-deep-coral/60 bg-surface-container-high/90 dark:bg-surface-container/90 shadow-[0_10px_25px_-5px_rgba(232,90,79,0.35)]'
              : 'bg-surface/85 dark:bg-surface-container/85 border border-outline-variant/35 shadow-[0_8px_24px_-6px_rgba(38,34,32,0.12),0_4px_12px_-2px_rgba(232,90,79,0.15)] hover:border-coral/50 hover:shadow-[0_14px_32px_-6px_rgba(232,90,79,0.32)] hover:scale-105 active:scale-95'
          } backdrop-blur-xl`}
        >
          {/* Soft Ambient Radial Glow Behind Mascot */}
          <div
            className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
              isActive
                ? 'bg-radial from-coral/25 to-transparent opacity-100'
                : 'bg-radial from-coral/15 to-transparent opacity-50 group-hover:opacity-90'
            }`}
          />

          {/* Mascot Character Body */}
          <div className="relative z-10 flex items-center justify-center transition-transform duration-200">
            <picture>
              <source srcSet="/nivora-companion.webp" type="image/webp" />
              <img
                src="/nivora-companion.png"
                alt="Nivora AI Digital Companion"
                width={610}
                height={775}
                loading="eager"
                decoding="async"
                className={`aspect-[610/775] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)] ${config.image}`}
              />
            </picture>
          </div>

          {/* Interior Grounding Shadow beneath body inside pod */}
          <div
            className={`absolute bottom-1.5 rounded-full bg-black/25 dark:bg-black/40 blur-[2.5px] pointer-events-none transition-all duration-300 ${
              config.shadow
            } opacity-30`}
          />

          {/* Active Connected Badge Indicator */}
          {isActive && (
            <span
              className="absolute top-1 right-1 flex h-2.5 w-2.5"
              title="Chat Open"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-deep-coral opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-deep-coral border border-surface" />
            </span>
          )}
        </button>
      </div>

      {/* Dynamic Grounding Shadow beneath floating button responding to movement */}
      <div
        aria-hidden="true"
        className={`absolute -bottom-2 sm:-bottom-2.5 left-1/2 pointer-events-none rounded-[100%] bg-black/25 dark:bg-black/50 transition-opacity duration-300 ${
          config.groundShadow
        } ${
          isFloating && !isActive
            ? 'nivora-chatbot-shadow-pulse'
            : '-translate-x-1/2 opacity-25 blur-[3px]'
        }`}
      />
    </div>
  );
}
