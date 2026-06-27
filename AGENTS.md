# AGENTS.md

## Run

- Install dependencies with `npm install`.
- Preferred local launch is `RUN_CODEX_PHOTO.cmd`; it checks dependencies, installs Electron runtime if missing, compiles, and launches.
- Start the desktop app with `npm run dev`. The Vite server is internal; Electron opens the user-facing app window.
- If Electron's runtime binary is missing after an install with scripts disabled, run `npm run electron:install`.
- Build compiled production assets with `npm run build`.

## Verify

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run smoke`
- `npm run verify`

## Organization

- `electron/` owns main-process, preload, IPC, and secure settings storage.
- `src/app/` owns renderer bootstrapping.
- `src/components/` owns UI and editor components.
- `src/agent/` owns prompt compilation, edit-plan schema, planning, tool registry, and plan execution.
- `src/image/` owns document, layers, masks, canvas renderer, local tools, mock edit, and export logic.
- `src/types/` owns cross-layer types.
- `docs/` owns product and technical notes.

## Coding Standards

- TypeScript strict mode only.
- No implicit `any`.
- Keep business logic out of large UI components.
- Validate cross-process data with Zod.
- Prefer small named components and focused modules.
- Do not add placeholder routes, dead controls, or unfinished implementation marker strings.

## UI Standards

- Treat CodeX Photo as professional desktop creative software.
- Keep surfaces compact, precise, and neutral.
- Use clear empty, loading, success, and error states.
- Avoid marketing-page patterns, oversized hero copy, decorative gradients, and fake claims.

## API Key Safety

- API keys are saved only through the Electron main process.
- The renderer must never receive the stored key in plain text.
- Renderer settings may show only masked status such as "API key da duoc thiet lap".
- API calls must be made from the main process or a protected backend layer.

## Definition Of Done

- Desktop window opens through Electron.
- Upload, prompt, plan, local demo edits, before/after, history restore, and export work.
- Settings save provider, model, theme, accent color, demo mode, and API-key status.
- Demo mode is explicitly labeled as local approximation.
- `npm run verify` passes or the remaining blocker is documented in `SELF_REPAIR_LOG.md`.
