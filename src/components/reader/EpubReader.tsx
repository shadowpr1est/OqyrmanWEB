import { useEffect, useRef, useState, useCallback } from "react";
import ePub, { type Book, type Rendition } from "epubjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ReaderSettings,
  loadSettings,
  saveSettings,
  type ReaderConfig,
} from "./ReaderSettings";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
  IconList,
  IconBook,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ReaderNotes } from "./ReaderNotes";

interface EpubReaderProps {
  fileUrl: string;
  bookId: string;
  bookTitle: string;
  onProgress?: (page: number, total: number, cfi?: string) => void;
  initialCfi?: string;
}

interface TocItem {
  label: string;
  href: string;
}

export const EpubReader = ({ fileUrl, bookId, bookTitle, onProgress, initialCfi }: EpubReaderProps) => {
  const [notesOpen, setNotesOpen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const lastCfiRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const [config, setConfig] = useState<ReaderConfig>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [progress, setProgress] = useState(0);
  const [locationsReady, setLocationsReady] = useState(false);
  const [editingPage, setEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const pageInputRef = useRef<HTMLInputElement>(null);

  // Apply settings to rendition
  const applySettings = useCallback(
    (rendition: Rendition, cfg: ReaderConfig) => {
      rendition.themes.override("font-family", cfg.fontFamily);
      rendition.themes.override("font-size", `${cfg.fontSize}px`);
      rendition.themes.override("line-height", `${cfg.lineHeight}`);
    },
    [],
  );

  // Init book
  useEffect(() => {
    if (!viewerRef.current) return;

    let disposed = false;

    const book = ePub(fileUrl);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      spread: "none",
      flow: "paginated",
      allowScriptedContent: true,
    });
    renditionRef.current = rendition;

    // Default theme
    rendition.themes.default({
      body: {
        "max-width": "720px",
        margin: "0 auto",
        padding: "20px 24px",
        color: "#1a1a1a",
      },
      "p, div, span, li": {
        "text-align": "justify",
      },
      img: {
        "max-width": "100%",
        height: "auto",
      },
    });

    applySettings(rendition, config);

    // Display from saved position or start
    if (initialCfi) {
      lastCfiRef.current = initialCfi;
      rendition.display(initialCfi);
    } else {
      rendition.display();
    }

    // Load TOC
    book.loaded.navigation.then((nav) => {
      setToc(nav.toc.map((t) => ({ label: t.label.trim(), href: t.href })));
    });

    // Locations: try to load from cache, otherwise generate & cache
    const locCacheKey = `epub-locs-${fileUrl}`;
    book.ready.then(async () => {
      if (disposed) return;
      const cached = localStorage.getItem(locCacheKey);
      if (cached) {
        // Instant — load pre-generated locations from cache
        book.locations.load(cached);
      } else {
        // Slow — generate locations, then cache for next time
        await book.locations.generate(1600);
        try {
          localStorage.setItem(locCacheKey, book.locations.save());
        } catch { /* quota exceeded — ignore */ }
      }

      if (disposed) return;
      const total = book.locations.length();
      setTotalPages(total);
      setLocationsReady(true);

      // Update page once locations are ready using the latest known CFI.
      // Avoid calling rendition.currentLocation() here: epubjs can throw while internals are not ready.
      const savedCfi =
        lastCfiRef.current || localStorage.getItem(`epub-pos-${fileUrl}`);
      if (savedCfi) {
        const pct = book.locations.percentageFromCfi(savedCfi);
        const page = Math.max(1, Math.min(total, Math.floor(pct * total) + 1));
        setCurrentPage(page);
        setProgress(Math.round((page / total) * 100));
        onProgress?.(page, total, savedCfi);
      } else {
        // First open — report page 1 so total_pages gets saved on the book
        setCurrentPage(1);
        setProgress(0);
        onProgress?.(1, total);
      }
    });

    // Track position on every page turn
    rendition.on(
      "relocated",
      (location: { start: { cfi: string; percentage: number } }) => {
        const cfi = location.start.cfi;
        const pct = location.start.percentage;
        lastCfiRef.current = cfi;

        // Always save CFI position
        try {
          localStorage.setItem(`epub-pos-${fileUrl}`, cfi);
        } catch {}

        // Always update percentage (available without locations)
        setProgress(Math.round((pct || 0) * 100));

        // If locations aren't ready yet, still show percentage-based progress
        if (book.locations.length() === 0) return;

        const total = book.locations.length();
        // Use percentage-based page calculation instead of locationFromCfi —
        // locationFromCfi maps to coarse ~1600-char ranges that may span
        // multiple visible screens, so the page number wouldn't update on every swipe.
        const page = Math.max(1, Math.min(total, Math.floor(pct * total) + 1));
        setCurrentPage(page);
        setTotalPages(total);
        setProgress(Math.round((page / total) * 100));
        onProgress?.(page, total, cfi);
      },
    );

    // Keyboard navigation
    rendition.on("keyup", (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") rendition.prev();
      if (e.key === "ArrowRight") rendition.next();
    });

    return () => {
      disposed = true;
      rendition.destroy();
      book.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  // Update settings
  useEffect(() => {
    if (renditionRef.current) {
      applySettings(renditionRef.current, config);
      saveSettings(config);
    }
  }, [config, applySettings]);

  // Global keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") renditionRef.current?.prev();
      if (e.key === "ArrowRight") renditionRef.current?.next();
      if (e.key === "Escape") navigate(-1);
    };
    document.addEventListener("keyup", handler);
    return () => document.removeEventListener("keyup", handler);
  }, [navigate]);

  const goToChapter = (href: string) => {
    renditionRef.current?.display(href);
    setTocOpen(false);
  };

  const goToPage = (page: number) => {
    const book = bookRef.current;
    if (!book || !locationsReady || totalPages === 0) return;
    const clamped = Math.max(1, Math.min(totalPages, page));
    // Convert 1-based page to location index, then get CFI
    const cfi = book.locations.cfiFromLocation(clamped - 1);
    if (cfi) renditionRef.current?.display(cfi);
  };

  const handlePageInputSubmit = () => {
    const num = parseInt(pageInput, 10);
    if (!isNaN(num)) goToPage(num);
    setEditingPage(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#faf9f6]">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between h-12 px-4 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/15 transition-colors flex-shrink-0"
          >
            <IconArrowLeft size={18} stroke={1.5} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <IconBook size={16} stroke={1.5} className="flex-shrink-0 opacity-70" />
            <h1 className="text-sm font-medium truncate max-w-[120px] sm:max-w-[300px]">
              {bookTitle}
            </h1>
          </div>
        </div>

        {/* Center: page nav */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => renditionRef.current?.prev()}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
          >
            <IconChevronLeft size={18} />
          </button>
          {editingPage && locationsReady ? (
            <form
              onSubmit={(e) => { e.preventDefault(); handlePageInputSubmit(); }}
              className="flex items-center gap-1"
            >
              <input
                ref={pageInputRef}
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handlePageInputSubmit}
                onKeyDown={(e) => { if (e.key === "Escape") setEditingPage(false); }}
                className="w-14 text-center text-xs tabular-nums border border-white/30 rounded-md px-1 py-0.5 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-white/70">/ {totalPages}</span>
            </form>
          ) : (
            <button
              onClick={() => {
                if (!locationsReady) return;
                setPageInput(String(currentPage));
                setEditingPage(true);
                setTimeout(() => pageInputRef.current?.select(), 30);
              }}
              className="text-xs tabular-nums whitespace-nowrap text-center bg-white/15 hover:bg-white/25 rounded-full px-3 py-1 transition-colors cursor-pointer font-medium"
              title="Нажмите, чтобы перейти на страницу"
            >
              {locationsReady
                ? `${currentPage} / ${totalPages}`
                : `${progress}%`}
            </button>
          )}
          <button
            onClick={() => renditionRef.current?.next()}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 flex-1 justify-end">
          <button
            onClick={() => { setTocOpen(!tocOpen); setSettingsOpen(false); setNotesOpen(false); }}
            className={`p-2 rounded-lg transition-colors ${tocOpen ? "bg-white/25" : "hover:bg-white/15"}`}
          >
            <IconList size={18} stroke={1.5} />
          </button>
          <button
            onClick={() => { setSettingsOpen(!settingsOpen); setTocOpen(false); setNotesOpen(false); }}
            className={`p-2 rounded-lg transition-colors ${settingsOpen ? "bg-white/25" : "hover:bg-white/15"}`}
          >
            <IconSettings size={18} stroke={1.5} />
          </button>
          <ReaderNotes bookId={bookId} currentPage={currentPage} />
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        {/* EPUB viewer */}
        <div ref={viewerRef} className="h-full w-full" />

        {/* Prev / Next touch zones */}
        <button
          onClick={() => renditionRef.current?.prev()}
          className="absolute left-0 top-0 h-full w-16 sm:w-24 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Previous"
        >
          <IconChevronLeft size={24} className="text-primary/30" />
        </button>
        <button
          onClick={() => renditionRef.current?.next()}
          className="absolute right-0 top-0 h-full w-16 sm:w-24 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next"
        >
          <IconChevronRight size={24} className="text-primary/30" />
        </button>

        {/* TOC panel */}
        <AnimatePresence>
          {tocOpen && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full w-72 bg-white border-r border-border/60 shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-primary/20 bg-primary/5">
                <h3 className="text-sm font-semibold text-primary">Содержание</h3>
              </div>
              <nav className="p-2">
                {toc.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => goToChapter(item.href)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-foreground/70 hover:bg-muted/50 hover:text-foreground transition-colors truncate"
                  >
                    {item.label}
                  </button>
                ))}
                {toc.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Содержание недоступно
                  </p>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings panel */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-3 top-2 z-50"
            >
              <ReaderSettings
                config={config}
                onChange={setConfig}
                onClose={() => setSettingsOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      <div className="flex-shrink-0 flex items-center gap-3 h-7 px-4 bg-primary/5 border-t border-primary/10">
        <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-primary/70 tabular-nums flex-shrink-0">
          {progress}%
        </span>
      </div>
    </div>
  );
};
