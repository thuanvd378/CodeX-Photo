import type { EditPlan } from "../agent/edit-plan-schema";
import type { SettingsSaveRequest, SettingsView } from "./settings";

export type ApiErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "RATE_LIMIT"
  | "UNSUPPORTED_MODEL"
  | "MODERATION_BLOCKED"
  | "REQUEST_TOO_LARGE"
  | "NETWORK_FAILURE"
  | "VALIDATION_ERROR"
  | "UNKNOWN_API_FAILURE";

export interface AppError {
  code: ApiErrorCode;
  message: string;
  detail?: string;
}

export type ApiResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: AppError;
    };

export interface PlanEditRequest {
  instruction: string;
  imageMeta?: {
    width: number;
    height: number;
    fileName?: string;
  };
}

export interface PlanEditResponse {
  plan: EditPlan;
  mode: "api" | "demo";
  notice?: string;
}

export interface CodexPhotoApi {
  getSettings: () => Promise<ApiResult<SettingsView>>;
  saveSettings: (request: SettingsSaveRequest) => Promise<ApiResult<SettingsView>>;
  clearApiKey: () => Promise<ApiResult<SettingsView>>;
  planEdit: (request: PlanEditRequest) => Promise<ApiResult<PlanEditResponse>>;
  getAppInfo: () => Promise<{ version: string; platform: string }>;
}
