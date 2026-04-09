import { apiFetch } from "./client";
import type { Reservation } from "./types";

export const reservationsApi = {
  list: () =>
    apiFetch<{ items: Reservation[] }>("/reservations").then((r) => r.items),

  getById: (id: string) => apiFetch<Reservation>(`/reservations/${id}`),

  create: (library_book_id: string | number, due_date?: string) => {
    const due =
      due_date ??
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    return apiFetch<Reservation>("/reservations", {
      method: "POST",
      body: JSON.stringify({ library_book_id, due_date: due }),
    });
  },

  cancel: (id: string) =>
    apiFetch<void>(`/reservations/${id}/cancel`, { method: "PATCH" }),

  extend: (id: string) =>
    apiFetch<Reservation>(`/reservations/${id}/extend`, { method: "PUT" }),
};
