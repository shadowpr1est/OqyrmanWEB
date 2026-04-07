import { apiFetch } from "./client";
import type { Author, PaginatedResponse } from "./types";

export const authorsApi = {
  list: (params: { limit?: number; offset?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    const q = sp.toString();
    return apiFetch<PaginatedResponse<Author>>(`/authors${q ? `?${q}` : ""}`);
  },

  search: (q: string) =>
    apiFetch<PaginatedResponse<Author>>(`/authors/search?q=${encodeURIComponent(q)}`),

  getById: (id: string | number) => apiFetch<Author>(`/authors/${id}`),
};
