import { apiFetch } from "./client";
import type { WishlistItem } from "./types";

export const wishlistApi = {
  list: () => apiFetch<WishlistItem[]>("/wishlist"),

  add: (book_id: string | number) =>
    apiFetch<WishlistItem>("/wishlist", {
      method: "POST",
      body: JSON.stringify({ book_id }),
    }),

  remove: (bookId: string | number) =>
    apiFetch<void>(`/wishlist/${bookId}`, { method: "DELETE" }),

  exists: (bookId: string | number) =>
    apiFetch<{ exists: boolean }>(`/wishlist/${bookId}/exists`),
};
