import { apiFetch } from "./client";
import type { WishlistItem, ShelfStatus } from "./types";

export const wishlistApi = {
  list: (status?: ShelfStatus) =>
    apiFetch<{ items: WishlistItem[] }>(
      status ? `/wishlist?status=${status}` : "/wishlist",
    ).then((r) => r.items),

  add: (book_id: string | number, status: ShelfStatus = "want_to_read") =>
    apiFetch<WishlistItem>("/wishlist", {
      method: "POST",
      body: JSON.stringify({ book_id, status }),
    }),

  updateStatus: (bookId: string | number, status: ShelfStatus) =>
    apiFetch<void>(`/wishlist/${bookId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  remove: (bookId: string | number) =>
    apiFetch<void>(`/wishlist/${bookId}`, { method: "DELETE" }),

  exists: (bookId: string | number) =>
    apiFetch<{ exists: boolean; status: ShelfStatus | null }>(`/wishlist/${bookId}/exists`),
};
