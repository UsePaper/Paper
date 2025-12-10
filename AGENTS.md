# AGENTS.md – Typora-like Markdown Editor MVP (Rust + Tauri)

## 0. High level vision

Build a cross platform desktop app using Rust and Tauri that feels similar to Typora for basic usage.

Single pane, distraction free, What You See Is What You Mean markdown editing:

- No separate preview window.
- No explicit mode switcher.
- Markdown syntax transforms into formatted content while typing, so the document looks like a clean rendered page.
- Minimal chrome, focus on the text.

MVP only, so we limit features to the core experience.

Target platforms: macOS, Windows, Linux.

Frontend: React + TypeScript using a WYSIWYG markdown editor (TipTap with markdown extension).

Backend: Tauri with Rust commands for file system operations and basic app plumbing.

---

# 0. MVP 1 Summary – Core Editor Foundation (Completed)

Paper MVP 1 delivered a complete **functional foundation** for a single-document, Typora-style Markdown editor. The goal was correctness, stability, and workflow safety rather than visual polish.

### ✅ Core Editing System

- Single-pane **WYSIWYM Markdown editor** implemented.
- No preview mode and no mode switching.
- Live rendering of:
  - Headings
  - Bold, italic
  - Lists (ordered and unordered)
  - Blockquotes
  - Inline code and code blocks
  - Links

- Editor exports and imports clean Markdown.
- Word count tracking integrated.

### ✅ File System Integration

- Fully working:
  - New
  - Open
  - Save
  - Save As

- UTF-8 safe file read and write via Rust + Tauri commands.
- Native OS file dialogs.
- Safe error handling with no panics.

### ✅ Dirty State Protection

- Real dirty state detection.
- Confirmation dialogs on:
  - New file with unsaved changes
  - Open with unsaved changes
  - Window close with unsaved changes

- `lastSavedContent` tracking to prevent false dirty states.

### ✅ App Layout

- Three-part layout:
  - TitleBar (document name + dirty indicator)
  - Editor (main content)
  - StatusBar (word count)

- Single window only.
- One document at a time.

### ✅ Keyboard Shortcuts

- Cmd/Ctrl + N → New
- Cmd/Ctrl + O → Open
- Cmd/Ctrl + S → Save
- Cmd/Ctrl + Shift + S → Save As

### ✅ Theming (Basic)

- Light and Dark themes implemented.
- System theme support via `prefers-color-scheme`.

### ✅ Cross-Platform Readiness

- Builds and runs using:
  - `tauri dev`
  - `tauri build`

- macOS, Windows, and Linux supported at the infrastructure level.

---

### MVP 1 Philosophy

MVP 1 intentionally avoided:

- Tabs
- Sidebars
- Settings
- Menus
- Tables
- Export formats
- Focus modes
- Plugins
- Custom themes

It established a **correct, safe, single-document Markdown writing engine** as the base for all future refinement.

---

# MVP 2

_UI, Aesthetics, Native Menus, and Personalization_

This phase assumes **MVP 1 is fully complete and stable**.
MVP 2 introduces **native OS integration and visual refinement only**.
No new core editing or file logic is permitted in this phase.

---

## 0. MVP 2 Goals

Paper MVP 2 focuses on:

- Removing custom chrome
- Using **native OS menus**
- Improving **visual calm and polish**
- Adding a **Settings system for personalization**
- Making the app feel like a true macOS-first writing tool

No productivity features are added in this phase.
Only **presentation, customization, and OS correctness**.

---

## 1. High Level Changes from MVP 1

1. **TitleBar component is removed**
   - `Untitled.md` and dirty indicator move to the **native window title**
   - All file actions move to **macOS menu bar**

2. **StatusBar becomes toggleable**
   - New menu option: **View → Toggle Status Bar**

3. **New Settings system**
   - New menu: **Paper → Settings**
   - User can customize:
     - Editor font family
     - Editor font size
     - Line height
     - Content width
     - Theme mode: Light, Dark, System

4. **Visual refinement**
   - Typography upgraded
   - Better spacing
   - Platform-native look and feel

---

## 2. Agent Execution Order for MVP 2

Codex must execute in this exact order:

1. **Agent 1 – Native Menu and Window Integration**
2. **Agent 2 – Settings System and Persistence**
3. **Agent 3 – Visual Polish and Typography System**

Each agent has acceptance criteria that must pass before continuing.

---

# AGENT 1 – Native Menu and Window Integration

## Goal

Replace all custom window controls with **true macOS native menus** and move the document title into the **window chrome**.

---

## Owns

- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`
- `src/App.tsx`
- Removal of `TitleBar.tsx`

---

## Tasks

### 1. Remove Custom TitleBar

- Delete `<TitleBar />` from `App.tsx`
- Delete the `TitleBar.tsx` component entirely
- Remove all related CSS

---

### 2. Move Document Title to Native Window Title

- When:
  - New file → window title becomes `Untitled.md`
  - File opened → window title becomes actual filename
  - Dirty state → append `•` to title

This must be driven from:

- Tauri `Window::set_title`
- Synced from React via a Tauri command

---

### 3. Implement Native macOS Menus

Menus to implement:

#### Paper (App Menu)

- About Paper
- Settings
- Hide Paper
- Quit Paper

#### File

- New
- Open
- Save
- Save As
- Close

#### Edit

- Undo
- Redo
- Cut
- Copy
- Paste
- Select All

#### View

- Toggle Status Bar

---

### 4. Wire Menu Actions to React

- Every menu item must call the same handlers currently used by:
  - Keyboard shortcuts
  - Buttons

- There must never be duplicate logic

---

## Acceptance Criteria for Agent 1

All must be true:

- TitleBar is fully removed
- Window title updates correctly
- macOS native menus exist
- Menu actions trigger real app behavior
- View → Toggle Status Bar works via menu
- No duplicate business logic exists

Only then Agent 2 may begin.

---

# AGENT 2 – Settings System and Persistence

## Goal

Allow users to personalize the editor and persist preferences across app restarts.

---

## Owns

- `src/App.tsx`
- New file: `src/settings.ts`
- New file: `src/components/SettingsModal.tsx`
- Tauri app config storage

---

## Settings Options (Mandatory)

| Setting       | Type   | Default |
| ------------- | ------ | ------- |
| Font Family   | Select | System  |
| Font Size     | Number | 16px    |
| Line Height   | Number | 1.6     |
| Content Width | Number | 800px   |
| Theme Mode    | Select | System  |

---

## Tasks

### 1. Create Settings Modal

- Appears from: **Paper → Settings**
- Native macOS modal styling
- Real-time preview of changes

---

### 2. Apply Settings Live to Editor

Changing any setting must immediately:

- Update CSS variables
- Reflow the editor
- Persist to storage

---

### 3. Persist Settings

- Use:
  - Tauri app config
  - Or filesystem JSON under app data directory

- Settings must persist across app restarts

---

### 4. Theme Control

Allow:

- Light
- Dark
- System

System must follow `prefers-color-scheme`.

---

## Acceptance Criteria for Agent 2

All must be true:

- Settings modal opens from menu
- Font family changes visually
- Font size applies instantly
- Line height applies instantly
- Content width applies instantly
- Theme switches correctly
- All settings persist after restart

Only then Agent 3 may begin.

---

# AGENT 3 – Visual Polish and Typography System

## Goal

Make Paper feel **luxurious, calm, and premium**, not like a web app inside a shell.

---

## Owns

- `src/App.css`
- Editor styles
- Global typography styles

---

## Tasks

### 1. Typography System

- Default font stack tuned for writing
- Headings properly scaled
- Paragraph rhythm optimized
- Code blocks refined

---

### 2. Spacing and Layout

- Vertical breathing room
- Proper paragraph separation
- Comfortable reading width
- Disable text selection of UI elements

---

### 3. Status Bar Visual Upgrade

- Subtle background
- Optional translucency
- Monospaced metrics

---

## Acceptance Criteria for Agent 3

All must be true:

- Editor looks like a native writing tool
- Typography feels balanced
- Status bar looks integrated
- No web-app visual artifacts remain
- Light and dark themes both feel intentional
- Do not change any scrolling behavior, use the native scrolling provided by the OS

---

## 3. MVP 2 Final Acceptance Checklist

Paper MVP 2 is only complete when:

- No custom TitleBar exists
- Window title reflects document state
- All actions work from native menus
- Status bar visibility is toggleable
- Settings modal works
- Fonts and layout are customizable
- All preferences persist
- App looks native and polished

---

## 4. Strict Non Goals for MVP 2

Do not implement:

- Tabs
- Sidebar
- Tables
- PDF export
- Focus mode
- Cloud sync
- Plugin system
- Git integration
- Collaboration

---

## 5. Naming This Phase Internally

Recommended internal label:

**Paper v0.2 – Native Polish Release**

## 6. Logging Rules

All agents must append to:

`AGENTS_LOG.md`

Format:

```text
#### YYYY-MM-DD – Agent X
- Summary of changes
- Files modified
- Key decisions
```

Example entry format:

```text
####  2025 12 09 – Architect and project bootstrapper
- Created Tauri plus React template.
- Configured tauri.conf.json with app name and identifier.
- Added initial README with setup instructions.
```
