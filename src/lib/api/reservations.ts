import { apiFetch } from "./client";
import type { Reservation } from "./types";

export const reservationsApi = {
  list: () => apiFetch<Reservation[]>("/reservations"),

  getById: (id: number) => apiFetch<Reservation>(`/reservations/${id}`),

  create: (library_book_id: number) =>
    apiFetch<Reservation>("/reservations", {
      method: "POST",
      body: JSON.stringify({ library_book_id }),
    }),

  cancel: (id: number) =>
    apiFetch<void>(`/reservations/${id}/cancel`, { method: "PATCH" }),

  extend: (id: number) =>
    apiFetch<Reservation>(`/reservations/${id}/extend`, { method: "PUT" }),
};
