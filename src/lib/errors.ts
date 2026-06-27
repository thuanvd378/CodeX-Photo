import type { ApiErrorCode, AppError } from "../types/api";

export function createAppError(code: ApiErrorCode, message: string, detail?: string): AppError {
  return { code, message, detail };
}

export function classifyHttpError(status: number, bodyText: string): AppError {
  const normalized = bodyText.toLowerCase();

  if (status === 401 || status === 403) {
    return createAppError("INVALID_API_KEY", "API key khong hop le hoac khong co quyen truy cap.", bodyText);
  }

  if (status === 429) {
    return createAppError("RATE_LIMIT", "API dang bi gioi han tan suat. Vui long thu lai sau.", bodyText);
  }

  if (status === 400 && normalized.includes("model")) {
    return createAppError("UNSUPPORTED_MODEL", "Model duoc chon khong duoc ho tro cho yeu cau nay.", bodyText);
  }

  if (status === 400 && (normalized.includes("moderation") || normalized.includes("safety"))) {
    return createAppError("MODERATION_BLOCKED", "Yeu cau bi chan boi bo loc an toan.", bodyText);
  }

  if (status === 413 || normalized.includes("too large")) {
    return createAppError("REQUEST_TOO_LARGE", "Anh hoac yeu cau qua lon de xu ly.", bodyText);
  }

  return createAppError("UNKNOWN_API_FAILURE", "API tra ve loi khong xac dinh.", bodyText);
}

export function normalizeUnknownError(error: unknown): AppError {
  if (error instanceof TypeError) {
    return createAppError("NETWORK_FAILURE", "Khong the ket noi toi API. Kiem tra mang va thu lai.", error.message);
  }

  if (error instanceof Error) {
    return createAppError("UNKNOWN_API_FAILURE", error.message);
  }

  return createAppError("UNKNOWN_API_FAILURE", "Da xay ra loi khong xac dinh.");
}
