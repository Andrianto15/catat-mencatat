import {
  THEME_STORAGE_KEY,
  resolveTheme,
  getNextTheme,
  getThemeScript,
} from '@/lib/theme';

describe('Theme Switcher Logic', () => {
  describe('THEME_STORAGE_KEY', () => {
    it('uses correct local storage key', () => {
      expect(THEME_STORAGE_KEY).toBe('catat_theme');
    });
  });

  describe('resolveTheme', () => {
    it('resolves light theme explicitly', () => {
      expect(resolveTheme('light', false)).toBe('light');
      expect(resolveTheme('light', true)).toBe('light');
    });

    it('resolves dark theme explicitly', () => {
      expect(resolveTheme('dark', false)).toBe('dark');
      expect(resolveTheme('dark', true)).toBe('dark');
    });

    it('resolves system theme based on prefersDark', () => {
      expect(resolveTheme('system', true)).toBe('dark');
      expect(resolveTheme('system', false)).toBe('light');
    });

    it('defaults to system when given invalid or undefined theme', () => {
      expect(resolveTheme(undefined, true)).toBe('dark');
      // @ts-expect-error test fallback
      expect(resolveTheme('invalid', false)).toBe('light');
    });
  });

  describe('getNextTheme', () => {
    it('cycles light -> dark -> system -> light', () => {
      expect(getNextTheme('light')).toBe('dark');
      expect(getNextTheme('dark')).toBe('system');
      expect(getNextTheme('system')).toBe('light');
    });
  });

  describe('getThemeScript', () => {
    it('generates anti-flicker inline script containing theme key and data-theme assignment', () => {
      const script = getThemeScript();
      expect(script).toContain('catat_theme');
      expect(script).toContain('data-theme');
      expect(script).toContain('prefers-color-scheme: dark');
    });
  });
});
