# AI Agent Flow

## Prompt To Plan

The user enters Vietnamese or English instructions. The main process compiles the request with preservation rules:

- Preserve identity, shape, geometry, logo, texture, readable text, proportions, and lighting.
- Keep the product unchanged when editing background.
- Preserve material and realistic shadows when editing color.
- Keep object-removal surroundings natural.
- Make output commercially usable for Vietnamese online sellers.

The planner returns JSON validated by `EditPlanSchema`.

## Example Plan

```json
{
  "intent": "marketplace_product_photo",
  "target": "uploaded_image",
  "preserve": ["product_identity", "product_shape", "logo", "texture", "text", "proportions"],
  "steps": [
    { "tool": "load_image", "target": "uploaded_image", "parameters": {} },
    { "tool": "segment_subject", "target": "main_product", "parameters": {} },
    { "tool": "replace_background", "target": "background", "parameters": { "background": "clean_white" } },
    { "tool": "adjust_brightness", "target": "image", "parameters": { "amount": 8 } },
    { "tool": "sharpen", "target": "image", "parameters": { "amount": 0.35 } },
    { "tool": "export_image", "target": "image", "parameters": { "preset": "shopee_square" } }
  ],
  "export_preset": "shopee_square",
  "risk_warnings": [],
  "explanation_vi": "Kế hoạch thay nền trắng, tăng sáng và giữ nguyên logo, chữ, hình dáng sản phẩm."
}
```

## Tool Registry

`tool-registry.ts` maps every supported command name to a local executor or a clear local-demo message. Advanced tools such as semantic segmentation and full inpainting are represented in the registry, but demo mode reports that they are not fully available instead of pretending.

## Error Handling

Planner errors are normalized into typed codes:

- Missing API key.
- Invalid key.
- Rate limit.
- Unsupported model.
- Moderation blocked.
- Request too large.
- Network failure.
- Unknown API failure.

The renderer displays designed error toasts and never crashes the app.
