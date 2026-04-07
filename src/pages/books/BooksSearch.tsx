import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { IconSearch, IconFilter, IconSortDescending, IconUser } from "@tabler/icons-react";
import { booksApi, genresApi, authorsApi } from "@/lib/api";
import type { Author, Book, Genre } from "@/lib/api";
import { BookCard } from "@/components/books/BookCard";

/* ── Sort options ── */
const SORT_OPTIONS = [
  { value: "", label: "По умолчанию" },
  { value: "popular", label: "Популярные" },
  { value: "newest", label: "Новые" },
  { value: "rating", label: "По рейтингу" },
  { value: "title", label: "По названию" },
] as const;

const PAGE_SIZE = 20;

const BooksSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialGenre = searchParams.get("genre") || "";
  const initialAuthor = searchParams.get("author") || "";
  const initialSort = searchParams.get("sort") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [query, setQuery] = useState(initialQ);
  const [genreId, setGenreId] = useState(initialGenre);
  const [authorId, setAuthorId] = useState(initialAuthor);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  /* Load genres & authors once */
  useEffect(() => {
    genresApi.list().then((g) => setGenres(Array.isArray(g) ? g : [])).catch(() => {});
    authorsApi.list({ limit: 200 }).then((res) => setAuthors(res.items || [])).catch(() => {});
  }, []);

  /* Sync URL params */
  const updateParams = useCallback(
    (overrides: Record<string, string>) => {
      const next: Record<string, string> = {};
      const merged = {
        q: query,
        genre: genreId,
        author: authorId,
        sort,
        page: String(page),
        ...overrides,
      };
      for (const [k, v] of Object.entries(merged)) {
        if (v && v !== "1" && k === "page") next[k] = v;
        else if (v && k !== "page") next[k] = v;
      }
      // keep page if > 1
      if (merged.page && Number(merged.page) > 1) next.page = merged.page;
      setSearchParams(next, { replace: true });
    },
    [query, genreId, authorId, sort, page, setSearchParams],
  );

  /* Fetch books */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const offset = (page - 1) * PAGE_SIZE;

    const doFetch = async () => {
      try {
        let result: { items: Book[]; total: number };

        if (query.trim()) {
          result = await booksApi.search(query.trim(), PAGE_SIZE);
          // client-side filters for search (API search doesn't support them)
          if (genreId) {
            result.items = result.items.filter(
              (b) => b.genre?.id?.toString() === genreId,
            );
          }
          if (authorId) {
            result.items = result.items.filter(
              (b) => b.author?.id?.toString() === authorId,
            );
          }
          result.total = result.items.length;
        } else if (authorId) {
          result = await booksApi.getByAuthor(authorId, {
            limit: PAGE_SIZE,
            offset,
          });
          if (genreId) {
            result.items = result.items.filter(
              (b) => b.genre?.id?.toString() === genreId,
            );
            result.total = result.items.length;
          }
        } else if (genreId) {
          result = await booksApi.getByGenre(genreId, {
            limit: PAGE_SIZE,
            offset,
          });
        } else {
          result = await booksApi.list({ limit: PAGE_SIZE, offset, sort });
        }

        if (!cancelled) {
          // client-side sorting
          let sorted = [...result.items];
          if (sort === "rating") {
            sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
          } else if (sort === "newest") {
            sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
          } else if (sort === "title") {
            sorted.sort((a, b) => a.title.localeCompare(b.title, "ru"));
          }

          setBooks(sorted);
          setTotal(result.total);
        }
      } catch {
        if (!cancelled) {
          setBooks([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();
    return () => {
      cancelled = true;
    };
  }, [query, genreId, authorId, sort, page]);

  /* Derived */
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "По умолчанию";
  const selectedGenre = genres.find((g) => g.id?.toString() === genreId);
  const selectedAuthor = authors.find((a) => a.id?.toString() === authorId);

  /* Handlers */
  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
    updateParams({ q: value, page: "1" });
  };

  const handleGenre = (id: string) => {
    const next = genreId === id ? "" : id;
    setGenreId(next);
    setPage(1);
    setGenreOpen(false);
    updateParams({ genre: next, page: "1" });
  };

  const handleAuthor = (id: string) => {
    const next = authorId === id ? "" : id;
    setAuthorId(next);
    setPage(1);
    setAuthorOpen(false);
    updateParams({ author: next, page: "1" });
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
    setSortOpen(false);
    updateParams({ sort: value, page: "1" });
  };

  const handlePage = (p: number) => {
    setPage(p);
    updateParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Pagination range ── */
  const pageRange = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-foreground">Каталог книг</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {total} {pluralBooks(total)} в каталоге
      </p>

      {/* Search + filters row */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="поиск книг"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Genre filter */}
          <div className="relative">
            <button
              onClick={() => {
                setGenreOpen(!genreOpen);
                setAuthorOpen(false);
                setSortOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                genreId
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <IconFilter size={16} />
              {selectedGenre?.name || "Жанры"}
            </button>

            {genreOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 max-h-72 overflow-y-auto rounded-xl border border-border bg-background shadow-lg z-50">
                <button
                  onClick={() => handleGenre("")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                    !genreId ? "text-primary font-medium" : ""
                  }`}
                >
                  Все жанры
                </button>
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleGenre(g.id?.toString())}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                      genreId === g.id?.toString()
                        ? "text-primary font-medium bg-primary/5"
                        : ""
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Author filter */}
          <div className="relative">
            <button
              onClick={() => {
                setAuthorOpen(!authorOpen);
                setGenreOpen(false);
                setSortOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                authorId
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <IconUser size={16} />
              {selectedAuthor?.name || "Авторы"}
            </button>

            {authorOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-72 overflow-y-auto rounded-xl border border-border bg-background shadow-lg z-50">
                <button
                  onClick={() => handleAuthor("")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                    !authorId ? "text-primary font-medium" : ""
                  }`}
                >
                  Все авторы
                </button>
                {authors.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleAuthor(a.id?.toString())}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                      authorId === a.id?.toString()
                        ? "text-primary font-medium bg-primary/5"
                        : ""
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => {
                setSortOpen(!sortOpen);
                setGenreOpen(false);
                setAuthorOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors"
            >
              <IconSortDescending size={16} />
              {currentSortLabel}
            </button>

            {sortOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 rounded-xl border border-border bg-background shadow-lg z-50">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSort(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                      sort === opt.value
                        ? "text-primary font-medium bg-primary/5"
                        : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(genreOpen || authorOpen || sortOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setGenreOpen(false);
            setAuthorOpen(false);
            setSortOpen(false);
          }}
        />
      )}

      {/* Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-xl bg-muted/60" />
                <div className="mt-3 h-3.5 w-3/4 rounded bg-muted/60" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <IconSearch size={40} strokeWidth={1.5} className="mb-3 opacity-40" />
            <p className="text-sm">Книги не найдены</p>
            {query && (
              <p className="text-xs mt-1">
                Попробуйте изменить поисковый запрос
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="mt-10 flex items-center justify-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => handlePage(page - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            &lt;
          </button>

          {pageRange.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-muted-foreground text-sm">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handlePage(p as number)}
                className={`min-w-[36px] px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                  page === p
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            disabled={page >= totalPages}
            onClick={() => handlePage(page + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Helpers ── */
function pluralBooks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "книга";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "книги";
  return "книг";
}

export default BooksSearch;
