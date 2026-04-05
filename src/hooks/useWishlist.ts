import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.list(),
    enabled: !!user,
  });
}

export function useWishlistExists(bookId: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist", bookId, "exists"],
    queryFn: () => wishlistApi.exists(bookId),
    enabled: !!user && bookId > 0,
  });
}

export function useToggleWishlist(bookId: number) {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: () => wishlistApi.add(bookId),
    onSuccess: () => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: true });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const remove = useMutation({
    mutationFn: () => wishlistApi.remove(bookId),
    onSuccess: () => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: false });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  return { add, remove };
}
