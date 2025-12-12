import { useEffect } from 'react';
import { AVAILABLE_FONTS, AVAILABLE_MONO_FONTS, Settings, ThemeMode, defaultSettings } from '../settings';

type Props = {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onChange: (next: Settings) => void;
};

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function SettingsModal({ open, settings, onClose, onChange }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Preferences"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-header">
          <div>
            <h2>Preferences</h2>
            <p>Personalize the editor to match your writing flow.</p>
          </div>
          <button className="settings-close" type="button" onClick={onClose} aria-label="Close preferences">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="settings-grid">
          <label className="settings-field">
            <span>Font Family</span>
            <select
              value={settings.fontFamily}
              onChange={(event) => onChange({ ...settings, fontFamily: event.target.value })}
            >
              {AVAILABLE_FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field">
            <span>Mono Font</span>
            <select
              value={settings.monoFontFamily}
              onChange={(event) => onChange({ ...settings, monoFontFamily: event.target.value })}
            >
              {AVAILABLE_MONO_FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-field">
            <span>Font Size (px)</span>
            <input
              type="number"
              min={12}
              max={28}
              step={1}
              value={settings.fontSize}
              onChange={(event) => {
                const value = event.target.value === '' ? settings.fontSize : Number(event.target.value);
                onChange({ ...settings, fontSize: value });
              }}
            />
          </label>

          <label className="settings-field">
            <span>Font Weight</span>
            <input
              type="number"
              min={300}
              max={800}
              step={100}
              value={settings.fontWeight}
              onChange={(event) => {
                const value = event.target.value === '' ? settings.fontWeight : Number(event.target.value);
                onChange({ ...settings, fontWeight: value });
              }}
            />
          </label>

          <label className="settings-field">
            <span>Line Height</span>
            <input
              type="number"
              min={1.2}
              max={2.2}
              step={0.05}
              value={settings.lineHeight}
              onChange={(event) => {
                const value = event.target.value === '' ? settings.lineHeight : Number(event.target.value);
                onChange({ ...settings, lineHeight: value });
              }}
            />
          </label>

          <label className="settings-field">
            <span>Content Width (px)</span>
            <input
              type="number"
              min={640}
              max={1200}
              step={20}
              value={settings.contentWidth}
              onChange={(event) => {
                const value = event.target.value === '' ? settings.contentWidth : Number(event.target.value);
                onChange({ ...settings, contentWidth: value });
              }}
            />
          </label>

          <label className="settings-field">
            <span>Theme</span>
            <select
              value={settings.themeMode}
              onChange={(event) => onChange({ ...settings, themeMode: event.target.value as ThemeMode })}
            >
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <footer className="settings-footer">
          <button className="settings-reset-btn" type="button" onClick={() => onChange(defaultSettings)}>
            Reset to default
          </button>
        </footer>
      </div>
    </div>
  );
}

export default SettingsModal;
