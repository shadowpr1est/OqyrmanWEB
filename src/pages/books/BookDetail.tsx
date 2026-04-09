import { useState, Component, type ReactNode, type ErrorInfo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconBook,
  IconCalendar,
  IconLanguage,
  IconFileText,
  IconArrowLeft,
  IconDeviceDesktop,
  IconBuildingBank,
  IconStar,
  IconBookmark,
  IconCheck,
  IconProgress,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBook } from "@/hooks/useBooks";
import { useAuth } from "@/contexts/AuthContext";
import { Rating } from "@/components/shared/Rating";
import { GenreBadge } from "@/components/shared/GenreBadge";
import { BookReviews } from "@/components/books/BookReviews";
import { SimilarBooks } from "@/components/books/SimilarBooks";
import { libraryBooksApi, readingSessionsApi, wishlistApi, reviewsApi, reservationsApi } from "@/lib/api";
import { ReservationModal } from "@/components/books/ReservationModal";
import { ReservationInfoCard } from "@/components/books/ReservationInfoCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = id!;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: book, isLoading } = useBook(bookId);
  const qc = useQueryClient();

  /* Reading session status */
  const { data: session } = useQuery({
    queryKey: ["reading-session", bookId],
    queryFn: () => readingSessionsApi.getByBook(bookId),
    enabled: !!bookId,
    retry: false,
    throwOnError: false,
  });

  const isFinished = session?.status === "finished";
  const isReading = session?.status === "reading";

  const upsertFinished = useMutation({
    mutationFn: () =>
      readingSessionsApi.upsert({
        book_id: bookId,
        current_page: book?.total_pages || session?.current_page || 1,
        status: "finished",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reading-session", bookId] });
      toast.success("Отмечено как прочитано!");
    },
    onError: () => toast.error("Не удалось обновить статус"),
  });

  const removeFinished = useMutation({
    mutationFn: () => {
      if (!session?.id) return Promise.resolve();
      return readingSessionsApi.delete(session.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reading-session", bookId] });
      toast.success("Статус убран");
    },
    onError: () => toast.error("Не удалось обновить статус"),
  });

  /* Wishlist status */
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", bookId, "exists"],
    queryFn: () => wishlistApi.exists(bookId),
    enabled: !!bookId,
  });

  const shelfStatus = wishlistData?.status ?? null;

  const addToShelf = useMutation({
    mutationFn: (status: "want_to_read" | "reading" | "finished") =>
      wishlistApi.add(bookId, status),
    onSuccess: (_data, status) => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: true, status });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: () => toast.error("Не удалось добавить"),
  });

  const updateShelfStatus = useMutation({
    mutationFn: (status: "want_to_read" | "reading" | "finished") =>
      wishlistApi.updateStatus(bookId, status),
    onSuccess: (_data, status) => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: true, status });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: () => toast.error("Не удалось обновить статус"),
  });

  const removeFromShelf = useMutation({
    mutationFn: () => wishlistApi.remove(bookId),
    onSuccess: () => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: false, status: null });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Убрано с полки");
    },
    onError: () => toast.error("Не удалось убрать"),
  });

  /* Review modal */
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");

  const createReview = useMutation({
    mutationFn: () => reviewsApi.create({ book_id: bookId, rating: reviewRating, body: reviewBody }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["books", bookId] });
      setReviewOpen(false);
      setReviewRating(0);
      setReviewBody("");
      toast.success("Отзыв добавлен!");
    },
    onError: () => toast.error("Не удалось добавить отзыв"),
  });

  /* Library availability */
  const { data: libraryBooks } = useQuery({
    queryKey: ["library-books", "book", bookId],
    queryFn: () => libraryBooksApi.getByBook(bookId),
    enabled: !!bookId,
  });

  const availableLibraryBooks = (libraryBooks || []).filter((lb) => lb.available_copies > 0);

  /* Active reservation for this book */
  const { data: userReservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationsApi.list(),
    enabled: !!user,
  });

  const activeReservation = (userReservations || []).find(
    (r) => r.book.id === bookId && (r.status === "pending" || r.status === "active"),
  );

  /* Reservation modal */
  const [reserveOpen, setReserveOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-muted/20 h-[400px]" />
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-4">
          <div className="h-8 bg-muted/40 rounded w-1/3" />
          <div className="h-4 bg-muted/30 rounded w-1/4" />
          <div className="h-20 bg-muted/20 rounded" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Книга не найдена</p>
        <Link to="/catalog" className="text-primary hover:underline text-sm mt-2 inline-block">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <IconArrowLeft size={18} />
          Назад
        </button>

        {/* ── Top section: Cover + Info ── */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-10">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-shrink-0 mx-auto md:mx-0"
          >
            <div className="w-[200px] md:w-[220px] aspect-[2/3] rounded-xl overflow-hidden shadow-xl ring-1 ring-border/40">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                  <IconBook size={48} className="text-muted-foreground/30" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 leading-tight">
              {book.title}
            </h1>

            {book.genre && (
              <div className="mb-2">
                <GenreBadge name={book.genre.name} slug={book.genre.slug} />
              </div>
            )}

            {book.author && (
              <Link
                to={`/authors/${book.author.id || book.author_id}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {book.author.name}
              </Link>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 mb-5">
              {book.year > 0 && (
                <span className="flex items-center gap-1"><IconCalendar size={14} /> {book.year}</span>
              )}
              {book.file && book.total_pages > 0 && (
                <span className="flex items-center gap-1"><IconFileText size={14} /> {book.total_pages} стр.</span>
              )}
              {book.language && (
                <span className="flex items-center gap-1"><IconLanguage size={14} /> {book.language.toUpperCase()}</span>
              )}
              {book.avg_rating > 0 && (
                <span className="flex items-center gap-2">
                  <Rating value={book.avg_rating} size={14} />
                  <span className="font-medium text-foreground">{book.avg_rating.toFixed(1)}</span>
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Read online */}
              {book.file?.file_url && (
                <button
                  onClick={() => {
                    window.open(book.file!.file_url, "_blank");
                    // upsert на полку со статусом "reading"
                    addToShelf.mutate("reading");
                    // создать reading_session если нет
                    if (!session) {
                      readingSessionsApi.upsert({ book_id: bookId, current_page: 0, status: "in_progress" });
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E5945] text-white text-sm font-semibold hover:bg-[#174a39] transition-colors shadow-sm"
                >
                  <IconDeviceDesktop size={16} />
                  Читать онлайн
                </button>
              )}
            </div>

            {/* Reading progress indicator */}
            {isReading && session && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 w-fit">
                <IconProgress size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  Вы читаете • стр. {session.current_page}
                  {book.total_pages > 0 && ` из ${book.total_pages}`}
                </span>
              </div>
            )}

            {/* Wishlist + Finished + Rate buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => {
                  if (shelfStatus === "want_to_read") {
                    removeFromShelf.mutate();
                  } else if (shelfStatus) {
                    updateShelfStatus.mutate("want_to_read");
                  } else {
                    addToShelf.mutate("want_to_read");
                  }
                }}
                disabled={addToShelf.isPending || removeFromShelf.isPending || updateShelfStatus.isPending}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  shelfStatus === "want_to_read"
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {shelfStatus === "want_to_read" ? <IconCheck size={15} /> : <IconBookmark size={15} />}
                Хочу прочитать
              </button>
              <button
                onClick={() => {
                  if (shelfStatus === "finished") {
                    removeFromShelf.mutate();
                    removeFinished.mutate();
                  } else if (shelfStatus) {
                    updateShelfStatus.mutate("finished");
                    upsertFinished.mutate();
                  } else {
                    addToShelf.mutate("finished");
                    upsertFinished.mutate();
                  }
                }}
                disabled={addToShelf.isPending || removeFromShelf.isPending || updateShelfStatus.isPending || upsertFinished.isPending}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  shelfStatus === "finished"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600"
                }`}
              >
                {shelfStatus === "finished" ? <IconCheck size={15} /> : <IconBook size={15} />}
                Уже прочитано
              </button>

              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:border-amber-400 hover:text-amber-600 transition-colors"
                  >
                    <IconStar size={15} />
                    Оценить книгу
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Оценить книгу</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground mr-2">Оценка:</span>
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => setReviewRating(v)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <IconStar
                            size={24}
                            fill={v <= reviewRating ? "currentColor" : "none"}
                            className={v <= reviewRating ? "text-amber-400" : "text-muted-foreground/30"}
                            stroke={1.5}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="Поделитесь впечатлениями..."
                      className="w-full rounded-lg border border-border bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReviewOpen(false);
                          setReviewRating(0);
                          setReviewBody("");
                        }}
                      >
                        Отмена
                      </Button>
                      <Button
                        size="sm"
                        disabled={reviewRating === 0 || createReview.isPending}
                        onClick={() => createReview.mutate()}
                      >
                        {createReview.isPending ? "Отправляем..." : "Отправить"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Library availability / reservation status */}
            {activeReservation ? (
              <ReservationInfoCard reservation={activeReservation} />
            ) : availableLibraryBooks.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Эта книга есть в библиотеках вашего города
                </div>
                <button
                  onClick={() => setReserveOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#1E5945] text-[#1E5945] text-sm font-semibold hover:bg-[#1E5945]/5 transition-colors w-fit"
                >
                  <IconBuildingBank size={16} />
                  Забронировать в библиотеке
                </button>
                <ReservationModal
                  open={reserveOpen}
                  onOpenChange={setReserveOpen}
                  libraryBooks={availableLibraryBooks}
                  bookTitle={book.title}
                />
              </div>
            ) : libraryBooks && libraryBooks.length === 0 ? (
              <p className="text-xs text-muted-foreground">Книга пока недоступна в библиотеках</p>
            ) : null}
          </motion.div>
        </div>

        {/* ── Description ── */}
        {book.description && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-lg font-bold text-foreground mb-3">Описание</h2>
            <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line max-w-3xl">
              {book.description}
            </p>
          </motion.section>
        )}

        {/* ── Author card ── */}
        {book.author && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-10"
          >
            <Link
              to={`/authors/${book.author.id || book.author_id}`}
              className="flex items-center gap-4 p-5 rounded-2xl border border-border/60 bg-white hover:shadow-md transition-shadow group w-fit max-w-lg"
            >
              {book.author.photo_url ? (
                <img
                  src={book.author.photo_url}
                  alt={book.author.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary/40">{book.author.name[0]}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {book.author.name}
                </p>
                {book.author.bio && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{book.author.bio}</p>
                )}
              </div>
            </Link>
          </motion.section>
        )}

        {/* ── Similar books ── */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-10"
        >
          <SimilarBooks bookId={bookId} />
        </motion.section>

        {/* ── Reviews ── */}
        <motion.section
          id="reviews-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-10"
        >
          <BookReviews bookId={book.id} />
        </motion.section>

      </div>
    </div>
  );
};

/* Temporary error boundary to catch render crashes */
class BookDetailErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("BookDetail crash:", error, info.componentStack);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-red-500 font-semibold mb-2">Ошибка при загрузке страницы</p>
          <p className="text-sm text-muted-foreground">Попробуйте обновить страницу</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const BookDetailWithBoundary = () => (
  <BookDetailErrorBoundary>
    <BookDetail />
  </BookDetailErrorBoundary>
);

export default BookDetailWithBoundary;
