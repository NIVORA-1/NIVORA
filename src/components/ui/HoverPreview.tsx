'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface HoverPreviewProps {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  description?: string;
  details?: (string | { label: string; value: string })[];
  actionText?: string;
  side?: 'top' | 'bottom' | 'auto';
  preferredPosition?: 'top' | 'bottom' | 'auto';
  align?: 'center' | 'start' | 'end';
  className?: string;
  disabled?: boolean;
  enabled?: boolean;
  variant?: 'default' | 'none';
}

export default function HoverPreview({
  children,
  title,
  eyebrow,
  description,
  details = [],
  actionText,
  side = 'auto',
  preferredPosition,
  align = 'center',
  className = '',
  disabled = false,
  enabled = true,
  variant = 'default',
}: HoverPreviewProps) {
  const effectiveSide = preferredPosition || side;
  const isPreviewDisabled = disabled || enabled === false || variant === 'none' || (!title && !description);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure portal only renders on client
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardEl = cardRef.current;
    const cardWidth = cardEl ? cardEl.offsetWidth : 280;
    const cardHeight = cardEl ? cardEl.offsetHeight : 160;

    const margin = 12;
    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine vertical placement
    let chosenSide: 'top' | 'bottom' = 'top';
    if (effectiveSide === 'top') {
      chosenSide = 'top';
    } else if (effectiveSide === 'bottom') {
      chosenSide = 'bottom';
    } else {
      // Auto: prefer top if space available, otherwise bottom
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      chosenSide = spaceAbove >= cardHeight + gap + margin || spaceAbove > spaceBelow ? 'top' : 'bottom';
    }

    let top = chosenSide === 'top'
      ? triggerRect.top - cardHeight - gap
      : triggerRect.bottom + gap;

    // Viewport vertical clamping
    top = Math.max(margin, Math.min(viewportHeight - cardHeight - margin, top));

    // Determine horizontal placement
    let left: number;
    if (align === 'start') {
      left = triggerRect.left;
    } else if (align === 'end') {
      left = triggerRect.right - cardWidth;
    } else {
      // Center
      left = triggerRect.left + (triggerRect.width / 2) - (cardWidth / 2);
    }

    // Viewport horizontal clamping
    left = Math.max(margin, Math.min(viewportWidth - cardWidth - margin, left));

    setCoords({ top, left });
  }, [effectiveSide, align]);

  const showPreview = () => {
    if (isPreviewDisabled) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    enterTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
      // Small frame delay to trigger CSS transition smoothly
      requestAnimationFrame(() => {
        calculatePosition();
        setIsVisible(true);
      });
    }, 120);
  };

  const hidePreview = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIsOpen(false);
      }, 200);
    }, 120);
  };

  // Recompute position on scroll or resize while open
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, calculatePosition]);

  // Dismiss on outside click for touch/mobile devices
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 200);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // If preview is disabled or variant is 'none', return plain children directly
  if (isPreviewDisabled) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={showPreview}
      onMouseLeave={hidePreview}
      onFocus={showPreview}
      onBlur={hidePreview}
      className={`inline-block ${className}`}
    >
      {children}

      {isMounted && isOpen && createPortal(
        <div
          ref={cardRef}
          onMouseEnter={showPreview}
          onMouseLeave={hidePreview}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
          className={`w-64 sm:w-72 p-3.5 rounded-xl bg-[var(--surface-preview)] backdrop-blur-xl border border-[var(--border-preview)] shadow-[var(--shadow-preview)] pointer-events-auto transition-all duration-200 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-1.5 scale-[0.98]'
          }`}
          role="tooltip"
        >
          {/* Eyebrow */}
          {eyebrow && (
            <div className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)] uppercase font-bold mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]" />
              <span>{eyebrow}</span>
            </div>
          )}

          {/* Title */}
          <h4 className="font-sans text-xs font-bold text-[var(--text-primary)] leading-tight tracking-[-0.01em]">
            {title}
          </h4>

          {/* Description */}
          <p className="font-sans text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1.5 font-normal">
            {description}
          </p>

          {/* Details list / Pills */}
          {details && details.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] space-y-1">
              {details.map((detail, idx) => {
                const isObject = typeof detail === 'object';
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--text-muted)] font-normal"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)]/70 shrink-0" />
                    {isObject ? (
                      <span>
                        <span className="text-[var(--text-secondary)] font-semibold">{detail.label}:</span>{' '}
                        <span className="text-[#D5B978] font-bold">{detail.value}</span>
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)] font-medium">{detail}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Optional Action Text */}
          {actionText && (
            <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between font-mono text-[9px] text-[var(--accent)] font-bold tracking-wider uppercase">
              <span>{actionText}</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
