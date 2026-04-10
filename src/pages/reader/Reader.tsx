import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksApi, readingSessionsApi, wishlistApi } from "@/lib/api";
import type { Book } from "@/lib/api";
import type { ShelfStatus } from "@/lib/api/types";
import { EpubReader } from "@/components/reader/EpubReader";
import { PdfReader } from "@/components/reader/PdfReader";

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialPage, setInitialPage] = useState(1);
  const [initialCfi, setInitialCfi] = useState<string | undefined>();
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track shelf state so we know whether to add or update
  const shelfStatusRef = useRef<ShelfStatus | null>(null);
  const shelfExistsRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      booksApi.getById(id),
      readingSessionsApi.getByBook(id),
      wishlistApi.exists(id),
    ])
      .then(([bookData, session, shelf]) => {
        if (!bookData.file?.file_url) {
          setError("У этой книги нет файла для чтения");
          return;
        }
        setBook(bookData);
        if (session?.current_page) {
          setInitialPage(session.current_page);
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
      .catch(() => setError("Книга не найдена"))
      .finally(() => setLoading(false));
  }, [id]);

  // Debounced progress save
  const saveProgress = useCallback(
    (page: number, total: number, cfi?: string) => {
      if (!id) return;
      if (progressTimer.current) clearTimeout(progressTimer.current);
      progressTimer.current = setTimeout(() => {
        const isFinished = total > 0 && page >= total;
        const sessionStatus = isFinished ? "finished" : "reading";
        readingSessionsApi
          .upsert({
            book_id: id,
            current_page: page,
            total_pages: total > 0 ? total : undefined,
            cfi_position: cfi,
            status: sessionStatus,
          })
          .catch(() => {});

        // Auto-mark shelf as finished on last page (only once)
        if (isFinished && shelfExistsRef.current && shelfStatusRef.current !== "finished") {
          shelfStatusRef.current = "finished";
          wishlistApi.updateStatus(id, "finished").catch(() => {});
        }
      }, 3000);
    },
    [id],
  );

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка книги…</p>
        </div>
      </div>
    );
  }

  if (error || !book?.file) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">{error || "Файл недоступен"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  const format = book.file.format?.toLowerCase();
  const fileUrl = book.file.file_url;

  if (format === "epub") {
    return (
      <EpubReader
        fileUrl={fileUrl}
        bookTitle={book.title}
        onProgress={saveProgress}
        initialCfi={initialCfi}
      />
    );
  }

  if (format === "pdf") {
    return (
      <PdfReader
        fileUrl={fileUrl}
        bookTitle={book.title}
        initialPage={initialPage}
        onProgress={saveProgress}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Формат «{book.file.format}» не поддерживается
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Назад
        </button>
      </div>
    </div>
  );
};

export default Reader;
