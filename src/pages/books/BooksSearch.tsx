import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { IconSearch, IconFilter, IconSortDescending, IconUser, IconCheck, IconX } from "@tabler/icons-react";
import { booksApi, genresApi, authorsApi } from "@/lib/api";
import type { Author, Book, Genre } from "@/lib/api";
import { BookCard } from "@/components/books/BookCard";

/* ── Sort options ── */
const SORT_OPTIONS = [
  { value: "", label: "По умолчанию" },
  { value: "newest", label: "Новые" },
  { value: "rating", label: "По рейтингу" },
  { value: "title", label: "По названию" },
] as const;

const PAGE_SIZE = 24;

/** Parse comma-separated IDs from URL param */
const parseIds = (param: string | null): string[] =>
  param ? param.split(",").filter(Boolean) : [];

/** Serialize array of IDs to comma-separated string */
const serializeIds = (ids: string[]): string => ids.join(",");

const BooksSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialGenres = parseIds(searchParams.get("genre"));
  const initialAuthors = parseIds(searchParams.get("author"));
  const initialSort = searchParams.get("sort") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [query, setQuery] = useState(initialQ);
  const [genreIds, setGenreIds] = useState<string[]>(initialGenres);
  const [authorIds, setAuthorIds] = useState<string[]>(initialAuthors);
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
  const [genreSearch, setGenreSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");

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
        genre: serializeIds(genreIds),
        author: serializeIds(authorIds),
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
    [query, genreIds, authorIds, sort, page, setSearchParams],
  );

  /* Fetch books */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const offset = (page - 1) * PAGE_SIZE;
    const hasGenres = genreIds.length > 0;
    const hasAuthors = authorIds.length > 0;
    const genreSet = new Set(genreIds);
    const authorSet = new Set(authorIds);

    const doFetch = async () => {
      try {
        let result: { items: Book[]; total: number };

        if (query.trim()) {
          // Search API doesn't support genre/author filters — filter client-side
          result = await booksApi.search(query.trim(), 50);
          if (hasGenres) {
            result.items = result.items.filter(
              (b) => genreSet.has(b.genre?.id?.toString() ?? ""),
            );
          }
          if (hasAuthors) {
            result.items = result.items.filter(
              (b) => authorSet.has(b.author?.id?.toString() ?? ""),
            );
          }
          result.total = result.items.length;
        } else if (hasAuthors && !hasGenres && authorIds.length === 1) {
          // Single author, no genre — use author endpoint directly
          result = await booksApi.getByAuthor(authorIds[0], { limit: 200 });
          result.total = result.items.length;
        } else if (hasGenres && !hasAuthors && genreIds.length === 1) {
          // Single genre, no author — use genre endpoint directly
          result = await booksApi.getByGenre(genreIds[0], { limit: 200 });
          result.total = result.items.length;
        } else if (hasGenres || hasAuthors) {
          // Multiple filters — fetch per-genre / per-author and merge
          const allItems: Book[] = [];
          const seen = new Set<number>();

          if (hasGenres) {
            const promises = genreIds.map((gid) =>
              booksApi.getByGenre(gid, { limit: 200 }).catch(() => ({ items: [] as Book[], total: 0 })),
            );
            const results = await Promise.all(promises);
            for (const r of results) {
              for (const b of r.items) {
                if (!seen.has(b.id)) { seen.add(b.id); allItems.push(b); }
              }
            }
          } else {
            // Only authors selected — fetch per author
            const promises = authorIds.map((aid) =>
              booksApi.getByAuthor(aid, { limit: 200 }).catch(() => ({ items: [] as Book[], total: 0 })),
            );
            const results = await Promise.all(promises);
            for (const r of results) {
              for (const b of r.items) {
                if (!seen.has(b.id)) { seen.add(b.id); allItems.push(b); }
              }
            }
          }

          // Cross-filter: if both genre & author selected
          let filtered = allItems;
          if (hasGenres && hasAuthors) {
            filtered = allItems.filter(
              (b) => authorSet.has(b.author?.id?.toString() ?? ""),
            );
          }

          result = { items: filtered, total: filtered.length };
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

          // Client-side pagination when filters are active
          if (hasGenres || hasAuthors || query.trim()) {
            const totalFiltered = sorted.length;
            sorted = sorted.slice(offset, offset + PAGE_SIZE);
            setTotal(totalFiltered);
          } else {
            setTotal(result.total);
          }

          setBooks(sorted);
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
  }, [query, genreIds, authorIds, sort, page]);

  /* Derived */
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "По умолчанию";

  const filteredGenres = useMemo(
    () => genreSearch ? genres.filter((g) => g.name.toLowerCase().includes(genreSearch.toLowerCase())) : genres,
    [genres, genreSearch],
  );
  const filteredAuthors = useMemo(
    () => authorSearch ? authors.filter((a) => a.name.toLowerCase().includes(authorSearch.toLowerCase())) : authors,
    [authors, authorSearch],
  );

  /* Handlers */
  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
    updateParams({ q: value, page: "1" });
  };

  const toggleGenre = (id: string) => {
    const next = genreIds.includes(id)
      ? genreIds.filter((g) => g !== id)
      : [...genreIds, id];
    setGenreIds(next);
    setPage(1);
    updateParams({ genre: serializeIds(next), page: "1" });
  };

  const clearGenres = () => {
    setGenreIds([]);
    setPage(1);
    setGenreOpen(false);
    updateParams({ genre: "", page: "1" });
  };

  const toggleAuthor = (id: string) => {
    const next = authorIds.includes(id)
      ? authorIds.filter((a) => a !== id)
      : [...authorIds, id];
    setAuthorIds(next);
    setPage(1);
    updateParams({ author: serializeIds(next), page: "1" });
  };

  const clearAuthors = () => {
    setAuthorIds([]);
    setPage(1);
    setAuthorOpen(false);
    updateParams({ author: "", page: "1" });
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

        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {/* Genre filter (multi-select) */}
          <div className="relative">
            <button
              onClick={() => {
                setGenreOpen(!genreOpen);
                setAuthorOpen(false);
                setSortOpen(false);
                setGenreSearch("");
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                genreIds.length > 0
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <IconFilter size={16} />
              {genreIds.length > 0
                ? `Жанры (${genreIds.length})`
                : "Жанры"}
            </button>

            {genreOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-border bg-background shadow-lg z-50">
                {/* Search within genres */}
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    placeholder="Поиск жанра..."
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    autoFocus
                  />
                </div>
                {genreIds.length > 0 && (
                  <button
                    onClick={clearGenres}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-b border-border"
                  >
                    <IconX size={14} />
                    Сбросить все
                  </button>
                )}
                <div className="max-h-60 overflow-y-auto">
                  {filteredGenres.map((g) => {
                    const isSelected = genreIds.includes(g.id?.toString());
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGenre(g.id?.toString())}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                          isSelected ? "text-primary font-medium bg-primary/5" : ""
                        }`}
                      >
                        <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? "bg-primary border-primary" : "border-border"
                        }`}>
                          {isSelected && <IconCheck size={12} className="text-white" />}
                        </span>
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Author filter (multi-select) */}
          <div className="relative">
            <button
              onClick={() => {
                setAuthorOpen(!authorOpen);
                setGenreOpen(false);
                setSortOpen(false);
                setAuthorSearch("");
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                authorIds.length > 0
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <IconUser size={16} />
              {authorIds.length > 0
                ? `Авторы (${authorIds.length})`
                : "Авторы"}
            </button>

            {authorOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-border bg-background shadow-lg z-50">
                {/* Search within authors */}
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    placeholder="Поиск автора..."
                    value={authorSearch}
                    onChange={(e) => setAuthorSearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    autoFocus
                  />
                </div>
                {authorIds.length > 0 && (
                  <button
                    onClick={clearAuthors}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-b border-border"
                  >
                    <IconX size={14} />
                    Сбросить все
                  </button>
                )}
                <div className="max-h-60 overflow-y-auto">
                  {filteredAuthors.map((a) => {
                    const isSelected = authorIds.includes(a.id?.toString());
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAuthor(a.id?.toString())}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                          isSelected ? "text-primary font-medium bg-primary/5" : ""
                        }`}
                      >
                        <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? "bg-primary border-primary" : "border-border"
                        }`}>
                          {isSelected && <IconCheck size={12} className="text-white" />}
                        </span>
                        {a.name}
                      </button>
                    );
                  })}
                </div>
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

      {/* Active filter chips */}
      {(genreIds.length > 0 || authorIds.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {genreIds.map((gid) => {
            const genre = genres.find((g) => g.id?.toString() === gid);
            if (!genre) return null;
            return (
              <span
                key={`gc-${gid}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {genre.name}
                <button
                  onClick={() => toggleGenre(gid)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <IconX size={12} />
                </button>
              </span>
            );
          })}
          {authorIds.map((aid) => {
            const author = authors.find((a) => a.id?.toString() === aid);
            if (!author) return null;
            return (
              <span
                key={`ac-${aid}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium"
              >
                {author.name}
                <button
                  onClick={() => toggleAuthor(aid)}
                  className="hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
                >
                  <IconX size={12} />
                </button>
              </span>
            );
          })}
          <button
            onClick={() => {
              setGenreIds([]);
              setAuthorIds([]);
              setPage(1);
              updateParams({ genre: "", author: "", page: "1" });
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
          >
            <IconX size={12} />
            Сбросить все
          </button>
        </div>
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
