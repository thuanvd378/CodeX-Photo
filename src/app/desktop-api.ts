import { createLocalEditPlan } from "../agent/prompt-planner";
import { DEFAULT_SETTINGS_VIEW, VI_DEMO_NOTICE } from "../lib/constants";
import type { ApiResult, CodexPhotoApi, PlanEditRequest, PlanEditResponse } from "../types/api";
import type { SettingsSaveRequest, SettingsView } from "../types/settings";

let browserPreviewSettings: SettingsView = DEFAULT_SETTINGS_VIEW;

const browserPreviewApi: CodexPhotoApi = {
  getSettings: async () => ok(browserPreviewSettings),
  saveSettings: async (request: SettingsSaveRequest) => {
    browserPreviewSettings = {
      provider: request.provider,
      model: request.model,
      theme: request.theme,
      accentColor: request.accentColor,
      demoMode: request.demoMode,
      hasApiKey: Boolean(request.apiKey?.trim()) || browserPreviewSettings.hasApiKey,
      apiKeyStatus: Boolean(request.apiKey?.trim()) || browserPreviewSettings.hasApiKey ? "configured" : "missing"
    };
    return ok(browserPreviewSettings);
  },
  clearApiKey: async () => {
    browserPreviewSettings = {
      ...browserPreviewSettings,
      hasApiKey: false,
      apiKeyStatus: "missing"
    };
    return ok(browserPreviewSettings);
  },
  planEdit: async (request: PlanEditRequest): Promise<ApiResult<PlanEditResponse>> =>
    ok({ plan: createLocalEditPlan(request), mode: "demo", notice: VI_DEMO_NOTICE }),
  getAppInfo: async () => ({ version: "browser-preview", platform: navigator.platform })
};

export function getDesktopApi(): CodexPhotoApi {
  return window.codexPhoto ?? browserPreviewApi;
}

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}
