import { app, ipcMain } from "electron";
import { createLocalEditPlan, planWithApi } from "../src/agent/prompt-planner";
import { createAppError } from "../src/lib/errors";
import { PlanEditRequestSchema, SettingsSaveRequestSchema } from "../src/lib/validators";
import type { ApiResult, PlanEditResponse } from "../src/types/api";
import type { SettingsView } from "../src/types/settings";
import { clearApiKey, getApiKey, loadSettingsView, saveSettings } from "./secure-store";
import { VI_DEMO_NOTICE } from "../src/lib/constants";

export function registerIpcHandlers(): void {
  ipcMain.handle("settings:get", async (): Promise<ApiResult<SettingsView>> => {
    try {
      return { ok: true, data: await loadSettingsView() };
    } catch (error) {
      return { ok: false, error: createAppError("UNKNOWN_API_FAILURE", "Khong the doc cai dat.", readError(error)) };
    }
  });

  ipcMain.handle("settings:save", async (_event, raw): Promise<ApiResult<SettingsView>> => {
    const parsed = SettingsSaveRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: createAppError("VALIDATION_ERROR", "Cai dat khong hop le.", parsed.error.message)
      };
    }

    try {
      return { ok: true, data: await saveSettings(parsed.data) };
    } catch (error) {
      return { ok: false, error: createAppError("UNKNOWN_API_FAILURE", "Khong the luu cai dat.", readError(error)) };
    }
  });

  ipcMain.handle("settings:clearApiKey", async (): Promise<ApiResult<SettingsView>> => {
    try {
      return { ok: true, data: await clearApiKey() };
    } catch (error) {
      return { ok: false, error: createAppError("UNKNOWN_API_FAILURE", "Khong the xoa API key.", readError(error)) };
    }
  });

  ipcMain.handle("planner:planEdit", async (_event, raw): Promise<ApiResult<PlanEditResponse>> => {
    const parsed = PlanEditRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: createAppError("VALIDATION_ERROR", "Prompt hoac thong tin anh khong hop le.", parsed.error.message)
      };
    }

    const settings = await loadSettingsView();
    const apiKey = await getApiKey();

    if (settings.demoMode || !apiKey) {
      return {
        ok: true,
        data: {
          plan: createLocalEditPlan(parsed.data),
          mode: "demo",
          notice: VI_DEMO_NOTICE
        }
      };
    }

    const planned = await planWithApi({ apiKey, settings, request: parsed.data });
    if (!planned.ok) {
      return planned;
    }

    return {
      ok: true,
      data: {
        plan: planned.data,
        mode: "api"
      }
    };
  });

  ipcMain.handle("app:info", async () => ({
    version: app.getVersion(),
    platform: process.platform
  }));
}

function readError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
