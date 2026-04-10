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

  createStream: (onMessage: (data: string) => void): (() => void) | null => {
    const token = tokenStorage.getAccess();
    if (!token) return null;

    const url = `${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      onMessage(e.data);
    };

    // EventSource auto-reconnects on error; nothing else needed
    return () => es.close();
  },
};
