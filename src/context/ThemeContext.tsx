'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export type ThemeMode = 'system' | 'light' | 'dark';
export type FontSize = 'compact' | 'default' | 'large';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  fontSize: FontSize;
  toggleTheme: () => void;
  setTheme: (theme: Theme | ThemeMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [fontSize, setFontSizeState] = useState<FontSize>('default');
  const [mounted, setMounted] = useState(false);

  const getSystemTheme = (): Theme => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  const applyTheme = (resolvedTheme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    if (resolvedTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const applyFontSize = (size: FontSize) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-font-size', size);
  };

  useEffect(() => {
    setMounted(true);
    try {
      // 1. Check saved theme preference
      const savedMode = localStorage.getItem('nivora-theme-mode') as ThemeMode | null;
      const legacyTheme = localStorage.getItem('nivora-theme') as Theme | null;
      const initialMode: ThemeMode = savedMode || legacyTheme || 'system';
      setThemeModeState(initialMode);

      const resolved = initialMode === 'system' ? getSystemTheme() : initialMode;
      setThemeState(resolved);
      applyTheme(resolved);

      // 2. Check saved font size
      const savedFontSize = localStorage.getItem('nivora-font-size') as FontSize | null;
      if (savedFontSize && ['compact', 'default', 'large'].includes(savedFontSize)) {
        setFontSizeState(savedFontSize);
        applyFontSize(savedFontSize);
      } else {
        applyFontSize('default');
      }
    } catch {
      setThemeState('dark');
      applyTheme('dark');
    }
  }, []);

  // Media query listener for system theme changes
  useEffect(() => {
    if (themeMode !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme: Theme = e.matches ? 'light' : 'dark';
      setThemeState(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    const resolved = mode === 'system' ? getSystemTheme() : mode;
    setThemeState(resolved);
    applyTheme(resolved);

    try {
      localStorage.setItem('nivora-theme-mode', mode);
      localStorage.setItem('nivora-theme', resolved);
    } catch {}
  };

  const setTheme = (newTheme: Theme | ThemeMode) => {
    setThemeMode(newTheme);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    applyFontSize(size);
    try {
      localStorage.setItem('nivora-font-size', size);
    } catch {}
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        fontSize,
        toggleTheme,
        setTheme,
        setThemeMode,
        setFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      themeMode: 'dark',
      fontSize: 'default',
      toggleTheme: () => {},
      setTheme: () => {},
      setThemeMode: () => {},
      setFontSize: () => {},
    };
  }
  return context;
}
