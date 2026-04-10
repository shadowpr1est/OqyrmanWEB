import { useQuery } from "@tanstack/react-query";
import { booksApi, genresApi } from "@/lib/api";
import type { BooksParams } from "@/lib/api";

const BOOKS_STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useBooks(params: BooksParams = {}) {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => booksApi.list(params),
    staleTime: BOOKS_STALE_TIME,
  });
}

export function useBook(id: string | number) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => booksApi.getById(id),
    enabled: !!id,
    staleTime: BOOKS_STALE_TIME,
  });
}

export function usePopularBooks(limit = 10) {
  return useQuery({
    queryKey: ["books", "popular", limit],
    queryFn: () => booksApi.popular(limit),
    staleTime: BOOKS_STALE_TIME,
  });
}

export function useSimilarBooks(bookId: string | number, limit = 6) {
  return useQuery({
    queryKey: ["books", bookId, "similar", limit],
    queryFn: () => booksApi.getSimilar(bookId, limit),
    enabled: !!bookId,
    staleTime: BOOKS_STALE_TIME,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => genresApi.list(),
    staleTime: 5 * 60 * 1000, // genres rarely change
  });
}
