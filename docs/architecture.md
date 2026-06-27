# Architecture

## Desktop Boundary

CodeX Photo is an Electron desktop application. Vite is used as the renderer development server, but the user opens an Electron software window rather than a browser tab.

## Main Process

The Electron main process owns:

- Window creation.
- IPC handlers.
- Secure settings persistence.
- API key access.
- AI planner API calls.

Files:

- `electron/main.ts`
- `electron/preload.ts`
- `electron/ipc.ts`
- `electron/secure-store.ts`

## Renderer Process

The renderer owns:

- Upload and preview.
- Prompt input.
- Before/after comparison.
- Canvas-based local editing.
- History restore.
- Export download.
- Settings UI without raw key reads.

## API Key Security

The renderer can submit a new key to the main process but cannot read the stored key back. `secure-store.ts` uses Electron `safeStorage` when available and returns only masked status through `loadSettingsView`.

## AI Planner Flow

1. Renderer sends prompt and image metadata through IPC.
2. Main process reads settings and API key.
3. If demo mode is on or no key exists, main process returns a local rule-based plan.
4. If a key exists and demo mode is off, main process calls the planner API.
5. The plan is validated by `EditPlanSchema`.
6. Renderer executes the validated tool commands.

## Image Tool Execution Flow

`execute-edit-plan.ts` walks the plan steps and dispatches each command through `tool-registry.ts`. Local tools use Canvas for brightness, contrast, saturation, sharpening approximation, blur approximation, padding, resize, background replacement approximation, and export preset staging.

## Export Flow

`exporter.ts` centers the current result on the selected preset canvas, converts to PNG/JPG/WebP, and triggers a desktop download from the renderer.
