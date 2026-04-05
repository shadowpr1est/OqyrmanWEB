import { apiFetch } from "./client";
import type { Event, PaginatedResponse } from "./types";

export const eventsApi = {
  list: (params: { limit?: number; offset?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    const q = sp.toString();
    return apiFetch<PaginatedResponse<Event>>(`/events${q ? `?${q}` : ""}`);
  },

  getById: (id: number) => apiFetch<Event>(`/events/${id}`),
};
