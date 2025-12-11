#### 2025 12 09 – Rust backend and Tauri command author

- Implemented file IO and dialog commands in src-tauri/src/commands.rs and registered them through the Tauri builder.
- Labeled the main window; removed deprecated `allowlist` block from src-tauri/tauri.conf.json after aligning with Tauri v2 plugin permission model.
- Updated dialog import to the Tauri v2 `tauri::dialog::blocking` path to resolve compile errors.
- Switched dialog implementation to `rfd::FileDialog` and added the dependency to avoid missing Tauri dialog API in v2.
- Added Tauri fs plugin (dependency, builder init, plugin config scope, and capability permission) to enforce scoped filesystem access.
- Adjusted fs plugin config to `requireLiteralLeadingDot` and moved scope definitions into capability permissions for user directories (home, desktop, documents, downloads, appdata).

#### 2025 12 09 – Frontend shell and editor integration

- Rebuilt React shell with TitleBar, Editor, and StatusBar layout plus keyboard shortcuts and file flows.
- Integrated TipTap markdown editor with placeholder, markdown sync, and word count reporting.
- Added global and theme styling for light/dark presentation and minimal chrome; wired theme preference detection.
- Declared TipTap dependencies in package.json.

#### 2025 12 10 – Theming and polish specialist

- Refined `src/styles/theme.css` with a cleaner, Typora-inspired variable set and typography.
- Updated `src/styles/global.css` to be a minimal reset using the new theme variables.
- Polished `StatusBar` to be minimal (removed redundant filename display).
- Adjusted `TitleBar` styling to function as a document header, removing conflicting window drag regions.
- Added support for printing, link styling, and better spacing in the editor.

#### 2025 12 10 – Agent 1 (Native Menu and Window Integration)

- Removed custom `TitleBar` component and styles for a native look.
- Implemented logic to sync document title (and dirty state) to the native window title.
- Implemented native macOS menus (Paper, File, Edit, View) in `src-tauri/src/lib.rs`.
- Wired native menu events to React application logic using `listen`.
- Removed duplicate keyboard shortcut listeners in React, relying on native menu accelerators.

#### 2025 12 10 – Agent 2 (Settings System and Persistence)

- Created `SettingsModal` component with instant preview for font, size, line-height, width, and theme.
- Implemented `src/settings.ts` for type-safe settings management and default values.
- Wired persistence via Tauri commands to load settings on launch and save on modification.
- Connected `App.tsx` to apply settings dynamically via CSS variables for real-time visual updates.
- Added system-aware theme switching logic.

#### 2025 12 10 – Codex

- Added close-request guard in `src/App.tsx` that prompts before quitting when there are unsaved changes.
- Swapped to Tauri dialog plugin for the confirmation dialog and registered the plugin in the Tauri builder.
- Tweaked the confirmation dialog labels and warning kind to avoid the default folder icon and clarify actions.

#### 2025 12 10 – Codex

- Granted `core:window:allow-destroy` permission in `src-tauri/capabilities/default.json` so the app can close windows without permission errors.
- Fixed word count staying at zero after opening a file by recalculating stats whenever external content changes in `src/components/Editor.tsx`.
- Added an open-file blur signal so newly opened documents start unfocused (preview/read-only feel) by blurring the editor after load.
- Added document-level click handler to blur the editor when clicking outside the surface for an explicit preview mode feel.
- Adjusted blur logic to target clicks outside the editor content area specifically, keeping in-content clicks focused while allowing padding/other UI to defocus.
- Replaced the native Quit menu item with a custom one that emits an event; now Cmd+Q runs the same unsaved-changes confirm flow and only destroys the window after approval.
- Routed Cmd+Q through the window close lifecycle so only one unsaved-changes prompt appears (shared `confirmDirtyFlow`), avoiding duplicate save dialogs.
- Renamed the Paper menu Settings item to Preferences in `src-tauri/src/lib.rs` (touching Agent 1's native menu setup) to match the requested wording.
- Updated `src/components/SettingsModal.tsx` copy to say Preferences (modal title, aria label, and close button) for consistency with the menu wording (touching Agent 2's settings UI).
- Disabled text selection for UI chrome globally (with vendor prefixes) while keeping editor and form controls selectable in `src/styles/global.css` to match native-feeling menus and labels.
- Added initial/editor-focus signaling so the editor auto-focuses on launch and after creating a new document by passing a `focusSignal` into `Editor` from `App` (touching Editor/App owned by prior frontend agent).
- Guarded editor focus to wait for the TipTap view to mount before calling `focus()` (using rAF retry) to avoid `view['hasFocus']` errors when auto-focusing.

#### 2025 12 11 – Codex

- Prevented the dark-mode launch flash by bootstrapping the theme class and background color from stored settings or system preference in `index.html` before React mounts.
- Cached the selected and resolved theme in `localStorage` from `src/App.tsx` so subsequent launches can paint with the correct palette immediately.
- Synced the native window/dialog theme to the resolved app theme using Tauri's `setTheme` when settings change, keeping chrome consistent.
- Reset scroll to the top when opening a file by tracking the editor container in `src/App.tsx`, so newly opened documents start at the beginning.
- Modularized theme handling with `useSystemTheme` and `useApplyTheme` hooks to DRY up class toggling, native theme sync, and caching logic used in `src/App.tsx`.
- Consolidated open-file logic into a single `loadFilePath` helper in `src/App.tsx` so dialogs, startup files, and menu events share the same flow and scrolling reset.
