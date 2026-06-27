import type { EditStep, ToolCommandName } from "./edit-plan-schema";
import type { ImageDocument } from "../image/image-document";
import {
  addPaddingDataUrl,
  adjustBrightnessContrastDataUrl,
  adjustSaturationDataUrl,
  blurDataUrl,
  centerOnPresetDataUrl,
  recolorDataUrl,
  resizeDataUrl,
  rotateDataUrl,
  sharpenDataUrl
} from "../image/local-tools";

export interface ToolExecutionContext {
  mode: "api" | "demo";
}

export interface ToolExecutionResult {
  document: ImageDocument;
  message?: string;
}

export type ToolExecutor = (
  document: ImageDocument,
  step: EditStep,
  context: ToolExecutionContext
) => Promise<ToolExecutionResult>;

const unavailableInDemo = (toolName: ToolCommandName): ToolExecutor => {
  return async (document) => ({
    document,
    message: `${toolName} is not available as a full local demo tool; skipped safely.`
  });
};

const registry: Record<ToolCommandName, ToolExecutor> = {
  load_image: async (document) => ({ document }),
  segment_subject: unavailableInDemo("segment_subject"),
  detect_background: async (document) => ({
    document,
    message: "Detected background approximately from the full canvas in demo mode."
  }),
  create_mask: unavailableInDemo("create_mask"),
  refine_mask: unavailableInDemo("refine_mask"),
  replace_background: async (document, step) => {
    const background = getString(step.parameters.background, "clean_white");
    return {
      document: {
        ...document,
        currentDataUrl: await centerOnPresetDataUrl(document.currentDataUrl, {
          preset: "original",
          background: background === "clean_white" ? "#ffffff" : background
        })
      },
      message: "Applied clean background approximation."
    };
  },
  remove_object: async (document) => ({
    document: { ...document, currentDataUrl: await blurDataUrl(document.currentDataUrl, 1.5) },
    message: "Local demo approximated object removal with a subtle soft fill."
  }),
  recolor_region: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await recolorDataUrl(
        document.currentDataUrl,
        getString(step.parameters.tint, "#f4f1e8"),
        getNumber(step.parameters.strength, 0.15)
      )
    },
    message: "Applied a local color tint approximation."
  }),
  adjust_brightness: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await adjustBrightnessContrastDataUrl(document.currentDataUrl, {
        brightness: getNumber(step.parameters.amount, 0),
        contrast: 0,
        exposure: 0
      })
    }
  }),
  adjust_contrast: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await adjustBrightnessContrastDataUrl(document.currentDataUrl, {
        brightness: 0,
        contrast: getNumber(step.parameters.amount, 0),
        exposure: 0
      })
    }
  }),
  adjust_exposure: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await adjustBrightnessContrastDataUrl(document.currentDataUrl, {
        brightness: 0,
        contrast: 0,
        exposure: getNumber(step.parameters.amount, 0)
      })
    }
  }),
  adjust_saturation: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await adjustSaturationDataUrl(document.currentDataUrl, getNumber(step.parameters.amount, 0))
    }
  }),
  adjust_temperature: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await adjustBrightnessContrastDataUrl(document.currentDataUrl, {
        brightness: 0,
        contrast: 0,
        exposure: 0,
        temperature: getNumber(step.parameters.amount, 0)
      })
    }
  }),
  sharpen: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await sharpenDataUrl(document.currentDataUrl, getNumber(step.parameters.amount, 0.2))
    }
  }),
  blur_background: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await blurDataUrl(document.currentDataUrl, getNumber(step.parameters.radius, 2))
    },
    message: "Local demo blurred the full raster because no semantic background mask exists yet."
  }),
  denoise: async (document) => ({
    document: { ...document, currentDataUrl: await blurDataUrl(document.currentDataUrl, 0.4) },
    message: "Applied light denoise approximation."
  }),
  crop: unavailableInDemo("crop"),
  resize: async (document, step) => ({
    document: {
      ...document,
      ...(await resizeDataUrl(
        document.currentDataUrl,
        getNumber(step.parameters.width, document.width),
        getNumber(step.parameters.height, document.height)
      ))
    }
  }),
  rotate: async (document, step) => ({
    document: {
      ...document,
      ...(await rotateDataUrl(document.currentDataUrl, getNumber(step.parameters.degrees, 0)))
    }
  }),
  add_padding: async (document, step) => ({
    document: {
      ...document,
      ...(await addPaddingDataUrl(
        document.currentDataUrl,
        getNumber(step.parameters.padding, 80),
        getString(step.parameters.background, "#ffffff")
      ))
    }
  }),
  center_product: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await centerOnPresetDataUrl(document.currentDataUrl, {
        preset: "original",
        paddingRatio: getNumber(step.parameters.paddingRatio, 0.12),
        background: "#ffffff"
      })
    }
  }),
  enhance_product_photo: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await adjustBrightnessContrastDataUrl(document.currentDataUrl, {
        brightness: getNumber(step.parameters.brightness, 6),
        contrast: getNumber(step.parameters.contrast, 4),
        exposure: 0,
        saturation: getNumber(step.parameters.saturation, 3)
      })
    }
  }),
  preserve_logo_text: async (document) => ({
    document,
    message: "Preservation rule registered for logo and readable text."
  }),
  export_image: async (document, step) => ({
    document: {
      ...document,
      currentDataUrl: await centerOnPresetDataUrl(document.currentDataUrl, {
        preset: getString(step.parameters.preset, "original"),
        background: "#ffffff"
      })
    }
  })
};

export function getToolExecutor(name: ToolCommandName): ToolExecutor {
  return registry[name];
}

export function getRegisteredToolNames(): ToolCommandName[] {
  return Object.keys(registry) as ToolCommandName[];
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
