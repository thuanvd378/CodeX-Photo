import type { EditPlan } from "../agent/edit-plan-schema";
import type { ExportPresetId } from "../lib/constants";
import type { EditorMetadata, HistoryEntry } from "../types/editor";
import { createRasterLayer, type ImageLayer } from "./layers";
import type { ImageMask } from "./masks";

export interface ImageDocument {
  id: string;
  fileName: string;
  originalDataUrl: string;
  currentDataUrl: string;
  width: number;
  height: number;
  layers: ImageLayer[];
  masks: ImageMask[];
  history: HistoryEntry[];
  metadata: EditorMetadata;
}

export function createImageDocument(input: {
  fileName: string;
  dataUrl: string;
  width: number;
  height: number;
}): ImageDocument {
  const initialHistory: HistoryEntry = {
    id: crypto.randomUUID(),
    label: "Original upload",
    dataUrl: input.dataUrl,
    createdAt: new Date().toISOString()
  };

  return {
    id: crypto.randomUUID(),
    fileName: input.fileName,
    originalDataUrl: input.dataUrl,
    currentDataUrl: input.dataUrl,
    width: input.width,
    height: input.height,
    layers: [createRasterLayer("Original image", input.dataUrl)],
    masks: [],
    history: [initialHistory],
    metadata: {
      fileName: input.fileName,
      width: input.width,
      height: input.height,
      notices: []
    }
  };
}

export function pushDocumentHistory(
  document: ImageDocument,
  label: string,
  metadata?: Record<string, string | number | boolean>
): ImageDocument {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    label,
    dataUrl: document.currentDataUrl,
    createdAt: new Date().toISOString(),
    metadata
  };

  return {
    ...document,
    history: [entry, ...document.history].slice(0, 18)
  };
}

export function restoreHistoryEntry(document: ImageDocument, historyId: string): ImageDocument {
  const entry = document.history.find((item) => item.id === historyId);
  if (!entry) {
    return document;
  }

  return {
    ...document,
    currentDataUrl: entry.dataUrl,
    metadata: {
      ...document.metadata,
      notices: [`Restored history entry: ${entry.label}`, ...document.metadata.notices]
    }
  };
}

export function updateDocumentPlan(document: ImageDocument, plan: EditPlan, exportPreset: ExportPresetId): ImageDocument {
  return {
    ...document,
    metadata: {
      ...document.metadata,
      lastPlan: plan,
      exportPreset
    }
  };
}
