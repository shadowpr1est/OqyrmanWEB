import { apiFetch } from "./client";
import type { Book, BookFile, PaginatedResponse } from "./types";

export interface BooksParams {
  limit?: number;
  offset?: number;
  genre_id?: number;
  author_id?: number;
  sort?: string;
}

function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const booksApi = {
  list: (params: BooksParams = {}) =>
    apiFetch<PaginatedResponse<Book>>(`/books${toQuery(params)}`),

  search: (q: string, limit = 20) =>
    apiFetch<PaginatedResponse<Book>>(`/books/search${toQuery({ q, limit })}`),

  popular: (limit = 10) =>
    apiFetch<Book[]>(`/books/popular${toQuery({ limit })}`),

  getById: (id: number) => apiFetch<Book>(`/books/${id}`),

  getSimilar: (id: number, limit = 6) =>
    apiFetch<Book[]>(`/books/${id}/similar${toQuery({ limit })}`),

  getByAuthor: (authorId: number, params: BooksParams = {}) =>
    apiFetch<PaginatedResponse<Book>>(`/books/author/${authorId}${toQuery(params)}`),

  getByGenre: (genreId: number, params: BooksParams = {}) =>
    apiFetch<PaginatedResponse<Book>>(`/books/genre/${genreId}${toQuery(params)}`),

  getFiles: (bookId: number) =>
    apiFetch<BookFile[]>(`/book-files/book/${bookId}`),
};
