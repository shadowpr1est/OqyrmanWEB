import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconPencil, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import { reviewsApi } from "@/lib/api";
import type { Review } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Rating } from "@/components/shared/Rating";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/books/ReviewForm";
import { toast } from "sonner";

interface BookReviewsProps {
  bookId: string | number;
}

export const BookReviews = ({ bookId }: BookReviewsProps) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  /* Editing state */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editBody, setEditBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => reviewsApi.getByBook(bookId),
    enabled: !!bookId,
  });

  const createMutation = useMutation({
    mutationFn: () => reviewsApi.create({ book_id: bookId, rating, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["books", bookId] });
      setShowForm(false);
      setRating(0);
      setBody("");
      toast.success("Отзыв добавлен");
    },
    onError: () => toast.error("Не удалось добавить отзыв"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, rating, body }: { id: string; rating: number; body: string }) =>
      reviewsApi.update(id, { rating, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["books", bookId] });
      setEditingId(null);
      toast.success("Отзыв обновлён");
    },
    onError: () => toast.error("Не удалось обновить отзыв"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["books", bookId] });
      toast.success("Отзыв удалён");
    },
    onError: () => toast.error("Не удалось удалить отзыв"),
  });

  const reviews = data?.items || [];

  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditBody(r.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditBody("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Отзывы {reviews.length > 0 && `(${data?.total || reviews.length})`}
        </h3>
        {user && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Написать отзыв
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border p-5 mb-6 bg-muted/20"
        >
          <ReviewForm
            rating={rating}
            body={body}
            onRatingChange={setRating}
            onBodyChange={setBody}
            onSubmit={() => createMutation.mutate()}
            onCancel={() => { setShowForm(false); setRating(0); setBody(""); }}
            isPending={createMutation.isPending}
          />
        </motion.div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2 p-4 rounded-xl bg-muted/20">
              <div className="h-4 bg-muted/60 rounded w-1/4" />
              <div className="h-3 bg-muted/40 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Пока нет отзывов. Будьте первым!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => {
            const isOwn = user?.id === r.user_id;
            const isEditing = editingId === r.id;
            const initial = r.user_name?.[0] || r.user_surname?.[0] || "?";
            const displayName = [r.user_name, r.user_surname].filter(Boolean).join(" ") || "Пользователь";

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border p-4 bg-white ${isOwn ? "border-primary/30" : "border-border/60"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {r.user_avatar_url ? (
                    <img
                      src={r.user_avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                      {initial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayName}
                      {isOwn && <span className="text-xs text-primary ml-1.5">(вы)</span>}
                    </p>
                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <Rating value={r.rating} size={12} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("ru")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Edit / Delete buttons for own review */}
                  {isOwn && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(r)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        title="Редактировать"
                      >
                        <IconPencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(r.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Удалить"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <ReviewForm
                      rating={editRating}
                      body={editBody}
                      onRatingChange={setEditRating}
                      onBodyChange={setEditBody}
                      onSubmit={() => updateMutation.mutate({ id: r.id, rating: editRating, body: editBody })}
                      onCancel={cancelEdit}
                      isPending={updateMutation.isPending}
                      minHeight="min-h-[80px]"
                    />
                  </div>
                ) : (
                  r.body && (
                    <p className="text-sm text-foreground/80 leading-relaxed">{r.body}</p>
                  )
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
