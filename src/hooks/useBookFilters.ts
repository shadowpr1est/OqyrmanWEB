import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { booksApi, genresApi, authorsApi } from "@/lib/api";
import type { Author, Book, Genre } from "@/lib/api";

export const PAGE_SIZE = 24;

const parseIds = (param: string | null): string[] =>
  param ? param.split(",").filter(Boolean) : [];

const serializeIds = (ids: string[]): string => ids.join(",");

export interface BookFiltersState {
  query: string;
  genreIds: string[];
  authorIds: string[];
  sort: string;
  page: number;
  books: Book[];
  total: number;
  loading: boolean;
  genres: Genre[];
  authors: Author[];
  totalPages: number;
  currentSortLabel: string;
  filteredGenres: Genre[];
  filteredAuthors: Author[];
  pageRange: (number | "...")[];
  genreSearch: string;
  authorSearch: string;
  setGenreSearch: (v: string) => void;
  setAuthorSearch: (v: string) => void;
  handleSearch: (v: string) => void;
  toggleGenre: (id: string) => void;
  clearGenres: () => void;
  toggleAuthor: (id: string) => void;
  clearAuthors: () => void;
  handleSort: (v: string) => void;
  handlePage: (p: number) => void;
  clearAll: () => void;
}

const SORT_OPTIONS = [
  { value: "", label: "По умолчанию" },
  { value: "newest", label: "Новые" },
  { value: "rating", label: "По рейтингу" },
  { value: "title", label: "По названию" },
] as const;

export const useBookFilters = (): BookFiltersState => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [genreIds, setGenreIds] = useState<string[]>(parseIds(searchParams.get("genre")));
  const [authorIds, setAuthorIds] = useState<string[]>(parseIds(searchParams.get("author")));
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genreSearch, setGenreSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");

  useEffect(() => {
    genresApi.list().then((g) => setGenres(Array.isArray(g) ? g : [])).catch(() => {});
    authorsApi.list({ limit: 200 }).then((res) => setAuthors(res.items || [])).catch(() => {});
  }, []);

  const updateParams = useCallback(
    (overrides: Record<string, string>) => {
      const merged = { q: query, genre: serializeIds(genreIds), author: serializeIds(authorIds), sort, page: String(page), ...overrides };
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(merged)) {
        if (k === "page") { if (Number(v) > 1) next[k] = v; }
        else if (v) next[k] = v;
      }
      setSearchParams(next, { replace: true });
    },
    [query, genreIds, authorIds, sort, page, setSearchParams],
  );

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
          result = await booksApi.search(query.trim(), 50);
          if (hasGenres) result.items = result.items.filter((b) => genreSet.has(b.genre?.id?.toString() ?? ""));
          if (hasAuthors) result.items = result.items.filter((b) => authorSet.has(b.author?.id?.toString() ?? ""));
          result.total = result.items.length;
        } else if (hasAuthors && !hasGenres && authorIds.length === 1) {
          result = await booksApi.getByAuthor(authorIds[0], { limit: 200 });
          result.total = result.items.length;
        } else if (hasGenres && !hasAuthors && genreIds.length === 1) {
          result = await booksApi.getByGenre(genreIds[0], { limit: 200 });
          result.total = result.items.length;
        } else if (hasGenres || hasAuthors) {
          const allItems: Book[] = [];
          const seen = new Set<number>();

          if (hasGenres) {
            const results = await Promise.all(genreIds.map((gid) => booksApi.getByGenre(gid, { limit: 200 }).catch(() => ({ items: [] as Book[], total: 0 }))));
            for (const r of results) for (const b of r.items) if (!seen.has(b.id)) { seen.add(b.id); allItems.push(b); }
          } else {
            const results = await Promise.all(authorIds.map((aid) => booksApi.getByAuthor(aid, { limit: 200 }).catch(() => ({ items: [] as Book[], total: 0 }))));
            for (const r of results) for (const b of r.items) if (!seen.has(b.id)) { seen.add(b.id); allItems.push(b); }
          }

          let filtered = allItems;
          if (hasGenres && hasAuthors) filtered = allItems.filter((b) => authorSet.has(b.author?.id?.toString() ?? ""));
          result = { items: filtered, total: filtered.length };
        } else {
          result = await booksApi.list({ limit: PAGE_SIZE, offset, sort });
        }

        if (!cancelled) {
          let sorted = [...result.items];
          if (sort === "rating") sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
          else if (sort === "newest") sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
          else if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title, "ru"));

          if (hasGenres || hasAuthors || query.trim()) {
            setTotal(sorted.length);
            sorted = sorted.slice(offset, offset + PAGE_SIZE);
          } else {
            setTotal(result.total);
          }
          setBooks(sorted);
        }
      } catch {
        if (!cancelled) { setBooks([]); setTotal(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();
    return () => { cancelled = true; };
  }, [query, genreIds, authorIds, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "По умолчанию";

  const filteredGenres = useMemo(
    () => genreSearch ? genres.filter((g) => g.name.toLowerCase().includes(genreSearch.toLowerCase())) : genres,
    [genres, genreSearch],
  );
  const filteredAuthors = useMemo(
    () => authorSearch ? authors.filter((a) => a.name.toLowerCase().includes(authorSearch.toLowerCase())) : authors,
    [authors, authorSearch],
  );

  const pageRange = useMemo<(number | "...")[]>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  const handleSearch = (value: string) => { setQuery(value); setPage(1); updateParams({ q: value, page: "1" }); };
  const toggleGenre = (id: string) => {
    const next = genreIds.includes(id) ? genreIds.filter((g) => g !== id) : [...genreIds, id];
    setGenreIds(next); setPage(1); updateParams({ genre: serializeIds(next), page: "1" });
  };
  const clearGenres = () => { setGenreIds([]); setPage(1); updateParams({ genre: "", page: "1" }); };
  const toggleAuthor = (id: string) => {
    const next = authorIds.includes(id) ? authorIds.filter((a) => a !== id) : [...authorIds, id];
    setAuthorIds(next); setPage(1); updateParams({ author: serializeIds(next), page: "1" });
  };
  const clearAuthors = () => { setAuthorIds([]); setPage(1); updateParams({ author: "", page: "1" }); };
  const handleSort = (value: string) => { setSort(value); setPage(1); updateParams({ sort: value, page: "1" }); };
  const handlePage = (p: number) => { setPage(p); updateParams({ page: String(p) }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const clearAll = () => { setGenreIds([]); setAuthorIds([]); setPage(1); updateParams({ genre: "", author: "", page: "1" }); };

  return {
    query, genreIds, authorIds, sort, page,
    books, total, loading, genres, authors,
    totalPages, currentSortLabel, filteredGenres, filteredAuthors, pageRange,
    genreSearch, authorSearch, setGenreSearch, setAuthorSearch,
    handleSearch, toggleGenre, clearGenres, toggleAuthor, clearAuthors, handleSort, handlePage, clearAll,
  };
};
