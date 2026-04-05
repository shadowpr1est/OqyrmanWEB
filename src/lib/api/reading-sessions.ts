import { apiFetch } from "./client";
import type { ReadingSession } from "./types";

export const readingSessionsApi = {
  list: () => apiFetch<ReadingSession[]>("/reading-sessions"),

  getByBook: (bookId: number) =>
    apiFetch<ReadingSession>(`/reading-sessions/book/${bookId}`),

  upsert: (data: { book_id: number; current_page: number; status?: string }) =>
    apiFetch<ReadingSession>("/reading-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/reading-sessions/${id}`, { method: "DELETE" }),
};
