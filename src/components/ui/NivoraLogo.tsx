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
  compact: 'h-6 sm:h-7 w-auto',
  // Small badge or secondary header
  small: 'h-7 sm:h-8 w-auto',
  // Standard navigation / sidebar / headers
  medium: 'h-8 sm:h-9 md:h-10 w-auto',
  // Auth pages / onboarding / prominent branding
  large: 'h-12 sm:h-14 md:h-16 w-auto',
  // Hero display / welcome displays
  hero: 'h-16 sm:h-20 md:h-24 w-auto',
  // Fully responsive across Mobile -> Tablet -> Desktop
  responsive: 'h-7 sm:h-8 md:h-9 lg:h-10 w-auto',
};

/**
 * Official Nivora Brand Logo Component
 * Renders the exact official uploaded brand mark preserving original typography,
 * geometry, colors, and aspect ratio (1024:571).
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
      src="/assets/nivora-logo.png"
      alt={alt}
      width={1024}
      height={571}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`aspect-[1024/571] object-contain rounded-md select-none shrink-0 transition-opacity ${sizeClass} ${imageClassName}`}
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
        className={`inline-flex items-center shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8FC5A7] rounded-md ${className}`}
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
