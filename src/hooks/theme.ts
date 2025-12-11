import { useEffect, useState } from 'react';
import { setTheme as setNativeTheme } from '@tauri-apps/api/app';
import { ThemeMode } from '../settings';

export type ResolvedTheme = 'light' | 'dark';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

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
      setNativeTheme(appliedTheme).catch((error) => console.error('Failed to set native theme', error));
    }
    try {
      localStorage.setItem('paper-theme-mode', themeMode);
      localStorage.setItem('paper-resolved-theme', appliedTheme);
    } catch (error) {
      console.error('Failed to cache theme', error);
    }
  }, [appliedTheme, themeMode]);
};
