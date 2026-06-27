# CodeX Photo

CodeX Photo is a professional desktop AI photo editor prototype where users describe the result they want and the app plans and operates the editing tools for them.

The visible UI stays simple: upload an image, type a Vietnamese or English edit request, generate an edit plan, preview the result, restore history, and export. Behind that UI, the prototype contains an agent planner, tool registry, document model, local Canvas editing engine, secure Electron settings, and demo fallback mode.

## Setup

```bash
npm install
```

## Run The Desktop App

One-click runner on Windows:

```powershell
.\RUN_CODEX_PHOTO.cmd
```

That file checks dependencies, installs the Electron runtime if needed, recompiles the desktop main process, starts Vite internally, and opens the Electron app window.

```bash
npm run dev
```

This starts Vite internally and opens CodeX Photo as an Electron desktop window. The user-facing experience is not a browser tab.

If dependencies were installed with npm scripts disabled and Electron reports a missing runtime binary, run:

```bash
npm run electron:install
```

## API Key Setup

Open **Cai dat** in the top bar, choose the API provider/model, paste an API key, and save. The key is handled by the Electron main process and is never returned to the renderer after saving. The settings UI only shows masked key status.

## Demo Mode

If no API key exists or demo mode is enabled, CodeX Photo uses a local rule-based planner and Canvas approximations. The UI clearly labels this as:

> Demo mode - chinh sua mo phong cuc bo, khong phai ket qua AI

Demo mode supports white background placement, brightness/contrast, saturation, sharpening approximation, blur approximation, color tint approximation, padding, resize, and export presets.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run smoke
npm run verify
```

`npm run verify` runs lint, typecheck, unit tests, smoke checks, and production build.

## Export Presets

- Shopee 1:1 - 1024x1024
- TikTok Shop 4:5 - 1080x1350
- Story/Reels 9:16 - 1080x1920
- Original ratio

Exports are generated from the rendered result and use padding/background where needed instead of destructive cropping.

## Known Limitations

- Local demo mode approximates background replacement and object removal; it does not perform true semantic segmentation.
- API planner integration is implemented from the secure main process, but generative image-edit API execution is intentionally conservative in this MVP.
- The build script compiles production assets for Electron/Vite; installer packaging is a future step.

## Roadmap

- Add real segmentation masks and inpainting.
- Add model-specific image edit adapters.
- Add batch marketplace exports.
- Add richer layer controls for audit/debug views.
- Add installer packaging and signed releases.
