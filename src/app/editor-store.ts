import { create } from "zustand";
import { executeEditPlan } from "../agent/execute-edit-plan";
import type { EditPlan } from "../agent/edit-plan-schema";
import { createImageDocument, restoreHistoryEntry, type ImageDocument } from "../image/image-document";
import { exportEditedImage, downloadDataUrl } from "../image/exporter";
import { getImageSizeFromDataUrl } from "../image/local-tools";
import { DEFAULT_SETTINGS_VIEW, VI_DEMO_NOTICE } from "../lib/constants";
import { UploadFileSchema, validatePrompt } from "../lib/validators";
import type { AppError } from "../types/api";
import type { ComparisonMode, ExportOptions } from "../types/editor";
import type { SettingsSaveRequest, SettingsView } from "../types/settings";
import { getDesktopApi } from "./desktop-api";

export interface ToastState {
  kind: "success" | "error" | "info";
  title: string;
  body?: string;
}

interface EditorState {
  settings: SettingsView;
  imageDocument: ImageDocument | null;
  editPlan: EditPlan | null;
  prompt: string;
  isGenerating: boolean;
  error: string | null;
  modeNotice: string | null;
  comparisonMode: ComparisonMode;
  exportOptions: ExportOptions;
  toast: ToastState | null;
  loadSettings: () => Promise<void>;
  saveSettings: (request: SettingsSaveRequest) => Promise<boolean>;
  clearApiKey: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  setPrompt: (prompt: string) => void;
  generate: () => Promise<void>;
  restoreHistory: (historyId: string) => Promise<void>;
  setComparisonMode: (mode: ComparisonMode) => void;
  setExportOptions: (options: Partial<ExportOptions>) => void;
  exportCurrent: () => Promise<void>;
  clearToast: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  settings: DEFAULT_SETTINGS_VIEW,
  imageDocument: null,
  editPlan: null,
  prompt: "",
  isGenerating: false,
  error: null,
  modeNotice: null,
  comparisonMode: "after",
  exportOptions: {
    preset: "shopee_square",
    format: "png",
    quality: 0.92
  },
  toast: null,

  loadSettings: async () => {
    const result = await getDesktopApi().getSettings();
    if (result.ok) {
      set({ settings: result.data });
    } else {
      set({ toast: errorToast(result.error) });
    }
  },

  saveSettings: async (request) => {
    const result = await getDesktopApi().saveSettings(request);
    if (result.ok) {
      set({
        settings: result.data,
        toast: { kind: "success", title: "Da luu cai dat", body: "API key chi duoc luu trong lop desktop an toan." }
      });
      return true;
    }

    set({ toast: errorToast(result.error) });
    return false;
  },

  clearApiKey: async () => {
    const result = await getDesktopApi().clearApiKey();
    if (result.ok) {
      set({ settings: result.data, toast: { kind: "info", title: "Da xoa API key" } });
    } else {
      set({ toast: errorToast(result.error) });
    }
  },

  uploadFile: async (file) => {
    const validation = UploadFileSchema.safeParse({ name: file.name, type: file.type, size: file.size });
    if (!validation.success) {
      set({ toast: { kind: "error", title: "Khong the tai anh", body: validation.error.issues[0]?.message } });
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const size = await getImageSizeFromDataUrl(dataUrl);
      const imageDocument = createImageDocument({
        fileName: file.name,
        dataUrl,
        width: size.width,
        height: size.height
      });

      set({
        imageDocument,
        editPlan: null,
        error: null,
        modeNotice: null,
        comparisonMode: "after",
        toast: { kind: "success", title: "Da tai anh", body: `${size.width}x${size.height}` }
      });
    } catch (error) {
      set({ toast: { kind: "error", title: "Khong the doc anh", body: readError(error) } });
    }
  },

  setPrompt: (prompt) => set({ prompt }),

  generate: async () => {
    const state = get();
    if (!state.imageDocument) {
      set({ toast: { kind: "error", title: "Chua co anh", body: "Tai anh len truoc khi tao ket qua." } });
      return;
    }

    const promptError = validatePrompt(state.prompt);
    if (promptError) {
      set({ toast: { kind: "error", title: "Prompt chua san sang", body: promptError } });
      return;
    }

    set({ isGenerating: true, error: null, modeNotice: null, comparisonMode: "after" });

    try {
      const planResult = await getDesktopApi().planEdit({
        instruction: state.prompt,
        imageMeta: {
          width: state.imageDocument.width,
          height: state.imageDocument.height,
          fileName: state.imageDocument.fileName
        }
      });

      if (!planResult.ok) {
        set({ isGenerating: false, error: planResult.error.message, toast: errorToast(planResult.error) });
        return;
      }

      const executed = await executeEditPlan(state.imageDocument, planResult.data.plan, { mode: planResult.data.mode });
      const size = await getImageSizeFromDataUrl(executed.document.currentDataUrl);
      const updatedDocument: ImageDocument = {
        ...executed.document,
        width: size.width,
        height: size.height,
        metadata: {
          ...executed.document.metadata,
          width: size.width,
          height: size.height,
          notices: [
            ...(planResult.data.notice ? [planResult.data.notice] : []),
            ...planResult.data.plan.risk_warnings,
            ...executed.messages
          ]
        }
      };

      set({
        imageDocument: updatedDocument,
        editPlan: planResult.data.plan,
        modeNotice: planResult.data.notice ?? (planResult.data.mode === "demo" ? VI_DEMO_NOTICE : null),
        isGenerating: false,
        comparisonMode: "after",
        toast: {
          kind: "success",
          title: planResult.data.mode === "demo" ? "Da tao ket qua demo" : "Da tao ket qua AI",
          body: planResult.data.plan.explanation_vi
        }
      });
    } catch (error) {
      set({ isGenerating: false, error: readError(error), toast: { kind: "error", title: "Khong the tao anh", body: readError(error) } });
    }
  },

  restoreHistory: async (historyId) => {
    const current = get().imageDocument;
    if (!current) {
      return;
    }

    const restored = restoreHistoryEntry(current, historyId);
    const size = await getImageSizeFromDataUrl(restored.currentDataUrl);
    set({
      imageDocument: {
        ...restored,
        width: size.width,
        height: size.height,
        metadata: { ...restored.metadata, width: size.width, height: size.height }
      },
      comparisonMode: "after",
      toast: { kind: "info", title: "Da khoi phuc lich su" }
    });
  },

  setComparisonMode: (mode) => set({ comparisonMode: mode }),

  setExportOptions: (options) => set({ exportOptions: { ...get().exportOptions, ...options } }),

  exportCurrent: async () => {
    const state = get();
    if (!state.imageDocument) {
      set({ toast: { kind: "error", title: "Chua co anh de xuat" } });
      return;
    }

    try {
      const dataUrl = await exportEditedImage(state.imageDocument.currentDataUrl, state.exportOptions);
      downloadDataUrl(dataUrl, state.imageDocument.fileName, state.exportOptions);
      set({ toast: { kind: "success", title: "Da xuat anh", body: state.exportOptions.preset } });
    } catch (error) {
      set({ toast: { kind: "error", title: "Xuat anh that bai", body: readError(error) } });
    }
  },

  clearToast: () => set({ toast: null })
}));

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("File reader returned an unsupported result."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

function errorToast(error: AppError): ToastState {
  return {
    kind: "error",
    title: error.message,
    body: error.detail
  };
}

function readError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
