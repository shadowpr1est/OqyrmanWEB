import { useEffect, useRef, useState, useCallback } from "react";
import ePub, { type Book, type Rendition } from "epubjs";
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
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface EpubReaderProps {
  fileUrl: string;
  bookTitle: string;
  onProgress?: (page: number, total: number, cfi?: string) => void;
  initialCfi?: string;
}

interface TocItem {
  label: string;
  href: string;
}

export const EpubReader = ({ fileUrl, bookTitle, onProgress, initialCfi }: EpubReaderProps) => {
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
        const page = book.locations.locationFromCfi(savedCfi) + 1;
        setCurrentPage(page);
        setProgress(Math.round((page / total) * 100));
        onProgress?.(page, total, savedCfi);
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
        const page = book.locations.locationFromCfi(cfi) + 1;
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#faf9f6]">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between h-12 px-4 bg-white border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0"
          >
            <IconArrowLeft size={18} stroke={1.5} />
          </button>
          <h1 className="text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-[300px]">
            {bookTitle}
          </h1>
        </div>

        {/* Center: page nav */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => renditionRef.current?.prev()}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <IconChevronLeft size={18} />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap min-w-[60px] text-center">
            {locationsReady
              ? `${currentPage} / ${totalPages}`
              : `${progress}%`}
          </span>
          <button
            onClick={() => renditionRef.current?.next()}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 flex-1 justify-end">
          <button
            onClick={() => { setTocOpen(!tocOpen); setSettingsOpen(false); }}
            className={`p-2 rounded-lg transition-colors ${tocOpen ? "bg-primary/10 text-primary" : "hover:bg-muted/60"}`}
          >
            <IconList size={18} stroke={1.5} />
          </button>
          <button
            onClick={() => { setSettingsOpen(!settingsOpen); setTocOpen(false); }}
            className={`p-2 rounded-lg transition-colors ${settingsOpen ? "bg-primary/10 text-primary" : "hover:bg-muted/60"}`}
          >
            <IconSettings size={18} stroke={1.5} />
          </button>
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
          <IconChevronLeft size={24} className="text-foreground/30" />
        </button>
        <button
          onClick={() => renditionRef.current?.next()}
          className="absolute right-0 top-0 h-full w-16 sm:w-24 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next"
        >
          <IconChevronRight size={24} className="text-foreground/30" />
        </button>

        {/* TOC panel */}
        {tocOpen && (
          <div className="absolute left-0 top-0 h-full w-72 bg-white border-r border-border/60 shadow-xl z-50 overflow-y-auto">
            <div className="p-4 border-b border-border/60">
              <h3 className="text-sm font-semibold">Содержание</h3>
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
          </div>
        )}

        {/* Settings panel */}
        {settingsOpen && (
          <ReaderSettings
            config={config}
            onChange={setConfig}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>

      {/* Bottom progress bar */}
      <div className="flex-shrink-0 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
