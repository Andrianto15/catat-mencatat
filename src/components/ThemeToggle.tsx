'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import {
  Theme,
  THEME_STORAGE_KEY,
  resolveTheme,
  getNextTheme,
} from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme: Theme =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'system';
    setTheme(initialTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const currentStored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (!currentStored || currentStored === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const handleToggle = () => {
    const next = getNextTheme(theme);
    setTheme(next);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = resolveTheme(next, prefersDark);
      document.documentElement.setAttribute('data-theme', resolved);
    } catch {
      // ignore storage access errors
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Tema: Terang';
      case 'dark':
        return 'Tema: Gelap';
      case 'system':
      default:
        return 'Tema: Sistem';
    }
  };

  const renderIcon = () => {
    if (!mounted) {
      return <Sun size={20} />;
    }
    switch (theme) {
      case 'light':
        return <Sun size={20} />;
      case 'dark':
        return <Moon size={20} />;
      case 'system':
      default:
        return <Monitor size={20} />;
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={getLabel()}
      title={getLabel()}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        borderRadius: 'var(--radius-lg)',
        minHeight: '44px',
        minWidth: '44px',
        transition: 'color 0.15s ease, background-color 0.15s ease',
      }}
    >
      {renderIcon()}
    </button>
  );
}
