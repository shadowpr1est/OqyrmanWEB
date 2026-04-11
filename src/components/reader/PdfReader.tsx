import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
  IconArrowsMaximize,
  IconArrowAutofitWidth,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ReaderNotes } from "./ReaderNotes";

// pdf.js worker — import from node_modules for correct version
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfReaderProps {
  fileUrl: string;
  bookId: string;
  bookTitle: string;
  initialPage?: number;
  onProgress?: (page: number, total: number) => void;
}

type FitMode = "page" | "width";

export const PdfReader = ({
  fileUrl,
  bookId,
  bookTitle,
  initialPage = 1,
  onProgress,
}: PdfReaderProps) => {
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });
  const [intrinsicSize, setIntrinsicSize] = useState<{ w: number; h: number } | null>(null);
  const [customScale, setCustomScale] = useState<number | null>(null); // null = fit mode
  const [fitMode, setFitMode] = useState<FitMode>("page");

  // Refs for stable keyboard handler
  const pageRef = useRef(pageNumber);
  const numPagesRef = useRef(numPages);
  pageRef.current = pageNumber;
  numPagesRef.current = numPages;

  // Load intrinsic page dimensions via pdfjs
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const pdf = await pdfjs.getDocument(fileUrl).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        if (!cancelled) setIntrinsicSize({ w: vp.width, h: vp.height });
      } catch {
        /* ignore */
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fileUrl]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      onProgress?.(initialPage, total);
    },
    [initialPage, onProgress],
  );

  const goTo = useCallback(
    (page: number) => {
      setPageNumber((prev) => {
        const p = Math.max(1, Math.min(page, numPagesRef.current));
        if (p !== prev) onProgress?.(p, numPagesRef.current);
        return p;
      });
    },
    [onProgress],
  );

  // Container resize observer
  const observerRef = useRef<ResizeObserver | null>(null);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    ro.observe(node);
    observerRef.current = ro;
    setContainerSize({ w: node.clientWidth, h: node.clientHeight });
  }, []);

  // Compute effective scale
  const computedScale = useMemo(() => {
    if (customScale !== null) return customScale;
    if (!intrinsicSize) return null; // not ready yet
    const pad = 48;
    if (fitMode === "page") {
      return Math.min(
        (containerSize.h - pad) / intrinsicSize.h,
        (containerSize.w - pad) / intrinsicSize.w,
      );
    }
    return (containerSize.w - pad) / intrinsicSize.w;
  }, [customScale, fitMode, containerSize, intrinsicSize]);

  const zoomPercent = computedScale ? Math.round(computedScale * 100) : 100;

  const getCurrentScale = useCallback(() => {
    if (customScale !== null) return customScale;
    if (!intrinsicSize) return 1;
    const pad = 48;
    if (fitMode === "page") {
      return Math.min(
        (containerSize.h - pad) / intrinsicSize.h,
        (containerSize.w - pad) / intrinsicSize.w,
      );
    }
    return (containerSize.w - pad) / intrinsicSize.w;
  }, [customScale, fitMode, containerSize, intrinsicSize]);

  const zoomIn = useCallback(() => {
    setCustomScale(Math.min(getCurrentScale() + 0.15, 4));
  }, [getCurrentScale]);

  const zoomOut = useCallback(() => {
    setCustomScale(Math.max(getCurrentScale() - 0.15, 0.25));
  }, [getCurrentScale]);

  const fitPage = useCallback(() => {
    setCustomScale(null);
    setFitMode("page");
  }, []);

  const fitWidth = useCallback(() => {
    setCustomScale(null);
    setFitMode("width");
  }, []);

  // Global keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(pageRef.current - 1);
      else if (e.key === "ArrowRight") goTo(pageRef.current + 1);
      else if (e.key === "Escape") navigate(-1);
    };
    document.addEventListener("keyup", handler);
    return () => document.removeEventListener("keyup", handler);
  }, [goTo, navigate]);

  // Page render props: use scale if ready, otherwise fallback to width
  const pageRenderProps = computedScale !== null
    ? { scale: computedScale }
    : { width: Math.min(containerSize.w - 48, 900) };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#faf9f6]">
      {/* Toolbar — 3-section layout matching EPUB reader */}
      <div className="flex-shrink-0 flex items-center justify-between h-12 px-4 bg-white border-b border-border/60">
        {/* Left: back + title */}
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
            onClick={() => goTo(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors disabled:opacity-30"
          >
            <IconChevronLeft size={18} />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap min-w-[60px] text-center">
            {pageNumber} / {numPages || "…"}
          </span>
          <button
            onClick={() => goTo(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors disabled:opacity-30"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        {/* Right: zoom controls */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          <button
            onClick={fitPage}
            className={`p-2 rounded-lg transition-colors ${
              customScale === null && fitMode === "page"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/60"
            }`}
            title="По странице"
          >
            <IconArrowsMaximize size={18} stroke={1.5} />
          </button>
          <button
            onClick={fitWidth}
            className={`p-2 rounded-lg transition-colors ${
              customScale === null && fitMode === "width"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/60"
            }`}
            title="По ширине"
          >
            <IconArrowAutofitWidth size={18} stroke={1.5} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <IconZoomOut size={18} stroke={1.5} />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-center">
            {zoomPercent}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <IconZoomIn size={18} stroke={1.5} />
          </button>
          <div className="w-px h-5 bg-border/60 mx-0.5" />
          <ReaderNotes bookId={bookId} currentPage={pageNumber} />
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="h-full overflow-auto flex justify-center py-4"
        >
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
            error={
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Не удалось загрузить PDF</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              {...pageRenderProps}
              className="shadow-lg rounded-lg overflow-hidden"
            />
          </Document>
        </div>

        {/* Prev / Next touch zones */}
        <button
          onClick={() => goTo(pageNumber - 1)}
          className="absolute left-0 top-0 h-full w-16 sm:w-24 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Previous"
        >
          <IconChevronLeft size={24} className="text-foreground/30" />
        </button>
        <button
          onClick={() => goTo(pageNumber + 1)}
          className="absolute right-0 top-0 h-full w-16 sm:w-24 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next"
        >
          <IconChevronRight size={24} className="text-foreground/30" />
        </button>
      </div>

      {/* Bottom progress bar */}
      <div className="flex-shrink-0 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: numPages ? `${(pageNumber / numPages) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
};
