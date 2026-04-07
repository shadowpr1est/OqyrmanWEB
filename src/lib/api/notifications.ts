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

  markRead: (id: number) =>
    apiFetch<void>(`/notifications/${id}/read`, { method: "PATCH" }),

  delete: (id: number) =>
    apiFetch<void>(`/notifications/${id}`, { method: "DELETE" }),

  createStream: (onMessage: (data: string) => void): (() => void) | null => {
    const token = tokenStorage.getAccess();
    if (!token) return null;

    const controller = new AbortController();

    fetch(`${BASE_URL}/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const read = (): Promise<void> =>
          reader.read().then(({ done, value }) => {
            if (done) return;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data:")) {
                onMessage(line.slice(5).trim());
              }
            }
            return read();
          });

        read().catch(() => {});
      })
      .catch(() => {});

    return () => controller.abort();
  },
};
