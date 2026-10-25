export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'catat_theme';

export function resolveTheme(
  theme: Theme | undefined | null,
  prefersDark: boolean
): 'light' | 'dark' {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return prefersDark ? 'dark' : 'light';
}

export function getNextTheme(current: Theme): Theme {
  switch (current) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'system';
    case 'system':
    default:
      return 'light';
  }
}

export function getThemeScript(): string {
  return `(function() {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = (stored === 'light' || stored === 'dark') ? stored : (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {}
})();`;
}
