import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconStar, IconPencil, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import { reviewsApi } from "@/lib/api";
import type { Review } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Rating } from "@/components/shared/Rating";
import { Button } from "@/components/ui/button";
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
          <div className="flex items-center gap-1 mb-4">
            <span className="text-sm text-muted-foreground mr-2">Оценка:</span>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setRating(v)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <IconStar
                  size={22}
                  fill={v <= rating ? "currentColor" : "none"}
                  className={v <= rating ? "text-amber-400" : "text-muted-foreground/30"}
                  stroke={1.5}
                />
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Поделитесь впечатлениями..."
            className="w-full rounded-lg border border-border bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]"
          />
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              disabled={rating === 0 || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Отправляем..." : "Отправить"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setBody("");
              }}
            >
              Отмена
            </Button>
          </div>
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
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground mr-2">Оценка:</span>
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => setEditRating(v)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <IconStar
                            size={20}
                            fill={v <= editRating ? "currentColor" : "none"}
                            className={v <= editRating ? "text-amber-400" : "text-muted-foreground/30"}
                            stroke={1.5}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full rounded-lg border border-border bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={editRating === 0 || updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: r.id, rating: editRating, body: editBody })}
                        className="gap-1"
                      >
                        <IconCheck size={14} />
                        {updateMutation.isPending ? "Сохраняем..." : "Сохранить"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit} className="gap-1">
                        <IconX size={14} />
                        Отмена
                      </Button>
                    </div>
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
