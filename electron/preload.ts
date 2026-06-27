import { contextBridge, ipcRenderer } from "electron";
import type { CodexPhotoApi, PlanEditRequest } from "../src/types/api";
import type { SettingsSaveRequest } from "../src/types/settings";

const api: CodexPhotoApi = {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (request: SettingsSaveRequest) => ipcRenderer.invoke("settings:save", request),
  clearApiKey: () => ipcRenderer.invoke("settings:clearApiKey"),
  planEdit: (request: PlanEditRequest) => ipcRenderer.invoke("planner:planEdit", request),
  getAppInfo: () => ipcRenderer.invoke("app:info")
};

contextBridge.exposeInMainWorld("codexPhoto", api);
