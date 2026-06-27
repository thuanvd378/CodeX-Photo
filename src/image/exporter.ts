import { EXPORT_PRESETS, type ExportPresetId } from "../lib/constants";
import type { ExportOptions } from "../types/editor";
import { centerOnPresetDataUrl, dataUrlExtension, exportDataUrlWithFormat } from "./local-tools";

export function getExportPreset(id: ExportPresetId) {
  return EXPORT_PRESETS.find((preset) => preset.id === id) ?? EXPORT_PRESETS[EXPORT_PRESETS.length - 1];
}

export async function exportEditedImage(dataUrl: string, options: ExportOptions): Promise<string> {
  const staged = await centerOnPresetDataUrl(dataUrl, {
    preset: options.preset,
    background: getExportPreset(options.preset).background
  });
  return exportDataUrlWithFormat(staged, options.format, options.quality);
}

export function downloadDataUrl(dataUrl: string, fileBaseName: string, options: ExportOptions): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${sanitizeFileBase(fileBaseName)}-${options.preset}.${dataUrlExtension(options.format)}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function sanitizeFileBase(value: string): string {
  const base = value.replace(/\.[^.]+$/, "");
  return base.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "codex-photo-export";
}
