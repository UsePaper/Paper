# AGENTS.md – Typora-like Markdown Editor MVP (Rust + Tauri)

## 0. High level vision

Build a cross platform desktop app using Rust and Tauri that feels similar to Typora for basic usage.

Single pane, distraction free, What You See Is What You Mean markdown editing:

* No separate preview window.
* No explicit mode switcher.
* Markdown syntax transforms into formatted content while typing, so the document looks like a clean rendered page.
* Minimal chrome, focus on the text.

MVP only, so we limit features to the core experience.

Target platforms: macOS, Windows, Linux.

Frontend: React + TypeScript using a WYSIWYG markdown editor (TipTap with markdown extension).

Backend: Tauri with Rust commands for file system operations and basic app plumbing.

---

## 1. Core scope and non goals

### 1.1 Core features for MVP

The app must support:

1. **Single document window**

   * One main window with a single document view.
   * Simple app title bar with document name and dirty marker, example `Untitled.md • Typora MVP`.

2. **WYSIWYM markdown editing**

   * Typing markdown shortcuts applies formatting as you type.
   * Examples:

     * `# ` at the start of a line transforms into H1 heading.
     * `## ` to `#### ` for smaller headings.
     * `*text*` or `_text_` becomes italic.
     * `**text**` or `__text__` becomes bold.
     * `> ` at the start becomes a block quote.
     * `- ` or `* ` at line start becomes a bullet list.
     * `1. ` becomes a numbered list.
     * ` ` (three backticks) starts a code block.
   * Rendered view shows headings, lists, bold, italics, etc, without raw markdown markers where possible.

3. **Basic markdown structures**

   * Headings H1 to H4.
   * Paragraphs.
   * Bold and italics.
   * Inline code.
   * Code fences.
   * Unordered and ordered lists.
   * Blockquotes.
   * Horizontal rules.
   * Links (inline URL, basic).
   * Inline images by URL (file import is optional, see below).

4. **File operations**

   * New file (starts as `Untitled.md`).
   * Open existing `.md` file from disk.
   * Save current document.
   * Save As.
   * Track dirty state and prompt before closing when unsaved changes exist.

5. **Basic UX**

   * Minimal toolbar or no toolbar, but at least:

     * A simple top bar for document title.
     * A subtle status bar at the bottom with:

       * Word count.
       * Line and column display is optional, but nice to have.
   * Light and dark themes that follow system theme if possible.
   * Command palette or menus for shortcuts is optional, but basic keyboard shortcuts must exist (Cmd or Ctrl plus S, O, N).

6. **Keyboard shortcuts**

   * Cmd or Ctrl plus N for new file.
   * Cmd or Ctrl plus O for open.
   * Cmd or Ctrl plus S for save.
   * Cmd or Ctrl plus Shift plus S for Save As.
   * Standard selection and navigation keys should work inside the editor.

7. **Cross platform build setup**

   * Tauri project configured to build on macOS, Windows, Linux.
   * Documented build commands in `README.md`.

### 1.2 Explicit non goals for MVP

These are nice to have, but explicitly not required in this first version:

* No file tree panel or folder sidebar.
* No multiple tabs or multiple documents at once.
* No export to PDF, DOCX, LaTeX, or other formats.
* No math rendering or diagrams.
* No images upload to cloud, relative path helpers, or inline image resizing.
* No focus mode or typewriter mode.
* No table editing or advanced markdown extensions like footnotes or front matter.
* No sync or cloud features.
* No plugin system or custom themes beyond a simple light and dark theme.

---

## 2. Repository structure

This is the **existing verified directory structure** that Codex must respect:

```text
Paper/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public/
│   ├── tauri.svg
│   └── vite.svg
├── README.md
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── assets/
│   │   └── react.svg
│   ├── main.tsx
│   └── vite-env.d.ts
├── src-tauri/
│   ├── build.rs
│   ├── capabilities/
│   │   └── default.json
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── gen/
│   │   └── schemas/
│   ├── icons/
│   ├── src/
│   │   ├── lib.rs
│   │   └── main.rs
│   └── tauri.conf.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Codex **must modify and extend these files only**.
No new project scaffolding is allowed.


---

## 3. Agents and responsibilities

Each agent has a goal, owned files, and step by step tasks.

### 3.1 Agent: Rust backend and Tauri command author

**Goal**
Provide a minimal Rust backend for file IO and app integration with the OS.

**Owns**

* `src-tauri/src/lib.rs`
* `src-tauri/src/main.rs`
* `src-tauri/tauri.conf.json`
* `src-tauri/Cargo.toml` if dependencies are required

**Tasks**

1. Define Tauri commands

   * In `commands.rs` define functions:

     * `read_file(path: String) -> Result<String, String>`
     * `write_file(path: String, contents: String) -> Result<(), String>`
     * `show_open_dialog() -> Result<Option<String>, String>`.
     * `show_save_dialog(default_file_name: String) -> Result<Option<String>, String>` or similar.
   * Use Rust standard library for reading and writing UTF8 text files.

2. Register commands in `main.rs`

   * Register all commands using `tauri::generate_handler!`.
   * Launch the app with a single window.

3. Configure security in `tauri.conf.json`

   * Allow file access for markdown documents.
   * Restrict paths to user chosen locations only, use standard Tauri patterns.
   * Ensure `allowlist.fs` and `allowlist.dialog` settings are enabled as needed.

4. Error handling

   * For each command, return human readable error messages.
   * Do not panic on IO errors.

5. Build and smoke test

   * Confirm `tauri dev` runs and shows the main window.
   * Expose commands to the frontend through the standard Tauri JS API.

### 3.2 Agent: Frontend shell and layout engineer

**Goal**
Create the React shell that holds the editor, with minimal UI chrome and basic interactions.

**Owns**

* `app/src/main.tsx`
* `app/src/App.tsx`
* `app/src/components/TitleBar.tsx`
* `app/src/components/StatusBar.tsx`
* `app/src/styles/global.css`
* `app/src/styles/theme.css`

**Tasks**

1. App entry

   * In `main.tsx`, mount `<App />` into `index.html`.
   * Wire in global styles.

2. App layout

   * In `App.tsx`:

     * Layout:

       * Vertical flex column.
       * Top: `TitleBar`.
       * Center: `Editor`.
       * Bottom: `StatusBar`.
     * Maintain React state:

       * `currentFilePath: string | null`.
       * `documentTitle: string` extracted from file name or "Untitled".
       * `isDirty: boolean`.
       * `content: string` as current markdown source, or delegate this to editor agent, but keep at least a top level copy.
     * Provide callbacks to editor:

       * `onContentChange(newContent: string)`.
       * `onContentStatsChange(stats)`, for example word count, line count.

3. Title bar

   * Implement `TitleBar` component:

     * Displays `documentTitle` and dirty marker, for example a dot or asterisk.
     * Provides buttons or menu items for New, Open, Save, Save As as optional icons.
     * Invokes callbacks from `App` to perform these actions.

4. Status bar

   * Implement `StatusBar` component:

     * Shows word count, for example `123 words`.
     * Optionally show document length or line count.
     * Optionally show current theme indicator.

5. Theme and styling

   * `global.css`:

     * Set basic reset styles.
     * Use a clean font such as system default, for example `-apple-system`, `Segoe UI`, etc.
     * Make background neutral and unobtrusive.
   * `theme.css`:

     * Provide `.theme-light` and `.theme-dark` classes on the root element.
     * Add styles for headings, paragraphs, blockquotes, lists, code blocks, that feel like a clean reader.

6. System theme integration

   * Use CSS prefers color scheme media query to set initial theme.
   * Add a simple toggle if needed, but this is optional.

7. Wire file commands

   * Use Tauri JS bridge, for example `@tauri-apps/api`:

     * For open:

       * Prompt user for file path via dialog.
       * Call Rust `read_file`.
       * Update `content`, `currentFilePath`, `documentTitle`, `isDirty`.
     * For save:

       * If `currentFilePath` is not null, call `write_file`.
       * Otherwise call save dialog then write.
     * For new file:

       * Prompt to save if `isDirty`.
       * Clear content, reset file path to null, set title to `Untitled`, clear dirty flag.

8. Keyboard shortcuts

   * Use a library like `react-hotkeys` or manual event listeners.
   * Bind Cmd or Ctrl plus N, O, S, Shift plus S to the same actions as menu items.

### 3.3 Agent: WYSIWYM markdown editor implementer

**Goal**
Implement the central editor component that gives a Typora like single pane editing experience, using a markdown aware rich text editor.

**Owns**

* `app/src/components/Editor.tsx`
* Any editor specific helper files under `app/src/editor/*`.
* Editor related styling under `app/src/styles/theme.css` or a dedicated CSS file.

**Tasks**

1. Choose editor library

   * Use TipTap with Markdown extension that:

     * Allows markdown shortcuts for headings, lists, bold, italics, code blocks, and blockquotes.
     * Renders styled blocks instead of raw markdown.
     * Can export content back to markdown string with a function such as `getMarkdown()` or equivalent.

2. Editor component API

   * `Editor` props:

     * `value: string` current markdown content from parent.
     * `onChange(newMarkdown: string)` callback when content changes.
     * `onStatsChange(stats: { wordCount: number })` optional callback.
   * Internally:

     * Initialise editor state from `value`.
     * When user types, convert internal document to markdown and call `onChange` with debouncing to avoid too many updates.
     * Calculate word count from the plain text part of the document and call `onStatsChange`.

3. WYSIWYM behaviour

   * Configure the editor to:

     * Convert `# ` patterns to headings automatically.
     * Convert `*` and `_` pairs to italic.
     * Convert `**` and `__` pairs to bold.
     * Convert `- ` and `1.` at line start to lists.
     * Convert `> ` at line start to blockquotes.
   * Ensure the UI shows:

     * Heading sizes and typography, not raw `#`.
     * Styled lists and blockquotes.
     * Inline code styled with monospace font and background.
     * Code blocks with monospace font and background.

4. Minimal toolbar or none

   * MVP can have no visible toolbar, relying entirely on markdown shortcuts and keyboard.
   * Optionally include a very small inline bubble for basic formatting (bold, italic, code) when text is selected.

5. Styling

   * Ensure content area:

     * Is centered in the window.
     * Has reasonable max width, for example 700 to 900 pixels.
     * Has generous line spacing and margins.
   * Provide support for light and dark themes by referencing CSS variables or theme classes.

6. Focus and selection

   * Make sure clicking inside the page focuses the editor.
   * Use smooth scrolling inside the main window; avoid nested scrollbars if possible.

7. Initial content

   * On new file, show either:

     * Empty document.
     * Or a short placeholder such as a heading and a line that explains basic shortcuts, which disappears once user edits. This is optional and must be easy to remove.

8. Synchronisation with parent state

   * When parent passes a new `value` because a file has been opened:

     * Replace editor content with the new markdown, without incorrectly treating it as user typing.
   * Protect against loops where `onChange` triggers parent state which triggers new props, which triggers another update.
   * Use an internal flag or a comparison to avoid unnecessary re initialisation.

### 3.4 Agent: File workflow and dirty state guardian

**Goal**
Ensure file open or save behaviour is safe and predictable, and that users are warned before losing changes.

**Owns**

* Dirty state logic in `App.tsx`.
* Open, save, save as flows.
* Interaction between UI and Rust commands.

**Tasks**

1. Dirty state tracking

   * Set `isDirty` to true whenever editor content changes relative to last saved content.
   * After successful save, set `isDirty` false and update a `lastSavedContent` reference.

2. New file flow

   * If `isDirty` is true:

     * Show a confirm dialog:

       * Save, discard, or cancel.
     * Save:

       * Run save flow first.
       * If save success, then create new file.
     * Discard:

       * Create new file without saving.
     * Cancel:

       * Do nothing.
   * New file resets:

     * `currentFilePath = null`.
     * `documentTitle = "Untitled"`.
     * `content = ""`.
     * `isDirty = false`.

3. Open file flow

   * If `isDirty` is true, use same confirm dialog as new file flow.
   * When user chooses open:

     * Show system open dialog for `.md` files.
     * Call `read_file` command.
     * On success:

       * Set `content` to file contents.
       * Update `currentFilePath` and `documentTitle`.
       * Set `isDirty = false`, `lastSavedContent = content`.

4. Save flow

   * If `currentFilePath` is null:

     * Run Save As flow.
   * Otherwise:

     * Call `write_file` with current `content`.
     * On success, set `isDirty = false`, update `lastSavedContent`.

5. Save As flow

   * Open save dialog with default name `Untitled.md` or current document title.
   * On user selection:

     * Call `write_file` with chosen path.
     * Update `currentFilePath` and `documentTitle`.
     * Set `isDirty = false`.

6. Window close behaviour

   * If the platform allows intercepting window close:

     * If `isDirty` is true:

       * Prompt user to save or discard.
     * Only allow close when user explicitly chooses to continue.

7. Error handling

   * For any IO error:

     * Show a user friendly message via a dialog or inline alert.
   * Do not crash the app on failures.

### 3.5 Agent: Theming and polish specialist

**Goal**
Make the app feel like a minimal but pleasant Typora style environment, without adding extra features.

**Owns**

* Theme CSS files.
* Small visual refinements in layout components and editor.

**Tasks**

1. Typography

   * Use smooth font rendering.
   * Heading sizes that are visually distinct.
   * Comfortable line height, for example 1.5.
   * Adequate margins between paragraphs and sections.

2. Light theme

   * Soft off white background.
   * Dark gray text for reduced eye strain.
   * Gentle accents for links and selection.

3. Dark theme

   * Dark gray background.
   * Light gray text.
   * Maintain good contrast for readability.

4. Distraction free feeling

   * Remove borders and excessive lines around the editor.
   * Hide scrollbars when not in use, but ensure they appear when needed.
   * Keep color palette simple.

5. Title bar and status bar

   * Make bars visually minimal but readable.
   * Use subtle separators rather than heavy lines.

6. Icon set

   * Use a small, consistent icon set for toolbar and menu actions if needed.
   * Icons should be simple and monochrome where possible.

7. Accessibility

   * Ensure text contrast is sufficient.
   * Keep font sizes reasonable and allow easy future change via CSS variables.

---

## 4. Development phases and sequence

This section describes the order in which Codex should run the agents and implement features.

### Phase 1 – First steps

1.1. Rust backend and Tauri command author:

   * Implement `read_file`, `write_file`, and dialog helpers.
   * Register commands.
   * Confirm Tauri dev build runs.

### Phase 2 – Shell and editor integration

2.1. Frontend shell and layout engineer:

   * Implement `App.tsx`, TitleBar, StatusBar.
   * Integrate Tauri bridge for file commands.
   * Wire up keyboard shortcuts.

2.2. WYSIWYM markdown editor implementer:

   * Integrate TipTap markdown aware editor.
   * Implement Editor component with WYSIWYM behaviour.
   * Ensure live updates and word count reporting.

2.3. File workflow and dirty state guardian:

   * Implement new, open, save, and save as flows.
   * Add dirty state logic and confirmation dialogs.

### Phase 3 – Theming and polish

3.1. Theming and polish specialist:

   * Implement light and dark themes.
   * Adjust typography and spacing.
   * Remove unnecessary visual noise.

3.2. Final pass:

   * Fix any cross platform issues.
   * Verify file operations and unsaved changes prompts.
   * Run through basic user flows and adjust.

---

## 5. Acceptance criteria checklist

Codex should confirm all of the following before considering the MVP complete.

1. Project runs with `tauri dev` on at least one platform and builds with `tauri build`.
2. App opens with a single window showing:

   * A simple title bar with document title and dirty indicator.
   * A central editor area that feels like a rendered page.
   * A status bar that at least shows word count.
3. User can:

   * Type headings and see them styled as headings.
   * Use markdown patterns for lists, blockquotes, bold, italics.
   * Create and edit code blocks and inline code.
4. Markdown syntax does not remain visually noisy:

   * Headings use visual levels rather than literal `#` markers.
   * Lists and blockquotes are rendered with appropriate indentation and bullets.
5. File operations:

   * New, open, save, and save as are all implemented and working.
   * Unsaved changes are not lost without a warning.
6. Keyboard shortcuts:

   * Cmd or Ctrl plus N, O, S, Shift plus S are functional.
7. Theming:

   * Light and dark themes both work.
   * Content area is easy to read.
8. No preview pane or explicit mode switch is present.

   * There is only one main content area which is both editor and rendered view.
9. No extra unplanned features are added that complicate the UI.

   * The app remains minimal and focused on writing.

---

## 6. Logging and coordination

Use `AGENTS_LOG.md` to record what each agent has done. For each significant change, append an entry:

* Date and time.
* Agent name.
* Short summary of changes.
* Important decisions or deviations from this plan.

Example entry format:

```text
#### 2025 12 09 – Architect and project bootstrapper
- Created Tauri plus React template.
- Configured tauri.conf.json with app name and identifier.
- Added initial README with setup instructions.

```

Respect agent ownership of files when possible. If one agent must touch another agent’s file, record that clearly in `AGENTS_LOG.md` with a short rationale.

---

## 7. Future extensions, not for this MVP

Only for later versions, do not implement now:

* File tree sidebar and recent files.
* Export to PDF or other formats.
* MathJax, diagrams, tables.
* Focus mode and typewriter mode.
* Custom themes and CSS editor.
* Multiple tabs or split views.
* Plugins or extensions.

Keep this MVP narrow and focused on a single document, single pane, Typora style editing experience.
