import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "electron/main.ts",
  "electron/preload.ts",
  "electron/ipc.ts",
  "electron/secure-store.ts",
  "RUN_CODEX_PHOTO.cmd",
  "scripts/run-codex-photo.ps1",
  "src/agent/prompt-planner.ts",
  "src/agent/edit-plan-schema.ts",
  "src/agent/tool-registry.ts",
  "src/agent/execute-edit-plan.ts",
  "src/agent/prompt-compiler.ts",
  "src/image/image-document.ts",
  "src/image/layers.ts",
  "src/image/masks.ts",
  "src/image/local-tools.ts",
  "src/image/canvas-renderer.ts",
  "src/image/exporter.ts",
  "src/image/mock-edit.ts",
  "src/components/layout/SettingsDialog.tsx",
  "docs/demo-script.md",
  "docs/architecture.md",
  "docs/ai-agent-flow.md",
  "docs/product-notes.md",
  "README.md",
  "AGENTS.md",
  "SELF_REPAIR_LOG.md"
];

const missing = requiredFiles.filter((file) => !existsSync(path.join(root, file)));
if (missing.length > 0) {
  fail(`Missing required files:\n${missing.join("\n")}`);
}

const sourceFiles = requiredFiles
  .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".md"))
  .map((file) => [file, readFileSync(path.join(root, file), "utf8")]);

const placeholderHits = sourceFiles.filter(([, content]) =>
  /TODO:\s*implement|throw new Error\(["']not implemented|coming soon placeholder/i.test(content)
);
if (placeholderHits.length > 0) {
  fail(`Found obvious placeholder text in:\n${placeholderHits.map(([file]) => file).join("\n")}`);
}

assertContains("electron/secure-store.ts", ["safeStorage", "loadSettingsView", "getApiKey"]);
assertContains("src/agent/edit-plan-schema.ts", ["ToolCommandNames", "EditPlanSchema", "replace_background"]);
assertContains("src/agent/prompt-compiler.ts", ["Preserve product identity", "Vietnamese online sellers"]);
assertContains("src/image/mock-edit.ts", ["runLocalMockEdit", "createLocalEditPlan"]);
assertContains("src/components/layout/SettingsDialog.tsx", ["API key đã được thiết lập", "Ảnh chỉ được gửi tới AI"]);

console.log("Smoke check passed.");

function assertContains(file, needles) {
  const content = readFileSync(path.join(root, file), "utf8");
  const misses = needles.filter((needle) => !content.includes(needle));
  if (misses.length > 0) {
    fail(`${file} is missing expected smoke markers: ${misses.join(", ")}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
