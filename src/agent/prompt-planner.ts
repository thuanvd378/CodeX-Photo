import { EditPlanSchema, parseEditPlan, type EditPlan, type EditStep } from "./edit-plan-schema";
import { compilePromptForImageModel, createPlannerSystemPrompt } from "./prompt-compiler";
import { classifyHttpError, createAppError, normalizeUnknownError } from "../lib/errors";
import type { ApiResult, PlanEditRequest } from "../types/api";
import type { SettingsView } from "../types/settings";

interface ApiPlannerOptions {
  apiKey: string;
  settings: SettingsView;
  request: PlanEditRequest;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

const DEFAULT_PRESERVE: EditPlan["preserve"] = [
  "product_identity",
  "product_shape",
  "logo",
  "texture",
  "text",
  "proportions",
  "realistic_shadows"
];

export function createLocalEditPlan(request: PlanEditRequest): EditPlan {
  const instruction = request.instruction.toLowerCase();
  const steps: EditStep[] = [
    {
      tool: "load_image",
      target: "uploaded_image",
      parameters: {}
    },
    {
      tool: "preserve_logo_text",
      target: "main_product",
      parameters: { strict: true }
    }
  ];

  let intent = "general_photo_edit";
  let exportPreset: EditPlan["export_preset"] = "original";
  const warnings = [
    "Che do demo chi dung xu ly Canvas cuc bo; khong co nhan dien vat the hay inpainting that."
  ];

  if (containsAny(instruction, ["nền trắng", "nen trang", "white background", "shopee", "marketplace"])) {
    intent = "marketplace_product_photo";
    steps.push(
      { tool: "detect_background", target: "background", parameters: {} },
      { tool: "replace_background", target: "background", parameters: { background: "clean_white" } },
      { tool: "center_product", target: "main_product", parameters: { paddingRatio: 0.12 } }
    );
    exportPreset = "shopee_square";
  }

  if (containsAny(instruction, ["làm sáng", "sáng hơn", "lam sang", "bright", "brighter", "exposure"])) {
    steps.push(
      { tool: "adjust_brightness", target: "image", parameters: { amount: 12 } },
      { tool: "adjust_contrast", target: "image", parameters: { amount: 7 } },
      { tool: "adjust_exposure", target: "image", parameters: { amount: 4 } }
    );
  }

  if (containsAny(instruction, ["bão hòa", "bao hoa", "saturation", "màu rực", "mau ruc"])) {
    steps.push({ tool: "adjust_saturation", target: "image", parameters: { amount: 8 } });
  }

  if (containsAny(instruction, ["sắc nét", "sac net", "sharpen", "net hon", "nét hơn"])) {
    steps.push({ tool: "sharpen", target: "image", parameters: { amount: 0.32 } });
  }

  if (containsAny(instruction, ["blur", "mờ nền", "mo nen", "xóa phông", "xoa phong"])) {
    steps.push({ tool: "blur_background", target: "background", parameters: { radius: 4 } });
  }

  if (containsAny(instruction, ["xóa", "xoa", "remove", "erase"])) {
    steps.push({ tool: "remove_object", target: "requested_region", parameters: { mode: "demo_soft_fill" } });
    warnings.push("Xoa vat the trong demo chi lam mo/vet phu nhe vi chua co mat na chon vung.");
  }

  if (containsAny(instruction, ["đổi màu", "doi mau", "change color", "recolor"])) {
    steps.push({ tool: "recolor_region", target: "requested_region", parameters: { tint: "#f4f1e8", strength: 0.18 } });
    warnings.push("Doi mau trong demo la lop phu mau nhe, khong thay the vat lieu bang AI.");
  }

  if (containsAny(instruction, ["tiktok"])) {
    exportPreset = "tiktok_shop";
  }

  if (containsAny(instruction, ["story", "reels", "9:16"])) {
    exportPreset = "story_reels";
  }

  if (exportPreset !== "original") {
    steps.push({ tool: "export_image", target: "image", parameters: { preset: exportPreset } });
  }

  if (steps.length <= 2) {
    steps.push(
      { tool: "enhance_product_photo", target: "image", parameters: { brightness: 6, contrast: 4, saturation: 3 } },
      { tool: "sharpen", target: "image", parameters: { amount: 0.18 } }
    );
  }

  return EditPlanSchema.parse({
    intent,
    target: "uploaded_image",
    preserve: DEFAULT_PRESERVE,
    steps,
    export_preset: exportPreset,
    risk_warnings: warnings,
    explanation_vi:
      "CodeX Photo da tao ke hoach chinh sua cuc bo dua tren tu khoa trong prompt. Cac buoc uu tien giu logo, chu, hinh dang va ty le san pham."
  });
}

export async function planWithApi(options: ApiPlannerOptions): Promise<ApiResult<EditPlan>> {
  try {
    const compiledPrompt = compilePromptForImageModel({
      userInstruction: options.request.instruction,
      imageWidth: options.request.imageMeta?.width,
      imageHeight: options.request.imageMeta?.height,
      fileName: options.request.imageMeta?.fileName
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: options.settings.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: createPlannerSystemPrompt() },
          { role: "user", content: compiledPrompt }
        ]
      })
    });

    if (!response.ok) {
      return { ok: false, error: classifyHttpError(response.status, await response.text()) };
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, error: createAppError("UNKNOWN_API_FAILURE", "API khong tra ve noi dung ke hoach.") };
    }

    const json = JSON.parse(extractJsonObject(content)) as unknown;
    let parsed: EditPlan;
    try {
      parsed = parseEditPlan(json);
    } catch (error) {
      const parsedMessage = error instanceof Error ? error.message : "Schema validation failed.";
      return {
        ok: false,
        error: createAppError("VALIDATION_ERROR", "Ke hoach AI tra ve khong dung schema.", parsedMessage)
      };
    }

    return { ok: true, data: parsed };
  } catch (error) {
    return { ok: false, error: normalizeUnknownError(error) };
  }
}

function containsAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function extractJsonObject(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new Error("No JSON object found in planner response.");
}
