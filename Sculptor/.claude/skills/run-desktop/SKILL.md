---
name: run-desktop
description: Build, run, and drive the Sculptor Electron desktop app. Use when asked to start the desktop app, take a screenshot of it, build it, or interact with its UI.
---

Sculptor is an Electron + Three.js desktop app (Windows-native, no xvfb needed
here — this machine has a real display). Drive it via the Playwright REPL at
`.claude/skills/run-desktop/driver.mjs`.

All paths are relative to the `Sculptor/` project root.

## Build

```bash
npm install
npm run build        # compiles src/main -> dist/main, src/renderer -> dist/renderer
```

## Run (dev, with hot reload)

```bash
npm run dev
```

## Run (agent path — screenshot/drive without a human)

1. Start the renderer dev server in the background (the app loads
   `http://localhost:5173` whenever `app.isPackaged` is false, i.e. always
   when launched via the raw `electron.exe` binary rather than a packaged
   build):
   ```bash
   npx vite --port 5173 --strictPort &
   ```
2. Launch + drive:
   ```bash
   node .claude/skills/run-desktop/driver.mjs
   ```
   Or use the REPL commands directly in a one-off Node script (see driver.mjs
   for the command implementations — `launch`, `ss <name>`, `click <sel>`,
   `canvas-click <x> <y>`, `eval <js>`, `windows`, `quit`).

Screenshots land in `Sculptor/.screenshots/` (override: `SCREENSHOT_DIR`).

## Gotchas

- **`ELECTRON_RUN_AS_NODE=1` may already be set in the shell env** (it was in
  this session). With it set, `electron.exe` just runs as plain Node — no
  window, no GUI, `require('electron')` returns a path string instead of the
  Electron API, and `app` is undefined. Always unset it for the launch:
  `env -u ELECTRON_RUN_AS_NODE node your-driver.js`.

- **Sandboxed preload can't `require()` local project files.** Electron
  defaults `webPreferences.sandbox` to `true`. A sandboxed preload script's
  `require` only resolves Node built-ins and Electron modules — a relative
  `require('../shared/whatever')` throws `module not found` at preload load
  time, `window.sculptor` (or whatever you exposed) silently stays
  `undefined`, and every renderer call into it throws
  `Cannot read properties of undefined`. Fix: `preload.ts` must be
  self-contained — no value imports from other local `.ts` files (constants
  get inlined/duplicated with a comment explaining why; `import type` is fine
  since it's erased and never becomes a runtime `require`).

- **`tsc`'s `rootDir` + multi-folder `include` nests output one level too
  deep.** `tsconfig.main.json` includes both `src/main/**` and
  `src/shared/**`; with `rootDir: "src"` and `outDir: "dist/main"` you'd get
  `dist/main/main/main.js` (mirrors `src/main/main.ts` under `dist/main/`).
  Fixed by setting `outDir: "dist"` instead, so `src/main/main.ts` →
  `dist/main/main.js` and `src/shared/types.ts` → `dist/shared/types.js` —
  matches `package.json`'s `"main": "dist/main/main.js"`.

- **Native `dialog.showSaveDialog`/`showOpenDialog` don't appear as
  Playwright pages** — they're OS-native windows, invisible to
  `page.screenshot()` and not in `app.windows()`. To test Save/Open/Export
  end-to-end without clicking through a real OS dialog, monkey-patch the real
  `electron.dialog` module from the main process via
  `app.evaluate(({ dialog }) => { dialog.showSaveDialog = async () => ({...}) })`
  — this exercises the actual `fileHandlers.ts` code path (real `fs` I/O),
  just skipping the UI.

- **`contextBridge.exposeInMainWorld` output is frozen** — you cannot
  `Object.defineProperty`/reassign `window.sculptor` from a test script to
  stub its methods. Use the dialog-monkeypatch approach above instead of
  trying to stub the renderer-side bridge.

## Commands (driver.mjs)

| command | what it does |
|---|---|
| `launch` | launch the app, wait for windows |
| `ss [name]` | screenshot → `.screenshots/<name>.png` |
| `click <css-sel>` | click element (via DOM, not coords) |
| `click-text <text>` | click button/link containing text |
| `canvas-click <x> <y>` | left-click the viewport canvas at canvas-relative (x, y) — used to drive drawing/push-pull tools |
| `type <text>` / `press <key>` | keyboard input |
| `wait <css-sel>` | wait for element, 10s timeout |
| `eval <js>` | evaluate in the page, print JSON |
| `text [css-sel]` | print innerText |
| `windows` | list Chromium windows (won't show native OS dialogs) |
| `quit` | close app, exit |
