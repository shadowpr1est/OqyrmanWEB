import { apiFetch } from "./client";
import type { ReadingNote } from "./types";

export const notesApi = {
  getByBook: (bookId: string) =>
    apiFetch<ReadingNote[]>(`/notes/book/${bookId}`),

  getById: (id: string) => apiFetch<ReadingNote>(`/notes/${id}`),

  create: (data: { book_id: string; position: string; content: string }) =>
    apiFetch<ReadingNote>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { position?: string; content?: string }) =>
    apiFetch<ReadingNote>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/notes/${id}`, { method: "DELETE" }),
};
