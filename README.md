# Paper

> **Superseded by [PaperV2](https://github.com/UsePaper/PaperV2).** This is the first
> Paper: React and Tiptap on Tauri. The second is a rewrite on ProseMirror with a
> stricter rule about the file on disk, and it is where the work continues. This
> repository stays up because it is where the idea was worked out.

Paper is a lightweight Tauri-based Markdown editor with a focus on clean typing, quick word-count insight, and simple file operations on desktop. It is inspired by [Typora](https://typora.io/).

## Quick start

- Install dependencies with `pnpm install`.
- Run the web dev server: `pnpm dev` (opens at `http://localhost:5173`).
- Run the desktop app: `pnpm tauri dev` (requires Rust toolchain and Tauri CLI).
- Production build: `pnpm build`, then preview with `pnpm preview`.

## Features

- Rich text area powered by Tiptap with Markdown support.
- Open/Save/Save As flows via Tauri commands, with dirty-state tracking.
- Theme controls (system/light/dark), adjustable font, line height, and content width.
- Status bar with live word count and toggle.

## Contributing

See `AGENTS.md` for repository guidelines, coding style, and PR expectations.
