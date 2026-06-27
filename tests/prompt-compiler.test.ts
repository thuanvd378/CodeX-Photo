import { describe, expect, it } from "vitest";
import { compilePromptForImageModel } from "../src/agent/prompt-compiler";

describe("compilePromptForImageModel", () => {
  it("adds preservation and marketplace safety rules", () => {
    const compiled = compilePromptForImageModel({
      userInstruction: "Doi nen thanh trang",
      imageWidth: 1024,
      imageHeight: 768,
      fileName: "product.png"
    });

    expect(compiled).toContain("Preserve product identity");
    expect(compiled).toContain("keep the product unchanged");
    expect(compiled).toContain("Vietnamese online sellers");
    expect(compiled).toContain("Avoid changing brand labels/text");
    expect(compiled).toContain("1024x768");
  });
});
