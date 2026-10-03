'use client';

import React from 'react';
import Link from 'next/link';

export type NivoraLogoSize = 'compact' | 'small' | 'medium' | 'large' | 'hero' | 'responsive';

export interface NivoraLogoProps {
  size?: NivoraLogoSize;
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  alt?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const SIZE_CLASSES: Record<NivoraLogoSize, string> = {
  // Mobile / compact navigation
  compact: 'h-7 sm:h-8 w-auto',
  // Small badge or secondary header
  small: 'h-8 sm:h-9 w-auto',
  // Standard navigation / sidebar / headers
  medium: 'h-9 sm:h-10 md:h-11 w-auto',
  // Auth pages / onboarding / prominent branding
  large: 'h-14 sm:h-16 md:h-20 w-auto',
  // Hero display / welcome displays
  hero: 'h-20 sm:h-24 md:h-28 w-auto',
  // Fully responsive across Mobile -> Tablet -> Desktop
  responsive: 'h-8 sm:h-9 md:h-10 lg:h-11 w-auto',
};

/**
 * Official Nivora Brand Logo Component
 * Renders the official transparent brand mark containing the sculpted 3D rose-gold/blue symbol
 * and embossed NIVORA wordmark with zero background box.
 */
export default function NivoraLogo({
  size = 'responsive',
  href,
  className = '',
  imageClassName = '',
  priority = false,
  alt = 'NIVORA — The Student Ecosystem',
  onClick,
}: NivoraLogoProps) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.responsive;

  const imageElement = (
    <img
      src="/nivora-logo-transparent.png"
      alt={alt}
      width={478}
      height={400}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`aspect-[478/400] object-contain select-none shrink-0 transition-opacity ${sizeClass} ${imageClassName}`}
      style={{
        imageRendering: 'auto',
      }}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`inline-flex items-center shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral rounded-md ${className}`}
        aria-label={alt}
      >
        {imageElement}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      {imageElement}
    </div>
  );
}
