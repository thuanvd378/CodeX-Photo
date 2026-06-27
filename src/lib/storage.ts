export function readJsonFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonToLocalStorage<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}
