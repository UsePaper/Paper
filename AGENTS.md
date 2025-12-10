# Typora-like Markdown Editor (Rust + Tauri)

Build a cross platform desktop app using Rust and Tauri that feels similar to [Typora)[https://typora.io/].

Single pane, distraction free, What You See Is What You Mean markdown editing:

- No separate preview window.
- No explicit mode switcher.
- Markdown syntax transforms into formatted content while typing, so the document looks like a clean rendered page.
- Minimal chrome, focus on the text.

# Repository Guidelines

## Project Structure & Module Organization

- `src/`: React + TypeScript UI. `components/` holds UI pieces (Editor, StatusBar, modals), `styles/` centralizes theme variables, `settings.ts` stores defaults/persistence helpers, and `assets/` keeps bundled media.
- `src-tauri/`: Rust side of the Tauri app. `src/` contains commands invoked from the UI (file IO, dialogs), `tauri.conf.json` and `capabilities/` define window/app permissions, and `icons/` stores platform assets.
- `public/`: Static assets copied verbatim into the Vite build; `dist/` is generated output.
- Root configs: `vite.config.ts`, `tsconfig*.json`, and `package.json` define tooling and entry (`index.html`).

## Build, Test, and Development Commands

- `pnpm install`: Install JS/TS dependencies (pnpm is expected because `pnpm-lock.yaml` is checked in).
- `pnpm dev`: Vite dev server for the web UI at `http://localhost:5173`; fastest way to iterate on React code.
- `pnpm tauri dev`: Launch the desktop app with hot reload (requires Rust toolchain and Tauri CLI); exercises both UI and Rust commands.
- `pnpm build`: Type-check via `tsc` then produce a production bundle in `dist/`.
- `pnpm preview`: Serve the built bundle locally to sanity-check production output.

## Coding Style & Naming Conventions

- TypeScript throughout; keep components as functional components with hooks. Prefer PascalCase for components, camelCase for functions/variables, and SCREAMING_SNAKE for constants (e.g., `UNTITLED`).
- Use 2-space indentation and double quotes, matching current files. Keep imports ordered from libs to local modules.
- Keep stateful logic in `App.tsx` and pass focused props to children; avoid adding side effects outside `useEffect`/`useCallback`.
- Rust (Tauri) code follows idiomatic snake_case and should remain minimal, only exposing required commands.

## Testing Guidelines

- No automated test suite is configured yet. For changes, smoke-test via `pnpm dev` or `pnpm tauri dev`: create/open/save a file, toggle themes, and confirm the status bar updates (word count, dirty state).
- If you add tests, prefer Vitest for UI and standard Rust tests in `src-tauri/src/`. Mirror filenames with `.test.ts` or `_test.rs` suffixes.

## Commit & Pull Request Guidelines

- Commit messages should be short and imperative; conventional scopes (`feat(ui): …`, `fix: …`) are welcome and match existing history.
- PRs should describe the user-facing change, list key commands run, and note platform coverage (macOS/Windows/Linux) when relevant. Include before/after screenshots for UI tweaks and link any related issues.

## Security & Configuration Tips

- Tauri capabilities in `src-tauri/capabilities/` limit filesystem/window access—keep additions minimal and documented.
- Avoid storing secrets in the repo; prefer environment variables or OS keychains. Audit new dependencies for desktop safety before adding them.

# Development

## 1. Logging and coordination

Use `AGENTS_LOG.md` to record what each agent has done. For each significant change, append an entry:

- Date and time.
- Agent name.
- Short summary of changes.
- Important decisions or deviations from this plan.

Example entry format:

```text
## 2025 12 09 – Architect and project bootstrapper
- Created Tauri plus React template.
- Configured tauri.conf.json with app name and identifier.
- Added initial README with setup instructions.
```

Respect agent ownership of files when possible. If one agent must touch another agent’s file, record that clearly in `AGENTS_LOG.md` with a short rationale.
