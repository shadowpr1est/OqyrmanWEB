export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// ─── Locale ─────────────────────────────────────────────────────────────────

/**
 * Returns the user's current UI language (`kk` | `ru`) read directly from
 * localStorage so that this helper has no dependency on the i18n bundle and is
 * safe to call before i18n has finished initializing.
 */
function currentLanguage(): string {
  try {
    const raw = localStorage.getItem("oqyrman_lang");
    if (raw === "kk" || raw === "ru") return raw;
  } catch {
    /* ignore — SSR / privacy mode */
  }
  return "ru";
}

// ─── Token storage ──────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccess: () => localStorage.getItem("access_token"),
  getRefresh: () => localStorage.getItem("refresh_token"),
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
};

// ─── Error ──────────────────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export class ApiException extends Error {
  constructor(
    public readonly error: ApiError,
    public readonly status: number,
  ) {
    super(error.message || "Произошла ошибка");
    this.name = "ApiException";
  }
}

// ─── Token refresh ──────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

/** Listeners that get notified when the session is forcefully expired. */
const sessionExpiredListeners: Array<() => void> = [];

export function onSessionExpired(cb: () => void) {
  sessionExpiredListeners.push(cb);
  return () => {
    const idx = sessionExpiredListeners.indexOf(cb);
    if (idx >= 0) sessionExpiredListeners.splice(idx, 1);
  };
}

function notifySessionExpired() {
  tokenStorage.clear();
  sessionExpiredListeners.forEach((cb) => cb());
}

async function refreshTokens(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error("no_refresh_token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("refresh_failed");
  }

  const data = await res.json();
  tokenStorage.set(data.access_token, data.refresh_token);
  return data.access_token;
}

// ─── Core fetch ─────────────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": currentLanguage(),
    ...(options.headers as Record<string, string>),
  };

  const token = tokenStorage.getAccess();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshTokens();
        // Resolve all queued requests with the new token
        refreshQueue.forEach((q) => q.resolve(newToken));
        refreshQueue = [];
        isRefreshing = false;
        return apiFetch<T>(path, options, false);
      } catch {
        // Refresh failed — reject all queued requests and notify session expired
        const expiredError = new ApiException(
          { code: "unauthorized", message: "Сессия истекла. Войдите заново." },
          401,
        );
        refreshQueue.forEach((q) => q.reject(expiredError));
        refreshQueue = [];
        isRefreshing = false;
        notifySessionExpired();
        throw expiredError;
      }
    } else {
      // Another request is already refreshing — wait in queue
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            if (!newToken) return reject(new ApiException({ code: "unauthorized", message: "Сессия истекла." }, 401));
            resolve(apiFetch<T>(path, options, false));
          },
          reject,
        });
      });
    }
  }

  if (!res.ok) {
    let err: ApiError = { code: "unknown", message: "Unknown error" };
    try {
      err = await res.json();
    } catch {}
    throw new ApiException(err, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = tokenStorage.getAccess();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  headers["Accept-Language"] = currentLanguage();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshTokens();
        refreshQueue.forEach((q) => q.resolve(newToken));
        refreshQueue = [];
        isRefreshing = false;
        return apiUpload<T>(path, formData, false);
      } catch {
        const expiredError = new ApiException(
          { code: "unauthorized", message: "Сессия истекла. Войдите заново." },
          401,
        );
        refreshQueue.forEach((q) => q.reject(expiredError));
        refreshQueue = [];
        isRefreshing = false;
        notifySessionExpired();
        throw expiredError;
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push({
          resolve: () => resolve(apiUpload<T>(path, formData, false)),
          reject,
        });
      });
    }
  }

  if (!res.ok) {
    let err: ApiError = { code: "unknown", message: "Unknown error" };
    try {
      err = await res.json();
    } catch {}
    throw new ApiException(err, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
