import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconChevronRight,
  IconChevronLeft,
  IconBook,
  IconArrowRight,
} from "@tabler/icons-react";
import { booksApi, genresApi, readingSessionsApi } from "@/lib/api";
import type { Book, Genre, ReadingSession } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { BookCard } from "@/components/books/BookCard";

/* ── Featured authors for "By Author" sections ── */
const FEATURED_AUTHORS = [
  { id: "22222222-0000-0000-0000-000000000001", name: "Абай Кунанбаев" },
  { id: "22222222-0000-0000-0000-000000000009", name: "Фёдор Достоевский" },
  { id: "22222222-0000-0000-0000-000000000008", name: "Лев Толстой" },
  { id: "22222222-0000-0000-0000-000000000019", name: "Джордж Оруэлл" },
  { id: "22222222-0000-0000-0000-000000000002", name: "Мухтар Ауэзов" },
];

/* ── Featured genres ── */
const FEATURED_GENRES = [
  { id: "11111111-0000-0000-0000-000000000001", name: "Классика", slug: "classic" },
  { id: "11111111-0000-0000-0000-000000000005", name: "Казахская проза", slug: "kazakh-prose" },
  { id: "11111111-0000-0000-0000-000000000003", name: "Детектив", slug: "detective" },
  { id: "11111111-0000-0000-0000-000000000002", name: "Фантастика", slug: "sci-fi" },
  { id: "11111111-0000-0000-0000-000000000009", name: "Приключения", slug: "adventure" },
  { id: "11111111-0000-0000-0000-000000000010", name: "Современная проза", slug: "modern-prose" },
];

/* ════════════════════════════════════════════════════════════════════════════ */

const BooksCatalog = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [genreBooks, setGenreBooks] = useState<Record<string, Book[]>>({});
  const [authorBooks, setAuthorBooks] = useState<Record<string, Book[]>>({});
  const [allGenres, setAllGenres] = useState<Genre[]>([]);

  /* Fetch reading sessions */
  useEffect(() => {
    if (!user) return;
    readingSessionsApi
      .list()
      .then((res) => setSessions((res.items || []).filter((s) => s.status === "reading")))
      .catch(() => {});
  }, [user]);

  /* Fetch genres list */
  useEffect(() => {
    genresApi.list().then(setAllGenres).catch(() => {});
  }, []);

  /* Fetch books per genre */
  useEffect(() => {
    FEATURED_GENRES.forEach((g) => {
      booksApi
        .getByGenre(g.id as unknown as number, { limit: 10 })
        .then((res) => setGenreBooks((prev) => ({ ...prev, [g.id]: (res.items || []).slice(0, 10) })))
        .catch(() => {});
    });
  }, []);

  /* Fetch books per author */
  useEffect(() => {
    FEATURED_AUTHORS.forEach((a) => {
      booksApi
        .getByAuthor(a.id as unknown as number, { limit: 10 })
        .then((res) => setAuthorBooks((prev) => ({ ...prev, [a.id]: (res.items || []).slice(0, 10) })))
        .catch(() => {});
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Poster ── */}
      <section className="relative overflow-hidden rounded-b-3xl">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[#1E5945]">
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[100px]" />
          <div className="absolute -bottom-32 -left-20 w-[350px] h-[350px] rounded-full bg-teal-300/10 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 py-12 md:py-16">
            {/* Left text */}
            <motion.div
              className="flex-1 text-center md:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-emerald-200 text-xs font-medium mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                200+ книг доступно
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] mb-4 tracking-tight">
                Читай. Открывай.
                <br />
                <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                  Вдохновляйся.
                </span>
              </h1>
              <p className="text-emerald-100/70 text-sm md:text-base max-w-md mb-2 leading-relaxed">
                Казахские и мировые авторы в одном месте. Бронируй книги в ближайшей библиотеке и следи за своим прогрессом.
              </p>
            </motion.div>

            {/* Right — floating book covers */}
            <motion.div
              className="flex-1 hidden md:flex items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="relative w-[300px] h-[280px]">
                {/* Decorative book covers */}
                <div className="absolute top-0 left-0 w-[130px] h-[190px] rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-2xl -rotate-6 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-amber-900/60 font-bold text-xs text-center px-3">Абай<br/>Қара сөз</span>
                </div>
                <div className="absolute top-4 left-[90px] w-[130px] h-[190px] rounded-xl bg-gradient-to-br from-rose-200 to-rose-400 shadow-2xl rotate-3 border-2 border-white/20 flex items-center justify-center z-10">
                  <span className="text-rose-900/60 font-bold text-xs text-center px-3">Достоевский<br/>Преступление и наказание</span>
                </div>
                <div className="absolute top-10 left-[170px] w-[130px] h-[190px] rounded-xl bg-gradient-to-br from-sky-200 to-sky-400 shadow-2xl -rotate-2 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-sky-900/60 font-bold text-xs text-center px-3">Ауэзов<br/>Путь Абая</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            className="flex justify-center gap-8 md:gap-16 pb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { value: "200+", label: "Книг" },
              { value: "50+", label: "Авторов" },
              { value: "10+", label: "Библиотек" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-emerald-200/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-10 space-y-12">
        {/* ── Continue Reading ── */}
        {user && sessions.length > 0 && (
          <Section title="Продолжить чтение" icon={<IconBook size={20} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  to={`/books/${s.book?.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-white hover:shadow-md transition-shadow group"
                >
                  {s.book?.cover_url ? (
                    <img
                      src={s.book.cover_url}
                      alt={s.book.title}
                      className="w-16 h-22 rounded-lg object-cover flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-22 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                      <IconBook size={24} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {s.book?.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.book?.author_name}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Страница {s.current_page}</span>
                        <span>{s.book?.total_pages ? Math.round((s.current_page / s.book.total_pages) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${s.book?.total_pages ? (s.current_page / s.book.total_pages) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* ── Genre chips ── */}
        {allGenres.length > 0 && (
          <Section title="Жанры">
            <div className="flex flex-wrap gap-2">
              {allGenres.map((g) => (
                <Link
                  key={g.id}
                  to={`/books?genre=${g.id}`}
                  className="px-4 py-2 rounded-xl border border-border/60 bg-white text-sm font-medium text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* ── Books by Genre & Author (interleaved) ── */}
        {(() => {
          const sections: React.ReactNode[] = [];
          const maxLen = Math.max(FEATURED_GENRES.length, FEATURED_AUTHORS.length);
          for (let i = 0; i < maxLen; i++) {
            if (i < FEATURED_GENRES.length) {
              const g = FEATURED_GENRES[i];
              const books = genreBooks[g.id];
              if (books && books.length > 0) {
                sections.push(
                  <Section key={`g-${g.id}`} title={g.name} linkTo={`/books?genre=${g.id}`} linkLabel="Все">
                    <HorizontalScroll>
                      {books.map((book) => (
                        <div key={book.id} className="w-[160px] flex-shrink-0">
                          <BookCard book={book} />
                        </div>
                      ))}
                    </HorizontalScroll>
                  </Section>
                );
              }
            }
            if (i < FEATURED_AUTHORS.length) {
              const a = FEATURED_AUTHORS[i];
              const books = authorBooks[a.id];
              if (books && books.length > 0) {
                sections.push(
                  <Section key={`a-${a.id}`} title={a.name} linkTo={`/authors/${a.id}`} linkLabel="Все книги">
                    <HorizontalScroll>
                      {books.map((book) => (
                        <div key={book.id} className="w-[160px] flex-shrink-0">
                          <BookCard book={book} />
                        </div>
                      ))}
                    </HorizontalScroll>
                  </Section>
                );
              }
            }
          }
          return sections;
        })()}
      </div>
    </div>
  );
};

/* ══════════════════════ Helpers ══════════════════════ */

function Section({
  title,
  icon,
  linkTo,
  linkLabel,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  linkTo?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground">
          {icon}
          {title}
        </h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {linkLabel || "Все"}
            <IconChevronRight size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
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

export default BooksCatalog;
