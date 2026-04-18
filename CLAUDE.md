# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start full dev environment (Vite + Electron in parallel)
npm run vite         # Vite dev server only (port 5173, no Electron)
npm run build        # Production build: vite build + electron-builder (NSIS installer)
npm run preview      # Preview production build
```

There are no lint or test scripts configured.

## Architecture

**Agendeiro** is a minimalist Windows desktop agenda widget built with Electron + React + TypeScript.

### Dual-window model

Two separate Electron windows, distinguished by URL hash:

- **Widget** (`/#widget`) — A slim pill (30px) anchored to the right edge of the screen. Expands to 280px on click to show today's tasks and meetings. Collapses on blur. Always-on-top, frameless, transparent.
- **Main App** (`/#main`) — Full settings window (900×650px) opened from the system tray. CRUD for tasks and meetings.

`App.tsx` routes between them with a simple `window.location.hash` check — no React Router.

### IPC bridge

`electron/preload.js` exposes `window.electronAPI` to the React layer via `contextBridge`. This is the only way React communicates with Electron:

- `getTasks()` / `saveTasks()` / `getMeetings()` / `saveMeetings()` — data persistence
- `openPanel()` / `closePanel()` / `onClosePanel(cb)` — widget expand/collapse
- `openMainWindow()` / `minimizeMain()` / `closeMain()` — window controls

### State management

`src/store/useStore.ts` is a custom React hook that loads data from `window.electronAPI` (or falls back to demo data when running in-browser without Electron). All components use this single hook for tasks/meetings state.

### Data persistence

`electron-store` writes JSON to `%APPDATA%\agendeiro\config.json`. No database, no backend.

### Key types

Defined in `src/types/index.ts`:

```typescript
interface Task {
  id: string; text: string; done: boolean
  tag: 'trabalho' | 'pessoal' | 'urgente' | 'outro'
  createdAt: number
}
interface Meeting {
  id: string; title: string; time: string  // "HH:MM"
  duration: number  // minutes
  link: string; createdAt: number
}
```

### Build output

`electron-builder` produces a Windows NSIS installer. Build config is in `package.json` under the `"build"` key. App icon is `assets/icon.ico`.
