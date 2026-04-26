import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { booksApi, readingSessionsApi, wishlistApi } from "@/lib/api";
import type { Book } from "@/lib/api";
import type { ShelfStatus } from "@/lib/api/types";

const EpubReader = lazy(() => import("@/components/reader/EpubReader").then(m => ({ default: m.EpubReader })));
const PdfReader = lazy(() => import("@/components/reader/PdfReader").then(m => ({ default: m.PdfReader })));

const ReaderSpinner = () => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#faf9f6]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">{t("reader.loadingBook")}</p>
      </div>
    </div>
  );
};

const Reader = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialProgress, setInitialProgress] = useState(0);
  const [initialCfi, setInitialCfi] = useState<string | undefined>();
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProgressRef = useRef<{ progress: number; cfi?: string } | null>(null);
  const firstSentRef = useRef(false);
  // Track shelf state so we know whether to add or update
  const shelfStatusRef = useRef<ShelfStatus | null>(null);
  const shelfExistsRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.all([
      booksApi.getById(id),
      readingSessionsApi.getByBook(id),
      wishlistApi.exists(id),
    ])
      .then(([bookData, session, shelf]) => {
        if (cancelled) return;
        if (!bookData.file?.file_url) {
          setError(t("reader.noFile"));
          return;
        }
        setBook(bookData);
        if (session?.progress != null) {
          setInitialProgress(session.progress);
        }
        // Prefer server-side CFI, fallback to localStorage
        if (session?.cfi_position) {
          setInitialCfi(session.cfi_position);
        } else {
          const localCfi = localStorage.getItem(`epub-pos-${bookData.file.file_url}`);
          if (localCfi) setInitialCfi(localCfi);
        }

        // Sync shelf status on open:
        // "finished" stays finished (user re-reads — don't downgrade)
        // "want_to_read" → upgrade to "reading"
        // not on shelf → add as "reading"
        shelfExistsRef.current = shelf.exists;
        shelfStatusRef.current = shelf.status;
        if (!shelf.exists) {
          wishlistApi.add(id, "reading").catch(() => {});
          shelfExistsRef.current = true;
          shelfStatusRef.current = "reading";
        } else if (shelf.status === "want_to_read") {
          wishlistApi.updateStatus(id, "reading").catch(() => {});
          shelfStatusRef.current = "reading";
        }
      })
      .catch(() => { if (!cancelled) setError(t("reader.bookNotFound")); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  // Debounced progress save
  const saveProgress = useCallback(
    (progress: number, cfi?: string) => {
      if (!id) return;
      lastProgressRef.current = { progress, cfi };

      // First call: send immediately
      const immediate = !firstSentRef.current;
      if (immediate) firstSentRef.current = true;

      if (progressTimer.current) clearTimeout(progressTimer.current);

      const doSave = () => {
        lastProgressRef.current = null;
        const isFinished = progress >= 100;
        const sessionStatus = isFinished ? "finished" : "reading";
        readingSessionsApi
          .upsert({
            book_id: id,
            progress,
            cfi_position: cfi,
            status: sessionStatus,
          })
          .catch(() => {});

        // Auto-mark shelf as finished (only once)
        if (isFinished && shelfExistsRef.current && shelfStatusRef.current !== "finished") {
          shelfStatusRef.current = "finished";
          wishlistApi.updateStatus(id, "finished").catch(() => {});
        }
      };

      if (immediate) {
        doSave();
      } else {
        progressTimer.current = setTimeout(doSave, 3000);
      }
    },
    [id],
  );

  // Flush pending progress on unmount (e.g. user closes the reader)
  useEffect(() => {
    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
      const pending = lastProgressRef.current;
      if (pending && id) {
        const isFinished = pending.progress >= 100;
        readingSessionsApi
          .upsert({
            book_id: id,
            progress: pending.progress,
            cfi_position: pending.cfi,
            status: isFinished ? "finished" : "reading",
          })
          .catch(() => {});
      }
    };
  }, [id]);

  if (loading) return <ReaderSpinner />;

  if (error || !book?.file) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">{error || t("reader.fileUnavailable")}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            {t("reader.back")}
          </button>
        </div>
      </div>
    );
  }

  const format = book.file.format?.toLowerCase();
  const fileUrl = book.file.file_url;

  if (format === "epub") {
    return (
      <Suspense fallback={<ReaderSpinner />}>
        <EpubReader
          fileUrl={fileUrl}
          bookId={id!}
          bookTitle={book.title}
          onProgress={saveProgress}
          initialCfi={initialCfi}
        />
      </Suspense>
    );
  }

  if (format === "pdf") {
    return (
      <Suspense fallback={<ReaderSpinner />}>
        <PdfReader
          fileUrl={fileUrl}
          bookId={id!}
          bookTitle={book.title}
          initialProgress={initialProgress}
          onProgress={saveProgress}
        />
      </Suspense>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("reader.formatNotSupported", { format: book.file.format })}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          {t("reader.back")}
        </button>
      </div>
    </div>
  );
};

export default Reader;
