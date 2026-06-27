export type ApiProvider = "openai" | "openai-compatible" | "custom";

export type ThemeMode = "light" | "dark" | "system";

export type AccentColor = "emerald" | "blue" | "violet" | "rose";

export interface SettingsView {
  provider: ApiProvider;
  model: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  demoMode: boolean;
  hasApiKey: boolean;
  apiKeyStatus: "missing" | "configured";
}

export interface SettingsSaveRequest {
  provider: ApiProvider;
  model: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  demoMode: boolean;
  apiKey?: string;
}

export interface StoredSettings {
  provider: ApiProvider;
  model: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  demoMode: boolean;
  encryptedApiKey?: string;
  apiKeyEncoding?: "safeStorage" | "plain";
}
