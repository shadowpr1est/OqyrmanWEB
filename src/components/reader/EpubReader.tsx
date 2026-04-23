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
import { AiSelectionLayer, type ReaderSelection } from "./AiSelectionLayer";
import { parsePosition } from "@/lib/notePosition";

interface EpubReaderProps {
  fileUrl: string;
  bookId: string;
  bookTitle: string;
  onProgress?: (progress: number, cfi?: string) => void;
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
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const [aiSelection, setAiSelection] = useState<ReaderSelection | null>(null);

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

    // Generate locations — required for percentage to work on every page turn.
    // Without locations, percentage only updates on chapter boundaries.
    const locCacheKey = `epub-locs-${fileUrl}`;
    book.ready.then(async () => {
      if (disposed) return;
      const cached = localStorage.getItem(locCacheKey);
      if (cached) {
        try {
          book.locations.load(cached);
        } catch {
          // Corrupted cache — regenerate
          localStorage.removeItem(locCacheKey);
          await book.locations.generate(1600);
          try {
            localStorage.setItem(locCacheKey, book.locations.save());
          } catch { /* quota exceeded */ }
        }
      } else {
        await book.locations.generate(1600);
        try {
          localStorage.setItem(locCacheKey, book.locations.save());
        } catch { /* quota exceeded — ignore */ }
      }

      if (disposed) return;

      // Update progress immediately now that locations are ready
      const savedCfi = lastCfiRef.current;
      if (savedCfi && book.locations.length() > 0) {
        const pct = book.locations.percentageFromCfi(savedCfi);
        const progressPct = Math.round((pct || 0) * 100);
        setProgress(progressPct);
        onProgress?.(progressPct, savedCfi);
      }
    });

    // Track position on every page turn
    rendition.on(
      "relocated",
      (location: { start: { cfi: string; percentage: number } }) => {
        const cfi = location.start.cfi;
        lastCfiRef.current = cfi;

        // Save CFI position
        try {
          localStorage.setItem(`epub-pos-${fileUrl}`, cfi);
        } catch {}

        // Use percentageFromCfi when locations are ready, fallback to spine percentage
        let pct = location.start.percentage;
        if (book.locations.length() > 0) {
          pct = book.locations.percentageFromCfi(cfi);
        }

        const progressPct = Math.round((pct || 0) * 100);
        setProgress(progressPct);
        onProgress?.(progressPct, cfi);
      },
    );

    // Text selection → AI actions popover
    rendition.on(
      "selected",
      (cfiRange: string, contents: { window: Window; document: Document }) => {
        const sel = contents.window.getSelection();
        const text = sel?.toString().trim() || "";
        if (!text || text.length < 3 || !sel || sel.rangeCount === 0) return;
        const iframe = viewerRef.current?.querySelector("iframe");
        if (!iframe) return;
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const iframeRect = iframe.getBoundingClientRect();
        // Snapshot progress at selection time — `progress` from closure may be
        // stale, but `book.locations` is live.
        let pct = 0;
        if (book.locations.length() > 0) {
          pct = Math.round((book.locations.percentageFromCfi(cfiRange) || 0) * 100);
        }
        setAiSelection({
          text,
          rect: {
            top: rect.top + iframeRect.top,
            left: rect.left + iframeRect.left,
            width: rect.width,
            height: rect.height,
          },
          context: extractSurroundingContext(range, text),
          locator: { kind: "cfi", value: cfiRange, label: `${pct}%` },
        });
      },
    );

    // Clear popover when selection is cleared inside the iframe
    // Also: suppress swipes shorter than 60px so text selection doesn't flip pages
    rendition.hooks.content.register((contents: { document: Document }) => {
      contents.document.addEventListener("selectionchange", () => {
        const s = contents.document.getSelection();
        if (!s || s.isCollapsed || !s.toString().trim()) {
          setAiSelection(null);
        }
      });

      let swipeTouchStartX = 0;
      contents.document.addEventListener("touchstart", (e: TouchEvent) => {
        swipeTouchStartX = e.touches[0].clientX;
      }, { passive: true, capture: true });
      contents.document.addEventListener("touchend", (e: TouchEvent) => {
        const delta = Math.abs(e.changedTouches[0].clientX - swipeTouchStartX);
        if (delta < 60) e.stopPropagation();
      }, { capture: true });
    });

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

  const goToPercent = (pct: number) => {
    const book = bookRef.current;
    if (!book || book.locations.length() === 0) return;
    const cfi = book.locations.cfiFromPercentage(pct / 100);
    if (cfi) renditionRef.current?.display(cfi);
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

        {/* Center: progress nav */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => renditionRef.current?.prev()}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
          >
            <IconChevronLeft size={18} />
          </button>
          <span className="text-xs tabular-nums whitespace-nowrap text-center bg-white/15 rounded-full px-3 py-1 font-medium">
            {progress}%
          </span>
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
          <ReaderNotes
            bookId={bookId}
            progress={progress}
            onNavigate={(raw) => {
              const parsed = parsePosition(raw);
              if (parsed.kind === "cfi") {
                renditionRef.current?.display(parsed.value);
              }
            }}
          />
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        {/* EPUB viewer */}
        <div ref={viewerRef} className="h-full w-full" />

        {/* Prev / Next click zones — keep narrow so text selection isn't hijacked */}
        <button
          onClick={() => renditionRef.current?.prev()}
          className="absolute left-0 top-0 h-full w-5 lg:w-8 hidden sm:flex items-center justify-start pl-1 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Previous"
        >
          <IconChevronLeft size={20} className="text-primary/30" />
        </button>
        <button
          onClick={() => renditionRef.current?.next()}
          className="absolute right-0 top-0 h-full w-5 lg:w-8 hidden sm:flex items-center justify-end pr-1 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next"
        >
          <IconChevronRight size={20} className="text-primary/30" />
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

      {/* Bottom progress slider */}
      <div className="flex-shrink-0 flex items-center gap-3 h-9 px-4 bg-primary/5 border-t border-primary/10">
        <div className="relative flex-1 flex items-center group">
          <input
            type="range"
            min={0}
            max={100}
            value={dragging ? dragValue : progress}
            onChange={(e) => {
              const v = Number(e.target.value);
              setDragValue(v);
              if (!dragging) setDragging(true);
            }}
            onMouseUp={() => {
              setProgress(dragValue);
              setDragging(false);
              goToPercent(dragValue);
            }}
            onTouchEnd={() => {
              setProgress(dragValue);
              setDragging(false);
              goToPercent(dragValue);
            }}
            className="w-full h-1.5 appearance-none bg-primary/10 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md
              [&::-webkit-slider-runnable-track]:rounded-full [&::-moz-range-track]:rounded-full"
          />
        </div>
        <span className="text-[11px] font-medium text-primary/70 tabular-nums flex-shrink-0 min-w-[32px] text-right">
          {dragging ? dragValue : progress}%
        </span>
      </div>

      <AiSelectionLayer
        bookId={bookId}
        progress={progress}
        selection={aiSelection}
        onDismiss={() => setAiSelection(null)}
      />
    </div>
  );
};

// Walk up to the nearest block-level ancestor and return its text plus
// the previous and next sibling blocks — used as context for the AI prompt.
function extractSurroundingContext(range: Range, selectionText: string): string {
  const BLOCK_TAGS = new Set([
    "P", "DIV", "LI", "BLOCKQUOTE", "SECTION", "ARTICLE",
    "H1", "H2", "H3", "H4", "H5", "H6", "TD", "DD", "DT",
  ]);
  let node: Node | null = range.commonAncestorContainer;
  while (node && (node.nodeType !== 1 || !BLOCK_TAGS.has((node as Element).tagName))) {
    node = node.parentNode;
  }
  if (!node) return "";
  const block = node as Element;
  const collect = (el: Element | null): string =>
    (el?.textContent || "").replace(/\s+/g, " ").trim();
  const parts = [
    collect(block.previousElementSibling),
    collect(block),
    collect(block.nextElementSibling),
  ].filter(Boolean);
  const joined = parts.join("\n\n");
  // Don't waste tokens echoing the selection back.
  return joined === selectionText.replace(/\s+/g, " ").trim() ? "" : joined;
}
