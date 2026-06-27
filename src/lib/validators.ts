import { z } from "zod";
import { DEFAULT_MODEL } from "./constants";

export const SettingsSaveRequestSchema = z.object({
  provider: z.enum(["openai", "openai-compatible", "custom"]),
  model: z.string().trim().min(1).default(DEFAULT_MODEL),
  theme: z.enum(["light", "dark", "system"]),
  accentColor: z.enum(["emerald", "blue", "violet", "rose"]),
  demoMode: z.boolean(),
  apiKey: z.string().optional()
});

export const PlanEditRequestSchema = z.object({
  instruction: z.string().trim().min(2).max(4000),
  imageMeta: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      fileName: z.string().optional()
    })
    .optional()
});

export const UploadFileSchema = z.object({
  name: z.string().min(1),
  type: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/i, "Only PNG, JPG, and WebP are supported."),
  size: z.number().positive().max(25 * 1024 * 1024, "Images larger than 25MB are not supported in the prototype.")
});

export function validatePrompt(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return "Nhap mo ta chinh sua truoc khi tao anh.";
  }

  if (trimmed.length > 4000) {
    return "Prompt qua dai cho prototype nay.";
  }

  return null;
}
