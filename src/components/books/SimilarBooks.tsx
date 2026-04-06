import { useRef, useState, useEffect } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useSimilarBooks } from "@/hooks/useBooks";
import { BookCard } from "./BookCard";

interface SimilarBooksProps {
  bookId: string | number;
}

export const SimilarBooks = ({ bookId }: SimilarBooksProps) => {
  const { data: books, isLoading } = useSimilarBooks(bookId, 10);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="w-[160px] flex-shrink-0 animate-pulse">
            <div className="aspect-[2/3] rounded-xl bg-muted/40 mb-2" />
            <div className="h-3 bg-muted/40 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!books?.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-5">Похожие книги</h3>
      <ScrollRow>
        {books.slice(0, 10).map((b) => (
          <div key={b.id} className="w-[160px] flex-shrink-0">
            <BookCard book={b} />
          </div>
        ))}
      </ScrollRow>
    </div>
  );
};

function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const check = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    check();
    const el = ref.current;
    el?.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el?.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [children]);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <div className="relative group/scroll">
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-border/60 shadow-md flex items-center justify-center text-foreground/70 hover:text-foreground opacity-0 group-hover/scroll:opacity-100 transition-opacity -ml-2"
        >
          <IconChevronLeft size={18} />
        </button>
      )}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 items-start"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      {canRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-border/60 shadow-md flex items-center justify-center text-foreground/70 hover:text-foreground opacity-0 group-hover/scroll:opacity-100 transition-opacity -mr-2"
        >
          <IconChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
