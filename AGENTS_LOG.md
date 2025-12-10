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