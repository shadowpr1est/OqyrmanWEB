import { apiFetch } from "./client";
import type { ReadingNote } from "./types";

export const notesApi = {
  getByBook: (bookId: string) =>
    apiFetch<{ items: ReadingNote[] }>(`/notes/book/${bookId}`).then(
      (res) => res.items || [],
    ),

  getById: (id: string) => apiFetch<ReadingNote>(`/notes/${id}`),

  create: (data: { book_id: string; page: number; content: string }) =>
    apiFetch<ReadingNote>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { page?: number; content?: string }) =>
    apiFetch<ReadingNote>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/notes/${id}`, { method: "DELETE" }),
};
