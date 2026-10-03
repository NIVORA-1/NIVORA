'use client';

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import {
  University,
  searchUniversities,
  isValidUniversity,
  findUniversity,
} from '@/lib/universities';

interface UniversityComboboxProps {
  value: string;
  selectedId?: string;
  onChange: (universityName: string, universityId?: string) => void;
  onSelect?: (university: University) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export default function UniversityCombobox({
  value,
  selectedId,
  onChange,
  onSelect,
  error,
  placeholder = 'Search college or university from UGC list...',
  disabled = false,
  id,
}: UniversityComboboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listboxId = `${inputId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value || '');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Compute filtered suggestions based on input value
  const suggestions = React.useMemo(() => {
    if (!inputValue || !inputValue.trim()) {
      return [];
    }
    return searchUniversities(inputValue, 30);
  }, [inputValue]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    setIsOpen(true);
    setHighlightedIndex(0);

    // If matches a valid university, update with ID
    const matched = findUniversity(nextVal);
    onChange(nextVal, matched ? matched.id : undefined);
  };

  const handleSelectUniversity = useCallback(
    (uni: University) => {
      setInputValue(uni.name);
      setIsOpen(false);
      setHighlightedIndex(-1);
      onChange(uni.name, uni.id);
      if (onSelect) {
        onSelect(uni);
      }
      inputRef.current?.focus();
    },
    [onChange, onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (suggestions.length > 0) {
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(suggestions.length - 1);
      } else if (suggestions.length > 0) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectUniversity(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (!disabled && inputValue.trim()) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('', undefined);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Check if current value matches a valid university in dataset
  const isValid = isValidUniversity(inputValue);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-invalid={Boolean(error)}
          aria-haspopup="listbox"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-10 pr-10 py-3 rounded-xl bg-surface border text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none transition-all ${
            error
              ? 'border-error/80 focus:border-error focus:ring-1 focus:ring-error shadow-sm'
              : isValid
              ? 'border-outline-variant/60 focus:border-coral focus:ring-1 focus:ring-coral/40'
              : 'border-outline-variant/60 focus:border-coral focus:ring-1 focus:ring-coral/40'
          }`}
        />

        {/* Left Search / School Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/70 flex items-center">
          <span className="material-symbols-outlined text-[18px]">
            {isValid ? 'school' : 'search'}
          </span>
        </div>

        {/* Right Actions: Valid Badge, Clear Button, or Dropdown Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Clear university"
              aria-label="Clear university input"
            >
              <span className="material-symbols-outlined text-[16px] block">close</span>
            </button>
          )}

          {isValid && (
            <span
              className="text-deep-coral flex items-center pr-1"
              title="Verified UGC University"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Inline Error Message */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-error font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-200"
        >
          <span className="material-symbols-outlined text-[15px] shrink-0">error</span>
          <span>{error}</span>
        </p>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-surface-container border border-outline-variant/60 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {suggestions.length > 0 ? (
            <div>
              <div className="px-3.5 py-2 bg-surface-container-high/60 border-b border-outline-variant/30 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                <span>AUTHORITATIVE UGC UNIVERSITIES</span>
                <span>{suggestions.length} match{suggestions.length === 1 ? '' : 'es'}</span>
              </div>
              <ul
                ref={listboxRef}
                id={listboxId}
                role="listbox"
                className="max-h-64 overflow-y-auto divide-y divide-outline-variant/20 focus:outline-none"
              >
                {suggestions.map((uni, idx) => {
                  const isHighlighted = idx === highlightedIndex;
                  const isSelected =
                    (selectedId && uni.id === selectedId) ||
                    uni.name.toLowerCase() === inputValue.trim().toLowerCase();

                  return (
                    <li
                      key={uni.id}
                      role="option"
                      aria-selected={isSelected}
                      id={`${inputId}-option-${idx}`}
                      onMouseDown={(e) => {
                        // Prevent input blur before click handler fires
                        e.preventDefault();
                        handleSelectUniversity(uni);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`px-4 py-2.5 cursor-pointer text-left transition-colors flex items-start justify-between gap-3 ${
                        isHighlighted
                          ? 'bg-surface-container-high text-deep-coral'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs sm:text-sm font-medium leading-snug truncate">
                          {uni.name}
                        </div>
                        <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 truncate">
                          <span>{uni.state}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] uppercase opacity-80">
                            {uni.type}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-deep-coral shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : inputValue.trim() ? (
            <div className="p-4 text-center space-y-1">
              <p className="text-xs font-medium text-on-surface">
                No matching universities found
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Please search by university name, state, or UGC acronym (e.g. &quot;Galgotias&quot;, &quot;Delhi&quot;, &quot;GITAM&quot;).
              </p>
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-on-surface-variant">
              Type to search matching UGC universities...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
