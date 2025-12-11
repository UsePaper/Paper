import { useEffect, useState } from 'react';
import { setTheme as setNativeTheme } from '@tauri-apps/api/app';
import { ThemeMode } from '../settings';

export type ResolvedTheme = 'light' | 'dark';

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useSystemTheme = (track: boolean) => {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    if (!track || typeof window === 'undefined') return;
    setSystemTheme(getSystemTheme());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [track]);

  return systemTheme;
};

export const useApplyTheme = (appliedTheme: ResolvedTheme, themeMode: ThemeMode) => {
  useEffect(() => {
    const root = document.documentElement;
    const themeClass = appliedTheme === 'dark' ? 'theme-dark' : 'theme-light';
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(themeClass);
    root.style.colorScheme = appliedTheme === 'dark' ? 'dark' : 'light';

    if (typeof window !== 'undefined') {
      const nativeTarget = themeMode === 'system' ? null : appliedTheme;
      setNativeTheme(nativeTarget).catch((error) => console.error('Failed to set native theme', error));
    }

    try {
      localStorage.setItem('paper-theme-mode', themeMode);
      localStorage.setItem('paper-resolved-theme', appliedTheme);
    } catch (error) {
      console.error('Failed to cache theme', error);
    }
  }, [appliedTheme, themeMode]);
};
