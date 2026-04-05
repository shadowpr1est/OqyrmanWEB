import { apiFetch } from "./client";
import type { ReadingNote } from "./types";

export const notesApi = {
  getByBook: (bookId: number) =>
    apiFetch<ReadingNote[]>(`/notes/book/${bookId}`),

  getById: (id: number) => apiFetch<ReadingNote>(`/notes/${id}`),

  create: (data: { book_id: number; page: number; content: string }) =>
    apiFetch<ReadingNote>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { page?: number; content?: string }) =>
    apiFetch<ReadingNote>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/notes/${id}`, { method: "DELETE" }),
};
