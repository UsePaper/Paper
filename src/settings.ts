import { invoke } from '@tauri-apps/api/core';

export type ThemeMode = 'system' | 'light' | 'dark';

export type Settings = {
  fontFamily: string;
  monoFontFamily: string;
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
  themeMode: ThemeMode;
  showStatusBar: boolean;
};

export const defaultSettings: Settings = {
  fontFamily: "'EB Garamond', serif",
  monoFontFamily:
    "'Ubuntu Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  fontSize: 16,
  lineHeight: 1.6,
  contentWidth: 800,
  themeMode: 'system',
  showStatusBar: true,
};

export const normalizeSettings = (input: any): Settings => {
  if (!input || typeof input !== 'object') {
    return defaultSettings;
  }

  const mapped: Partial<Settings> = { ...input };

  if ('font_family' in input) mapped.fontFamily = (input as any).font_family;
  if ('mono_font_family' in input) mapped.monoFontFamily = (input as any).mono_font_family;
  if ('font_size' in input) mapped.fontSize = Number((input as any).font_size);
  if ('line_height' in input) mapped.lineHeight = Number((input as any).line_height);
  if ('content_width' in input) mapped.contentWidth = Number((input as any).content_width);
  if ('theme_mode' in input) mapped.themeMode = (input as any).theme_mode;
  if ('show_status_bar' in input) mapped.showStatusBar = Boolean((input as any).show_status_bar);

  return {
    ...defaultSettings,
    ...mapped,
  };
};

export const loadSavedSettings = async (): Promise<Settings> => {
  try {
    const stored = await invoke<unknown>('load_settings');
    return normalizeSettings(stored);
  } catch (error) {
    console.error('Failed to load settings', error);
    return defaultSettings;
  }
};

export const persistSettings = async (settings: Settings) => {
  try {
    await invoke('save_settings', {
      settings: {
        font_family: settings.fontFamily,
        mono_font_family: settings.monoFontFamily,
        font_size: settings.fontSize,
        line_height: settings.lineHeight,
        content_width: settings.contentWidth,
        theme_mode: settings.themeMode,
        show_status_bar: settings.showStatusBar,
      },
    });
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};

export const AVAILABLE_FONTS: { label: string; value: string }[] = [
  { label: 'EB Garamond', value: "'EB Garamond', serif" },
  { label: 'System', value: 'System' },
  { label: 'Serif (Georgia)', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Sans (Helvetica)', value: 'Helvetica Neue, Helvetica, Arial, sans-serif' },
  {
    label: 'Mono (Ubuntu Mono)',
    value: "'Ubuntu Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  },
];

export const AVAILABLE_MONO_FONTS: { label: string; value: string }[] = [
  {
    label: 'Ubuntu Mono',
    value: "'Ubuntu Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  },
  {
    label: 'SF Mono / System',
    value: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  },
];
