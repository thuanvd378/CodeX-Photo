import { describe, expect, it } from "vitest";
import { EditPlanSchema, isSupportedToolName } from "../src/agent/edit-plan-schema";

describe("EditPlanSchema", () => {
  it("accepts supported commands", () => {
    const plan = EditPlanSchema.parse({
      intent: "marketplace_product_photo",
      target: "uploaded_image",
      preserve: ["product_shape", "logo", "text"],
      steps: [
        { tool: "segment_subject", target: "main_product" },
        { tool: "replace_background", target: "background", parameters: { background: "clean_white" } }
      ],
      export_preset: "shopee_square",
      risk_warnings: [],
      explanation_vi: "Giu nguyen san pham va thay nen trang."
    });

    expect(plan.steps[0].parameters).toEqual({});
    expect(isSupportedToolName("sharpen")).toBe(true);
  });

  it("rejects unknown commands", () => {
    expect(() =>
      EditPlanSchema.parse({
        intent: "bad",
        steps: [{ tool: "magic_button" }],
        explanation_vi: "Khong hop le."
      })
    ).toThrow();
  });

  it("normalizes common AI schema variants before validation", () => {
    const plan = EditPlanSchema.parse({
      intent: "marketplace_product_photo",
      target: "uploaded_image",
      preserve: ["product identity", "brand labels", "realistic shadows"],
      steps: [{ tool: "adjust lighting", parameters: { brightness: 8 } }],
      export_preset: "Shopee 1:1",
      risk_warnings: [],
      explanation_vi: "Tang sang va giu nguyen nhan dien san pham."
    });

    expect(plan.preserve).toEqual(["product_identity", "brand_labels", "realistic_shadows"]);
    expect(plan.steps[0].tool).toBe("enhance_product_photo");
    expect(plan.export_preset).toBe("shopee_square");
    expect(isSupportedToolName("adjust lighting")).toBe(true);
  });
});
