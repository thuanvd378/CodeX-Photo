import type { AccentColor, SettingsView, StoredSettings } from "../types/settings";

export const APP_NAME = "CodeX Photo";

export const DEFAULT_MODEL = "gpt-4o-mini";

export const DEFAULT_SETTINGS: StoredSettings = {
  provider: "openai",
  model: DEFAULT_MODEL,
  theme: "system",
  accentColor: "emerald",
  demoMode: true
};

export const DEFAULT_SETTINGS_VIEW: SettingsView = {
  provider: DEFAULT_SETTINGS.provider,
  model: DEFAULT_SETTINGS.model,
  theme: DEFAULT_SETTINGS.theme,
  accentColor: DEFAULT_SETTINGS.accentColor,
  demoMode: DEFAULT_SETTINGS.demoMode,
  hasApiKey: false,
  apiKeyStatus: "missing"
};

export type ExportPresetId = "shopee_square" | "tiktok_shop" | "story_reels" | "original";

export interface ExportPreset {
  id: ExportPresetId;
  label: string;
  width?: number;
  height?: number;
  background: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  { id: "shopee_square", label: "Shopee 1:1 - 1024x1024", width: 1024, height: 1024, background: "#ffffff" },
  { id: "tiktok_shop", label: "TikTok Shop 4:5 - 1080x1350", width: 1080, height: 1350, background: "#ffffff" },
  { id: "story_reels", label: "Story/Reels 9:16 - 1080x1920", width: 1080, height: 1920, background: "#ffffff" },
  { id: "original", label: "Original ratio", background: "#ffffff" }
];

export const ACCENT_CLASS_MAP: Record<AccentColor, string> = {
  emerald: "theme-emerald",
  blue: "theme-blue",
  violet: "theme-violet",
  rose: "theme-rose"
};

export const DEMO_NOTICE = "Demo mode - chinh sua mo phong cuc bo, khong phai ket qua AI";

export const VI_DEMO_NOTICE = "Demo mode — chỉnh sửa mô phỏng cục bộ, không phải kết quả AI";
