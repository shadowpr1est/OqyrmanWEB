import { useRef, useState, useEffect } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

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