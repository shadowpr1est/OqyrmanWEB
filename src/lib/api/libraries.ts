import { apiFetch } from "./client";
import type { Library, LibraryBook, PaginatedResponse } from "./types";

export const librariesApi = {
  list: (params: { limit?: number; offset?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    const q = sp.toString();
    return apiFetch<PaginatedResponse<Library>>(`/libraries${q ? `?${q}` : ""}`);
  },

  nearby: (lat: number, lng: number, radius = 10) =>
    apiFetch<Library[]>(
      `/libraries/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
    ),

  getById: (id: number) => apiFetch<Library>(`/libraries/${id}`),
};

export const libraryBooksApi = {
  getByLibrary: (libraryId: number) =>
    apiFetch<LibraryBook[]>(`/library-books/library/${libraryId}`),

  getByBook: (bookId: number) =>
    apiFetch<LibraryBook[]>(`/library-books/book/${bookId}`),

  getById: (id: number) => apiFetch<LibraryBook>(`/library-books/${id}`),
};
