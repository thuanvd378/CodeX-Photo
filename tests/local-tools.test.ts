import { describe, expect, it } from "vitest";
import { applyLinearAdjustmentsToPixels, clampByte } from "../src/image/local-tools";

describe("local tools", () => {
  it("clamps byte values", () => {
    expect(clampByte(-10)).toBe(0);
    expect(clampByte(260)).toBe(255);
    expect(clampByte(128.2)).toBe(128);
  });

  it("applies brightness without changing alpha", () => {
    const pixels = new Uint8ClampedArray([100, 110, 120, 200]);
    const adjusted = applyLinearAdjustmentsToPixels(pixels, { brightness: 10 });

    expect(adjusted[0]).toBeGreaterThan(100);
    expect(adjusted[1]).toBeGreaterThan(110);
    expect(adjusted[2]).toBeGreaterThan(120);
    expect(adjusted[3]).toBe(200);
  });
});
