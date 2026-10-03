'use client';

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';

export interface CollegeOption {
  id: string;
  externalCollegeId: string | null;
  name: string;
  state: string | null;
  district: string | null;
  website: string | null;
  universityId: string;
  universityName: string;
}

interface CollegeComboboxProps {
  value: string;
  selectedId?: string;
  onSelectCollege: (college: CollegeOption) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export default function CollegeCombobox({
  value,
  selectedId,
  onSelectCollege,
  error,
  placeholder = 'Search engineering college (e.g. BVRIT, CMR, JNTUH, VNR, Aditya)...',
  disabled = false,
  id,
}: CollegeComboboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listboxId = `${inputId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value || '');
  const [results, setResults] = useState<CollegeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Fetch search results from backend
  const fetchColleges = useCallback(async (q: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/academic/colleges?q=${encodeURIComponent(q)}&limit=25`);
      const data = await res.json();
      if (data.success && Array.isArray(data.colleges)) {
        setResults(data.colleges);
      }
    } catch (e) {
      console.error('Failed to search colleges:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial popular colleges load on focus
  const handleFocus = () => {
    if (!results.length) {
      fetchColleges(inputValue);
    }
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    setIsOpen(true);
    setHighlightedIndex(0);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchColleges(nextVal);
    }, 200);
  };

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      const activeItem = items[highlightedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (college: CollegeOption) => {
    setInputValue(college.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectCollege(college);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(results.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedIndex >= 0 && results[highlightedIndex]
              ? `${inputId}-option-${highlightedIndex}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl bg-surface border text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none transition-all ${
            error
              ? 'border-error/80 focus:border-error focus:ring-1 focus:ring-error shadow-sm'
              : 'border-outline-variant/60 focus:border-coral focus:ring-1 focus:ring-coral/40'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-container' : ''}`}
        />

        {/* Leading Search Icon */}
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
          school
        </span>

        {/* Trailing Spinner or Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-deep-coral/30 border-t-deep-coral rounded-full animate-spin" />
          )}
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setResults([]);
                if (inputRef.current) inputRef.current.focus();
                fetchColleges('');
              }}
              className="text-on-surface-variant/70 hover:text-on-surface p-0.5 rounded-full transition-colors cursor-pointer"
              title="Clear input"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          <span
            className={`material-symbols-outlined text-[18px] text-on-surface-variant/70 transition-transform duration-200 pointer-events-none ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 w-full mt-2 py-1.5 max-h-72 overflow-y-auto rounded-2xl bg-surface-container border border-outline-variant/50 shadow-2xl backdrop-blur-md focus:outline-none animate-in fade-in zoom-in-95 duration-150"
        >
          {results.length > 0 ? (
            results.map((c, index) => {
              const isHighlighted = highlightedIndex === index;
              const isSelected = selectedId === c.id;

              return (
                <li
                  key={c.id}
                  id={`${inputId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(c)}
                  className={`px-4 py-2.5 cursor-pointer text-xs transition-colors flex items-start justify-between gap-3 ${
                    isHighlighted
                      ? 'bg-deep-coral/10 text-on-surface font-medium'
                      : 'text-on-surface hover:bg-surface-container-high'
                  } ${isSelected ? 'bg-deep-coral/15 font-semibold' : ''}`}
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-on-surface truncate">
                        {c.name}
                      </span>
                      {c.externalCollegeId && (
                        <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant shrink-0">
                          ID: {c.externalCollegeId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-deep-coral text-[11px] truncate">
                      <span className="material-symbols-outlined text-[13px] shrink-0">account_balance</span>
                      <span className="truncate">{c.universityName}</span>
                    </div>
                    {(c.district || c.state) && (
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] shrink-0">location_on</span>
                        <span>{[c.district, c.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] text-deep-coral shrink-0 mt-0.5">
                      check_circle
                    </span>
                  )}
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-center text-xs text-on-surface-variant space-y-1">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant/60 block mx-auto">
                search_off
              </span>
              <p className="font-medium text-on-surface">No colleges matched &ldquo;{inputValue}&rdquo;</p>
              <p className="text-[11px] text-on-surface-variant/80">
                Try searching by district (e.g. Hyderabad, Pune) or short code
              </p>
            </li>
          )}
        </ul>
      )}

      {error && (
        <p className="text-xs text-error font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[15px] shrink-0">error</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
