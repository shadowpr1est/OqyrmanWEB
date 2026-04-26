import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconDeviceDesktop,
  IconBuildingBank,
  IconStar,
  IconBookmark,
  IconCheck,
  IconBook,
  IconProgress,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewForm } from "@/components/books/ReviewForm";
import { libraryBooksApi, readingSessionsApi, wishlistApi, reviewsApi, reservationsApi } from "@/lib/api";
import { ReservationModal } from "@/components/books/ReservationModal";
import { ReservationInfoCard } from "@/components/books/ReservationInfoCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Book } from "@/lib/api/types";
import { useTranslation } from "react-i18next";

interface BookActionsProps {
  book: Book;
}

export function BookActions({ book }: BookActionsProps) {
  const { t } = useTranslation();
  const bookId = String(book.id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["reading-session", bookId],
    queryFn: () => readingSessionsApi.getByBook(bookId),
    enabled: !!bookId,
    retry: false,
    throwOnError: false,
  });

  const isReading = session?.status === "reading";

  const upsertFinished = useMutation({
    mutationFn: () =>
      readingSessionsApi.upsert({ book_id: bookId, progress: 100, status: "finished" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reading-session", bookId] });
      toast.success(t("book.markedAsRead"));
    },
    onError: () => toast.error(t("book.updateStatusError")),
  });

  const removeFinished = useMutation({
    mutationFn: () => {
      if (!session?.id) return Promise.resolve();
      return readingSessionsApi.delete(session.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reading-session", bookId] });
      toast.success(t("book.statusRemoved"));
    },
    onError: () => toast.error(t("book.updateStatusError")),
  });

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
    onError: () => toast.error(t("book.updateStatusError")),
  });

  const updateShelfStatus = useMutation({
    mutationFn: (status: "want_to_read" | "reading" | "finished") =>
      wishlistApi.updateStatus(bookId, status),
    onSuccess: (_data, status) => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: true, status });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: () => toast.error(t("book.updateStatusError")),
  });

  const removeFromShelf = useMutation({
    mutationFn: () => wishlistApi.remove(bookId),
    onSuccess: () => {
      qc.setQueryData(["wishlist", bookId, "exists"], { exists: false, status: null });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(t("wishlist.removeSuccess"));
    },
    onError: () => toast.error(t("book.updateStatusError")),
  });

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");

  const createReview = useMutation({
    mutationFn: () =>
      reviewsApi.create({ book_id: bookId, rating: reviewRating, body: reviewBody }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["books", bookId] });
      setReviewOpen(false);
      setReviewRating(0);
      setReviewBody("");
      toast.success(t("book.reviewAdded"));
    },
    onError: () => toast.error(t("book.reviewAddError")),
  });

  const { data: libraryBooks } = useQuery({
    queryKey: ["library-books", "book", bookId],
    queryFn: () => libraryBooksApi.getByBook(bookId),
    enabled: !!bookId,
  });

  const availableLibraryBooks = (libraryBooks || []).filter((lb) => lb.available_copies > 0);

  const { data: userReservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationsApi.list(),
    enabled: !!user,
  });

  const activeReservation = (userReservations || []).find(
    (r) => r.book.id === bookId && (r.status === "pending" || r.status === "active"),
  );

  const [reserveOpen, setReserveOpen] = useState(false);

  const handleReserveClick = () => {
    if (!user?.phone) {
      toast.error(t("book.reserveModal.phoneRequired"), {
        action: { label: t("book.reserveModal.phoneRequiredBtn"), onClick: () => navigate("/profile") },
      });
      return;
    }
    setReserveOpen(true);
  };

  const shelfBusy =
    addToShelf.isPending || removeFromShelf.isPending || updateShelfStatus.isPending;

  return (
    <>
      {book.file?.file_url && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            disabled={shelfBusy}
            onClick={() => navigate(`/read/${bookId}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <IconDeviceDesktop size={16} />
            {t("book.readOnline")}
          </button>
        </div>
      )}

      {isReading && session && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 w-fit">
          <IconProgress size={16} className="text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">
            {t("book.readingNow", { progress: session.progress ?? 0 })}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => {
            if (shelfStatus === "want_to_read") removeFromShelf.mutate();
            else if (shelfStatus) updateShelfStatus.mutate("want_to_read");
            else addToShelf.mutate("want_to_read");
          }}
          disabled={shelfBusy}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            shelfStatus === "want_to_read"
              ? "bg-primary/10 border-primary text-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {shelfStatus === "want_to_read" ? <IconCheck size={15} /> : <IconBookmark size={15} />}
          {t("book.wantToRead")}
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
          disabled={shelfBusy || upsertFinished.isPending}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            shelfStatus === "finished"
              ? "bg-emerald-50 border-emerald-500 text-emerald-700"
              : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600"
          }`}
        >
          {shelfStatus === "finished" ? <IconCheck size={15} /> : <IconBook size={15} />}
          {t("book.alreadyRead")}
        </button>

        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:border-amber-400 hover:text-amber-600 transition-colors">
              <IconStar size={15} />
              {t("book.rateBook")}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("book.rateBook")}</DialogTitle>
            </DialogHeader>
            <div className="pt-2">
              <ReviewForm
                rating={reviewRating}
                body={reviewBody}
                onRatingChange={setReviewRating}
                onBodyChange={setReviewBody}
                onSubmit={() => createReview.mutate()}
                onCancel={() => {
                  setReviewOpen(false);
                  setReviewRating(0);
                  setReviewBody("");
                }}
                isPending={createReview.isPending}
                minHeight="min-h-[120px]"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeReservation ? (
        <ReservationInfoCard reservation={activeReservation} />
      ) : availableLibraryBooks.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {t("book.inLibraries")}
          </div>
          <button
            onClick={handleReserveClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors w-fit"
          >
            <IconBuildingBank size={16} />
            {t("book.reserveInLibrary")}
          </button>
          <ReservationModal
            open={reserveOpen}
            onOpenChange={setReserveOpen}
            libraryBooks={availableLibraryBooks}
            bookTitle={book.title}
          />
        </div>
      ) : libraryBooks && libraryBooks.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("book.notInLibraries")}</p>
      ) : null}
    </>
  );
}
