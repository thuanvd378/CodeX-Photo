import { z } from "zod";

export const ToolCommandNames = [
  "load_image",
  "segment_subject",
  "detect_background",
  "create_mask",
  "refine_mask",
  "replace_background",
  "remove_object",
  "recolor_region",
  "adjust_brightness",
  "adjust_contrast",
  "adjust_exposure",
  "adjust_saturation",
  "adjust_temperature",
  "sharpen",
  "blur_background",
  "denoise",
  "crop",
  "resize",
  "rotate",
  "add_padding",
  "center_product",
  "enhance_product_photo",
  "preserve_logo_text",
  "export_image"
] as const;

export type ToolCommandNameValue = (typeof ToolCommandNames)[number];

const PreserveRuleValues = [
  "product_identity",
  "product_shape",
  "logo",
  "texture",
  "text",
  "proportions",
  "lighting",
  "geometry",
  "brand_labels",
  "realistic_shadows"
] as const;

const ExportPresetValues = ["shopee_square", "tiktok_shop", "story_reels", "original"] as const;

type PreserveRuleValue = (typeof PreserveRuleValues)[number];
type ExportPresetValue = (typeof ExportPresetValues)[number];

const TOOL_ALIASES: Record<string, ToolCommandNameValue> = {
  adjust_lighting: "enhance_product_photo",
  lighting_adjustment: "enhance_product_photo",
  background_removal: "replace_background",
  remove_background: "replace_background",
  background_replacement: "replace_background",
  color_correction: "enhance_product_photo",
  preserve_text_logo: "preserve_logo_text"
};

const PRESERVE_ALIASES: Record<string, PreserveRuleValue> = {
  identity: "product_identity",
  product: "product_identity",
  product_identity: "product_identity",
  product_shape: "product_shape",
  shape: "product_shape",
  logo: "logo",
  texture: "texture",
  text: "text",
  readable_text: "text",
  proportions: "proportions",
  proportion: "proportions",
  lighting: "lighting",
  geometry: "geometry",
  brand: "brand_labels",
  brand_label: "brand_labels",
  brand_labels: "brand_labels",
  realistic_shadow: "realistic_shadows",
  realistic_shadows: "realistic_shadows",
  shadows: "realistic_shadows"
};

const EXPORT_PRESET_ALIASES: Record<string, ExportPresetValue> = {
  shopee: "shopee_square",
  shopee_1_1: "shopee_square",
  shopee_square: "shopee_square",
  marketplace_square: "shopee_square",
  tiktok: "tiktok_shop",
  tiktok_shop: "tiktok_shop",
  story: "story_reels",
  reels: "story_reels",
  story_reels: "story_reels",
  original_ratio: "original",
  original: "original"
};

const PLAN_KEY_ALIASES: Record<string, string> = {
  target_image: "target",
  preserve_rules: "preserve",
  preserve_rule: "preserve",
  preserveitems: "preserve",
  exportpreset: "export_preset",
  exportpresetname: "export_preset",
  risk_warning: "risk_warnings",
  warnings: "risk_warnings",
  risk_warnings: "risk_warnings",
  riskWarnings: "risk_warnings",
  explanation: "explanation_vi",
  explanation_vn: "explanation_vi",
  explanationvi: "explanation_vi"
};

const EDIT_STEP_KEY_ALIASES: Record<string, string> = {
  action: "tool",
  name: "tool",
  command: "tool",
  type: "tool",
  params: "parameters",
  arguments: "parameters",
  target_area: "target",
  on: "target",
  region: "target",
  input: "target"
};

export const ToolCommandNameSchema = z.preprocess(
  (value) => normalizeToolName(value),
  z.enum(ToolCommandNames)
);

export const PreserveRuleSchema = z.preprocess(
  (value) => normalizePreserveRule(value),
  z.enum(PreserveRuleValues)
);

export const ExportPresetSchema = z.preprocess(
  (value) => normalizeExportPresetName(value),
  z.enum(ExportPresetValues)
);

export const EditStepSchema = z.object({
  tool: ToolCommandNameSchema,
  target: z.string().optional(),
  parameters: z.record(z.unknown()).default({})
});

export const EditPlanSchema = z.object({
  intent: z.string().min(1),
  target: z.string().default("uploaded_image"),
  preserve: z.array(PreserveRuleSchema).default([
    "product_identity",
    "product_shape",
    "logo",
    "texture",
    "text",
    "proportions"
  ]),
  steps: z.array(EditStepSchema).min(1),
  export_preset: ExportPresetSchema.default("original"),
  risk_warnings: z.array(z.string()).default([]),
  explanation_vi: z.string().min(1)
});

const NormalizedEditPlanSchema = z.preprocess(
  (value) => normalizeEditPlan(value),
  EditPlanSchema
);

export type ToolCommandName = z.infer<typeof ToolCommandNameSchema>;
export type PreserveRule = z.infer<typeof PreserveRuleSchema>;
export type ExportPresetName = z.infer<typeof ExportPresetSchema>;
export type EditStep = z.infer<typeof EditStepSchema>;
export type EditPlan = z.infer<typeof EditPlanSchema>;

export function parseEditPlan(value: unknown): EditPlan {
  return NormalizedEditPlanSchema.parse(value);
}

export function isSupportedToolName(value: string): boolean {
  const normalized = normalizeToolName(value);
  return typeof normalized === "string" && (ToolCommandNames as readonly string[]).includes(normalized);
}

function normalizeToolName(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = normalizeIdentifier(value);
  return TOOL_ALIASES[normalized] ?? normalized;
}

function normalizePreserveRule(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = normalizeIdentifier(value);
  return PRESERVE_ALIASES[normalized] ?? normalized;
}

function normalizeExportPresetName(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = normalizeIdentifier(value);
  return EXPORT_PRESET_ALIASES[normalized] ?? normalized;
}

function normalizeIdentifier(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeEditPlan(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const input = { ...value };
  const normalized = applyKeyAliases({ ...input }, PLAN_KEY_ALIASES);

  const rawPreserve = normalized.preserve;
  const rawRiskWarnings = normalized.risk_warnings;

  if (typeof rawPreserve === "string") {
    normalized.preserve = rawPreserve
      .split(/[;,\n]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const normalizedValue = normalizePreserveRule(item);
        return typeof normalizedValue === "string" ? normalizedValue : item;
      });
  } else if (Array.isArray(rawPreserve)) {
    normalized.preserve = rawPreserve.map((item) => {
      const value = normalizePreserveRule(item);
      return typeof value === "string" ? value : item;
    });
  }

  if (typeof rawRiskWarnings === "string") {
    normalized.risk_warnings = rawRiskWarnings
      .split(/[;,\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  } else if (Array.isArray(rawRiskWarnings)) {
    normalized.risk_warnings = rawRiskWarnings.map((item) => (typeof item === "string" ? item : String(item))).filter(Boolean);
  }

  if (Array.isArray(normalized.steps)) {
    normalized.steps = normalized.steps.map((step) => normalizeEditStep(step));
  }

  return normalized;
}

function normalizeEditStep(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const normalized = applyKeyAliases({ ...value }, EDIT_STEP_KEY_ALIASES);
  if (normalized.tool === undefined && typeof normalized.name === "string") {
    normalized.tool = normalized.name;
  }

  return normalized;
}

function applyKeyAliases<T extends Record<string, unknown>>(input: T, aliases: Record<string, string>): T {
  const output = { ...input } as Record<string, unknown>;
  const byNormalized = new Map<string, string>();

  for (const key of Object.keys(output)) {
    byNormalized.set(normalizeIdentifier(key), key);
  }

  for (const [alias, canonical] of Object.entries(aliases)) {
    const normalizedAlias = normalizeIdentifier(alias);
    const sourceKey = alias in output ? alias : byNormalized.get(normalizedAlias);
    if (!sourceKey) continue;
    if (output[canonical] === undefined) {
      output[canonical] = output[sourceKey];
    }
    if (sourceKey !== canonical) {
      delete output[sourceKey];
    }
  }

  return output as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
