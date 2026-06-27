import { describe, expect, it } from "vitest";
import { PlanEditRequestSchema, SettingsSaveRequestSchema, validatePrompt } from "../src/lib/validators";

describe("validators", () => {
  it("validates settings without exposing API key rules to renderer reads", () => {
    const parsed = SettingsSaveRequestSchema.parse({
      provider: "openai",
      model: "gpt-4o-mini",
      theme: "system",
      accentColor: "emerald",
      demoMode: true,
      apiKey: "sk-test"
    });

    expect(parsed.provider).toBe("openai");
  });

  it("rejects empty prompt requests", () => {
    expect(PlanEditRequestSchema.safeParse({ instruction: "" }).success).toBe(false);
    expect(validatePrompt("")).toBeTruthy();
  });
});
