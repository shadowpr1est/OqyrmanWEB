import { apiFetch } from "./client";
import type { Genre } from "./types";

export const genresApi = {
  list: () => apiFetch<Genre[]>("/genres"),
  getById: (id: number) => apiFetch<Genre>(`/genres/${id}`),
  getBySlug: (slug: string) => apiFetch<Genre>(`/genres/slug/${slug}`),
};
