import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ShelfStatus } from "@/lib/api/types";

export function useWishlist(status?: ShelfStatus) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist", status ?? "all"],
    queryFn: () => wishlistApi.list(status),
    enabled: !!user,
  });
}

export function useWishlistExists(bookId: string | number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist", bookId, "exists"],
    queryFn: () => wishlistApi.exists(bookId),
    enabled: !!user && !!bookId,
  });
}

export function useToggleWishlist(bookId: string | number) {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: (status: ShelfStatus = "want_to_read") =>
      wishlistApi.add(bookId, status),
    onSuccess: (_data, status) => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: true, status });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const remove = useMutation({
    mutationFn: () => wishlistApi.remove(bookId),
    onSuccess: () => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: false, status: null });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status: ShelfStatus) =>
      wishlistApi.updateStatus(bookId, status),
    onSuccess: (_data, status) => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: true, status });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  return { add, remove, updateStatus };
}
