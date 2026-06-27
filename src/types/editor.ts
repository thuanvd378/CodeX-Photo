import type { EditPlan } from "../agent/edit-plan-schema";
import type { ExportPresetId } from "../lib/constants";

export type ComparisonMode = "before" | "after" | "split";

export interface HistoryEntry {
  id: string;
  label: string;
  dataUrl: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface EditorMetadata {
  fileName: string;
  width: number;
  height: number;
  lastPlan?: EditPlan;
  exportPreset?: ExportPresetId;
  notices: string[];
}

export interface ExportOptions {
  preset: ExportPresetId;
  format: "png" | "jpeg" | "webp";
  quality: number;
}
