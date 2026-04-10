import { apiFetch, BASE_URL, tokenStorage } from "./client";
import type { Notification, PaginatedResponse } from "./types";

export const notificationsApi = {
  list: (params: { limit?: number; offset?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    const q = sp.toString();
    return apiFetch<PaginatedResponse<Notification>>(
      `/notifications${q ? `?${q}` : ""}`,
    );
  },

  markRead: (id: string) =>
    apiFetch<void>(`/notifications/${id}/read`, { method: "PATCH" }),

  delete: (id: string) =>
    apiFetch<void>(`/notifications/${id}`, { method: "DELETE" }),

  createStream: (onMessage: (data: string) => void): (() => void) => {
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 2000;
    let closed = false;

    const connect = () => {
      if (closed) return;
      const token = tokenStorage.getAccess();
      if (!token) return;

      es = new EventSource(
        `${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`,
      );

      es.onmessage = (e) => {
        retryDelay = 2000; // reset backoff on success
        onMessage(e.data);
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (closed) return;
        // Reconnect with exponential backoff (max 30s)
        retryTimer = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30_000);
          connect();
        }, retryDelay);
      };
    };

    connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      es?.close();
    };
  },
};
