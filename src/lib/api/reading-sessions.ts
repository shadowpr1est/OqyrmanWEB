import { apiFetch, ApiException } from "./client";
import type { ReadingSession } from "./types";

export const readingSessionsApi = {
  list: () => apiFetch<{ items: ReadingSession[] }>("/reading-sessions"),

  getByBook: (bookId: string | number) =>
    apiFetch<ReadingSession>(`/reading-sessions/book/${bookId}`).catch((e) => {
      if (e instanceof ApiException && e.status === 404) return null;
      throw e;
    }),

  upsert: (data: {
    book_id: string | number;
    current_page: number;
    total_pages?: number;
    cfi_position?: string;
    status?: string;
  }) =>
    apiFetch<ReadingSession>("/reading-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string | number) =>
    apiFetch<void>(`/reading-sessions/${id}`, { method: "DELETE" }),
};
