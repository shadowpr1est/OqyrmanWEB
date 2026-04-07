import { apiFetch } from "./client";
import type { Genre } from "./types";

export const genresApi = {
  list: () =>
    apiFetch<{ items: Genre[] }>("/genres").then((res) => res.items || []),
  getById: (id: string | number) => apiFetch<Genre>(`/genres/${id}`),
  getBySlug: (slug: string) => apiFetch<Genre>(`/genres/slug/${slug}`),
};
