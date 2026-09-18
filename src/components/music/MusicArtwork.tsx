'use client';

import React, { useState, useEffect } from 'react';

interface MusicArtworkProps {
  src?: string;
  alt: string;
  className?: string;
  category?: string;
  title?: string;
  icon?: string;
  aspectSquare?: boolean;
}

// Deterministic color palette selector based on category or string hash
function getCategoryTheme(category?: string, seed = '') {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('binaural') || cat.includes('gamma') || cat.includes('alpha')) {
    return {
      bg: 'from-[#0A261D] via-[#11382C] to-[#0A1D17]',
      accent: '#8FC5A7',
      subAccent: '#589876',
      icon: 'graphic_eq',
      label: 'BINAURAL',
    };
  }
  if (cat.includes('classical') || cat.includes('piano') || cat.includes('chamber')) {
    return {
      bg: 'from-[#2A2017] via-[#3D2F22] to-[#1E1610]',
      accent: '#E5C07B',
      subAccent: '#A68246',
      icon: 'piano',
      label: 'CLASSICAL',
    };
  }
  if (cat.includes('lofi') || cat.includes('lo-fi') || cat.includes('compiler')) {
    return {
      bg: 'from-[#26182B] via-[#3B2544] to-[#1B1120]',
      accent: '#D4A5E8',
      subAccent: '#8A5FA3',
      icon: 'radio',
      label: 'LO-FI',
    };
  }
  if (cat.includes('nature') || cat.includes('rain') || cat.includes('stream')) {
    return {
      bg: 'from-[#0C241D] via-[#173D32] to-[#0A1A15]',
      accent: '#9CD2B4',
      subAccent: '#4D8A6F',
      icon: 'water_drop',
      label: 'NATURE',
    };
  }
  if (cat.includes('ambient') || cat.includes('drone') || cat.includes('flow')) {
    return {
      bg: 'from-[#141E2B] via-[#1E3046] to-[#0E1520]',
      accent: '#89B4D4',
      subAccent: '#487299',
      icon: 'air',
      label: 'AMBIENT',
    };
  }
  if (cat.includes('campus') || cat.includes('quad') || cat.includes('walk')) {
    return {
      bg: 'from-[#1B271F] via-[#2A3F33] to-[#121C16]',
      accent: '#AAE1C2',
      subAccent: '#5C9677',
      icon: 'location_city',
      label: 'CAMPUS',
    };
  }
  
  // Default Nivora Sage theme
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const themes = [
    {
      bg: 'from-[#0E1E1A] via-[#1A332C] to-[#0C1613]',
      accent: '#8FC5A7',
      subAccent: '#52896E',
      icon: 'headphones',
      label: 'FOCUS',
    },
    {
      bg: 'from-[#1A1A26] via-[#28283E] to-[#12121D]',
      accent: '#B0A8E3',
      subAccent: '#685F9E',
      icon: 'nightlight',
      label: 'DEEP WORK',
    },
    {
      bg: 'from-[#241A16] via-[#3A2A22] to-[#18120F]',
      accent: '#E6BC8A',
      subAccent: '#946E45',
      icon: 'auto_stories',
      label: 'STUDY',
    },
  ];
  return themes[Math.abs(hash) % themes.length];
}

export default function MusicArtwork({
  src,
  alt,
  className = '',
  category,
  title,
  icon,
  aspectSquare = true,
}: MusicArtworkProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset states if src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const theme = getCategoryTheme(category, title || alt);
  const displayIcon = icon || theme.icon;

  // Render SVG Acoustic Waveform Graphic as fallback or placeholder
  const renderAbstractGraphic = () => (
    <div
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${theme.bg} flex flex-col justify-between p-2.5 select-none`}
    >
      {/* Subtle background acoustic frequency waves SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id={`grad-${theme.label}-${title || 'default'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.subAccent} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M0 50 Q25 20 50 50 T100 50 L100 100 L0 100 Z"
          fill={`url(#grad-${theme.label}-${title || 'default'})`}
        />
        <path
          d="M0 65 Q25 40 50 65 T100 65"
          fill="none"
          stroke={theme.accent}
          strokeWidth="1.2"
          strokeDasharray="2 2"
          opacity="0.6"
        />
        <path
          d="M0 35 Q25 60 50 35 T100 35"
          fill="none"
          stroke={theme.subAccent}
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>

      {/* Top Header / Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="font-label-mono-wide text-[8.5px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm border border-white/10 font-bold"
          style={{ color: theme.accent }}
        >
          {theme.label}
        </span>
        <span
          className="material-symbols-outlined text-[16px] opacity-70"
          style={{ color: theme.accent }}
        >
          {displayIcon}
        </span>
      </div>

      {/* Middle acoustic frequency bars */}
      <div className="relative z-10 flex items-end justify-center gap-1 my-auto opacity-75">
        <span
          className="w-1 rounded-full h-4"
          style={{ backgroundColor: theme.accent }}
        />
        <span
          className="w-1 rounded-full h-7"
          style={{ backgroundColor: theme.accent }}
        />
        <span
          className="w-1 rounded-full h-10"
          style={{ backgroundColor: theme.accent }}
        />
        <span
          className="w-1 rounded-full h-6"
          style={{ backgroundColor: theme.accent }}
        />
        <span
          className="w-1 rounded-full h-8"
          style={{ backgroundColor: theme.accent }}
        />
        <span
          className="w-1 rounded-full h-3"
          style={{ backgroundColor: theme.accent }}
        />
      </div>

      {/* Bottom text preview */}
      <div className="relative z-10">
        <p className="font-headline-sm text-[10px] font-bold text-white/90 truncate drop-shadow-sm">
          {title || alt}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={`relative overflow-hidden ${aspectSquare ? 'aspect-square' : ''} ${className}`}
    >
      {/* If error or no source, directly render abstract graphic */}
      {(!src || hasError) ? (
        renderAbstractGraphic()
      ) : (
        <>
          {/* While image is loading, show the abstract graphic underneath to prevent layout jumps */}
          {!isLoaded && (
            <div className="absolute inset-0">
              {renderAbstractGraphic()}
            </div>
          )}

          {/* Actual image with smooth fade-in and error catching */}
          <img
            src={src}
            alt={alt}
            onError={() => {
              setHasError(true);
            }}
            onLoad={() => {
              setIsLoaded(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}
    </div>
  );
}
