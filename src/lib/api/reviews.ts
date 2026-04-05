import { apiFetch } from "./client";
import type { Review, PaginatedResponse } from "./types";

export const reviewsApi = {
  getByBook: (bookId: number, params: { limit?: number; offset?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    const q = sp.toString();
    return apiFetch<PaginatedResponse<Review>>(`/reviews/book/${bookId}${q ? `?${q}` : ""}`);
  },

  getUserReviews: () => apiFetch<Review[]>("/reviews/user"),

  getById: (id: number) => apiFetch<Review>(`/reviews/${id}`),

  create: (data: { book_id: number; rating: number; body: string }) =>
    apiFetch<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { rating: number; body: string }) =>
    apiFetch<Review>(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/reviews/${id}`, { method: "DELETE" }),
};
