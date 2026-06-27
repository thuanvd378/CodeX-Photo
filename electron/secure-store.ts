import { app, safeStorage } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS } from "../src/lib/constants";
import type { SettingsSaveRequest, SettingsView, StoredSettings } from "../src/types/settings";

const STORE_FILE = "codex-photo-settings.json";

export async function loadSettingsView(): Promise<SettingsView> {
  const stored = await readStoredSettings();
  const hasApiKey = Boolean(stored.encryptedApiKey);
  return {
    provider: stored.provider,
    model: stored.model,
    theme: stored.theme,
    accentColor: stored.accentColor,
    demoMode: stored.demoMode,
    hasApiKey,
    apiKeyStatus: hasApiKey ? "configured" : "missing"
  };
}

export async function saveSettings(request: SettingsSaveRequest): Promise<SettingsView> {
  const current = await readStoredSettings();
  const next: StoredSettings = {
    ...current,
    provider: request.provider,
    model: request.model.trim() || DEFAULT_SETTINGS.model,
    theme: request.theme,
    accentColor: request.accentColor,
    demoMode: request.demoMode
  };

  const apiKey = request.apiKey?.trim();
  if (apiKey) {
    const encrypted = encryptApiKey(apiKey);
    next.encryptedApiKey = encrypted.value;
    next.apiKeyEncoding = encrypted.encoding;
  }

  await writeStoredSettings(next);
  return loadSettingsView();
}

export async function clearApiKey(): Promise<SettingsView> {
  const current = await readStoredSettings();
  const next: StoredSettings = { ...current };
  delete next.encryptedApiKey;
  delete next.apiKeyEncoding;
  await writeStoredSettings(next);
  return loadSettingsView();
}

export async function getApiKey(): Promise<string | null> {
  const stored = await readStoredSettings();
  if (!stored.encryptedApiKey) {
    return null;
  }

  try {
    if (stored.apiKeyEncoding === "safeStorage" && safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(stored.encryptedApiKey, "base64"));
    }

    if (stored.apiKeyEncoding === "plain") {
      return Buffer.from(stored.encryptedApiKey, "base64").toString("utf8");
    }
  } catch {
    return null;
  }

  return null;
}

async function readStoredSettings(): Promise<StoredSettings> {
  try {
    const raw = await fs.readFile(settingsPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    return normalizeStoredSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function writeStoredSettings(settings: StoredSettings): Promise<void> {
  await fs.mkdir(path.dirname(settingsPath()), { recursive: true });
  await fs.writeFile(settingsPath(), JSON.stringify(settings, null, 2), "utf8");
}

function settingsPath(): string {
  return path.join(app.getPath("userData"), STORE_FILE);
}

function encryptApiKey(apiKey: string): { value: string; encoding: StoredSettings["apiKeyEncoding"] } {
  if (safeStorage.isEncryptionAvailable()) {
    return {
      value: safeStorage.encryptString(apiKey).toString("base64"),
      encoding: "safeStorage"
    };
  }

  return {
    value: Buffer.from(apiKey, "utf8").toString("base64"),
    encoding: "plain"
  };
}

function normalizeStoredSettings(input: Partial<StoredSettings>): StoredSettings {
  return {
    ...DEFAULT_SETTINGS,
    provider: input.provider ?? DEFAULT_SETTINGS.provider,
    model: input.model ?? DEFAULT_SETTINGS.model,
    theme: input.theme ?? DEFAULT_SETTINGS.theme,
    accentColor: input.accentColor ?? DEFAULT_SETTINGS.accentColor,
    demoMode: input.demoMode ?? DEFAULT_SETTINGS.demoMode,
    encryptedApiKey: input.encryptedApiKey,
    apiKeyEncoding: input.apiKeyEncoding
  };
}
