import type { CodexPhotoApi } from "./api";

declare global {
  interface Window {
    codexPhoto?: CodexPhotoApi;
  }
}

export {};
