export interface PromptCompileContext {
  userInstruction: string;
  imageWidth?: number;
  imageHeight?: number;
  fileName?: string;
}

export function compilePromptForImageModel(context: PromptCompileContext): string {
  const imageContext =
    context.imageWidth && context.imageHeight
      ? `Image context: ${context.imageWidth}x${context.imageHeight}${context.fileName ? `, file ${context.fileName}` : ""}.`
      : "Image context: one uploaded product or commercial photo.";

  return [
    "User request:",
    context.userInstruction.trim(),
    "",
    imageContext,
    "",
    "Editing rules:",
    "Preserve product identity, shape, geometry, logo, texture, readable text, proportions, and lighting unless explicitly asked otherwise.",
    "If editing background, keep the product unchanged.",
    "If editing color, preserve material and realistic shadows.",
    "If removing objects, keep the surrounding area natural.",
    "Make the output commercially usable for Vietnamese online sellers.",
    "Avoid unrealistic elements.",
    "Avoid changing brand labels/text unless explicitly requested."
  ].join("\n");
}

export function createPlannerSystemPrompt(): string {
  return [
    "You are the CodeX Photo planning agent.",
    "Convert Vietnamese or English photo-editing instructions into a structured JSON edit plan.",
    "The plan must be readable before execution and must call only supported internal tools.",
    "Do not claim that a generative edit happened. Only create the plan.",
    "Return JSON only, with exact keys: intent, target, preserve, steps, export_preset, risk_warnings, explanation_vi.",
    "Each step must contain tool, optional target, and parameters.",
    "Use Vietnamese for explanation_vi and risk_warnings.",
    "Allowed tool names: load_image, segment_subject, detect_background, create_mask, refine_mask, replace_background, remove_object, recolor_region, adjust_brightness, adjust_contrast, adjust_exposure, adjust_saturation, adjust_temperature, sharpen, blur_background, denoise, crop, resize, rotate, add_padding, center_product, enhance_product_photo, preserve_logo_text, export_image.",
    "Allowed preserve values: product_identity, product_shape, logo, texture, text, proportions, lighting, geometry, brand_labels, realistic_shadows.",
    "Allowed export_preset values: shopee_square, tiktok_shop, story_reels, original."
  ].join("\n");
}
