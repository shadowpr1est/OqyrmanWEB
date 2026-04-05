export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

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
let refreshQueue: Array<(token: string) => void> = [];

async function refreshTokens(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    tokenStorage.clear();
    return null;
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
    ...(options.headers as Record<string, string>),
  };

  const token = tokenStorage.getAccess();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshTokens();

      if (!newToken) {
        refreshQueue.forEach((cb) => cb(""));
        refreshQueue = [];
        isRefreshing = false;
        throw new ApiException(
          { code: "unauthorized", message: "Session expired" },
          401,
        );
      }

      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      isRefreshing = false;
      return apiFetch<T>(path, options, false);
    } else {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken)
            return reject(
              new ApiException(
                { code: "unauthorized", message: "Session expired" },
                401,
              ),
            );
          resolve(apiFetch<T>(path, options, false));
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
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = tokenStorage.getAccess();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

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
