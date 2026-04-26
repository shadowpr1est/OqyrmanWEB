import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconChevronRight,
  IconBook,
  IconSparkles,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { booksApi, readingSessionsApi, aiApi } from "@/lib/api";
import { fadeLeft, fadeRight, fadeUp } from "@/lib/motion";
import type { Book } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { BookCard } from "@/components/books/BookCard";
import { HorizontalScroll } from "@/components/shared/HorizontalScroll";

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

const COVER_SLOTS = [
  { style: "absolute top-0 left-0 -rotate-6 z-0", fallbackGradient: "from-amber-200 to-amber-400" },
  { style: "absolute top-4 left-[90px] rotate-3 z-10", fallbackGradient: "from-rose-200 to-rose-400" },
  { style: "absolute top-10 left-[170px] -rotate-2 z-0", fallbackGradient: "from-sky-200 to-sky-400" },
];

function HeroCoverStack() {
  const { data } = useQuery({
    queryKey: ["books", "hero-covers"],
    queryFn: () => booksApi.list({ limit: 3 }),
    staleTime: 10 * 60_000,
  });
  const books = data?.items ?? [];

  return (
    <motion.div
      className="flex-1 hidden lg:flex items-center justify-center"
      {...fadeRight}
      transition={{ ...fadeRight.transition, delay: 0.15 }}
    >
      <div className="relative w-[300px] h-[280px]">
        {COVER_SLOTS.map((slot, i) => {
          const book = books[i];
          return (
            <div
              key={i}
              className={`${slot.style} w-[130px] h-[190px] rounded-xl shadow-2xl border-2 border-white/20 overflow-hidden`}
            >
              {book?.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${slot.fallbackGradient} flex items-center justify-center`}>
                  <span className="text-white/50 font-bold text-xs text-center px-3">{book?.title ?? ""}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

const SECTION_STALE = 5 * 60_000; // genre/author sections rarely change

const GenreSection = ({ genre }: { genre: typeof FEATURED_GENRES[number] }) => {
  const { data } = useQuery({
    queryKey: ["books", "by-genre", genre.id],
    queryFn: () => booksApi.getByGenre(genre.id, { limit: 10 }),
    staleTime: SECTION_STALE,
  });
  const books = (data?.items ?? []).slice(0, 10);
  if (!books.length) return null;
  return (
    <Section title={genre.name} linkTo={`/books?genre=${genre.id}`} linkLabel="Все">
      <HorizontalScroll>
        {books.map((book) => (
          <div key={book.id} className="w-[160px] flex-shrink-0">
            <BookCard book={book} />
          </div>
        ))}
      </HorizontalScroll>
    </Section>
  );
};

const AuthorSection = ({ author }: { author: typeof FEATURED_AUTHORS[number] }) => {
  const { data } = useQuery({
    queryKey: ["books", "by-author", author.id],
    queryFn: () => booksApi.getByAuthor(author.id, { limit: 10 }),
    staleTime: SECTION_STALE,
  });
  const books = (data?.items ?? []).slice(0, 10);
  if (!books.length) return null;
  return (
    <Section title={author.name} linkTo={`/authors/${author.id}`} linkLabel="Все книги">
      <HorizontalScroll>
        {books.map((book) => (
          <div key={book.id} className="w-[160px] flex-shrink-0">
            <BookCard book={book} />
          </div>
        ))}
      </HorizontalScroll>
    </Section>
  );
};

const BooksCatalog = () => {
  const { user } = useAuth();

  const { data: sessionsData } = useQuery({
    queryKey: ["reading-sessions"],
    queryFn: readingSessionsApi.list,
    enabled: !!user,
    staleTime: 30_000,
    select: (data) => (data.items || []).filter((s) => s.status === "reading"),
  });
  const sessions = sessionsData ?? [];

  /* AI recommendations — sessionStorage cache (6h) used as queryFn */
  const [recommendedBooks, setRecommendedBooks] = useState<Book[] | null>(null);
  useEffect(() => {
    if (!user) return;
    const cacheKey = `ai-recs-${user.id}`;
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      try {
        const { books, exp } = JSON.parse(raw);
        if (Date.now() < exp) { setRecommendedBooks(books); return; }
      } catch {}
    }
    aiApi
      .recommendBooks()
      .then((res) => {
        const books = res.items || [];
        sessionStorage.setItem(cacheKey, JSON.stringify({ books, exp: Date.now() + 6 * 60 * 60 * 1000 }));
        setRecommendedBooks(books);
      })
      .catch(() => setRecommendedBooks([]));
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Poster ── */}
      <section className="relative overflow-hidden rounded-b-3xl">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-primary">
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
          <div className="flex flex-col lg:flex-row items-center gap-8 py-12 lg:py-16">
            {/* Left text */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              {...fadeLeft}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-emerald-200 text-xs font-medium mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                200+ книг доступно
              </div>
              <h1 className="font-display text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-4 tracking-tight">
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
            <HeroCoverStack />
          </div>

          {/* Stats bar */}
          <motion.div
            className="flex justify-center gap-8 md:gap-16 pb-8 text-center"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
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
                      <div className="flex items-center justify-end text-xs text-muted-foreground mb-1">
                        <span>{s.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* ── AI Recommendations ── */}
        {user && recommendedBooks !== null && recommendedBooks.length > 0 && (
          <Section
            title="Рекомендации для вас"
            icon={<IconSparkles size={20} className="text-amber-500" />}
          >
            <HorizontalScroll>
              {recommendedBooks.map((book) => (
                <div key={book.id} className="w-[160px] flex-shrink-0">
                  <BookCard book={book} />
                </div>
              ))}
            </HorizontalScroll>
          </Section>
        )}

        {/* ── AI Recommendations skeleton (loading) ── */}
        {user && recommendedBooks === null && (
          <Section
            title="Рекомендации для вас"
            icon={<IconSparkles size={20} className="text-amber-500" />}
          >
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[160px] flex-shrink-0">
                  <div className="w-full aspect-[2/3] rounded-xl bg-muted animate-pulse" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="mt-1.5 h-3 w-1/2 rounded bg-muted animate-pulse" />
                </div>
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
              sections.push(<GenreSection key={`g-${FEATURED_GENRES[i].id}`} genre={FEATURED_GENRES[i]} />);
            }
            if (i < FEATURED_AUTHORS.length) {
              sections.push(<AuthorSection key={`a-${FEATURED_AUTHORS[i].id}`} author={FEATURED_AUTHORS[i]} />);
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
        <h2 className="flex items-center gap-2 section-title">
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

export default BooksCatalog;
