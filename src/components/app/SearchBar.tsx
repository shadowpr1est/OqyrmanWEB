import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IconSearch, IconBook, IconUser, IconX, IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { booksApi, authorsApi } from "@/lib/api";
import type { Book, Author } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

type Tab = "book" | "author";

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("book");
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const searchBooks = useCallback(async (q: string) => {
    if (q.length < 2) { setBooks([]); return; }
    setLoading(true);
    try {
      const res = await booksApi.search(q, 5);
      setBooks(res.items?.slice(0, 5) || []);
    } catch { setBooks([]); }
    finally { setLoading(false); }
  }, []);

  const searchAuthors = useCallback(async (q: string) => {
    if (q.length < 2) { setAuthors([]); return; }
    setLoading(true);
    try {
      const res = await authorsApi.search(q);
      setAuthors(res.items?.slice(0, 5) || []);
    } catch { setAuthors([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "book") searchBooks(debouncedQuery);
    else searchAuthors(debouncedQuery);
  }, [debouncedQuery, tab, searchBooks, searchAuthors]);

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const results = tab === "book" ? books : authors;
  const hasQuery = query.length >= 2;

  return (
    <div ref={containerRef} className="relative" role="search" aria-label="Поиск книг и авторов">
      {/* Search trigger / input */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Поиск"
        tabIndex={open ? -1 : 0}
        className={`flex items-center gap-2 rounded-xl border transition-all ${
          open
            ? "border-primary/40 bg-white shadow-md w-[320px] lg:w-[400px]"
            : "border-border/60 bg-muted/30 hover:bg-muted/60 w-[200px] lg:w-[280px] cursor-pointer"
        }`}
        onClick={() => {
          if (!open) {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
        <IconSearch size={16} stroke={1.5} className="ml-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "book" ? "Поиск книг..." : "Поиск авторов..."}
            aria-autocomplete="list"
            aria-controls="search-results"
            className="flex-1 py-2 pr-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
          />
        ) : (
          <span className="flex-1 py-2 text-sm text-muted-foreground" aria-hidden="true">Поиск...</span>
        )}
        {open && query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Очистить поиск"
            className="pr-3 text-muted-foreground hover:text-foreground"
          >
            <IconX size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-border/60 bg-white shadow-lg overflow-hidden z-50">
          {/* Tabs */}
          <div role="tablist" aria-label="Тип поиска" className="flex border-b border-border/60">
            <button
              role="tab"
              aria-selected={tab === "book"}
              onClick={() => setTab("book")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === "book"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconBook size={15} aria-hidden="true" />
              Книга
            </button>
            <button
              role="tab"
              aria-selected={tab === "author"}
              onClick={() => setTab("author")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === "author"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconUser size={15} aria-hidden="true" />
              Автор
            </button>
          </div>

          {/* Results */}
          <div id="search-results" role="listbox" aria-label="Результаты поиска" className="max-h-[320px] overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">Ищем...</div>
            )}

            {!loading && !hasQuery && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Введите минимум 2 символа
              </div>
            )}

            {!loading && hasQuery && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </div>
            )}

            {!loading && tab === "book" && books.map((b) => (
              <button
                key={b.id}
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(`/books/${b.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                {b.cover_url ? (
                  <img src={b.cover_url} alt={b.title} className="w-9 h-12 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-12 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                    <IconBook size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {b.author?.name}{b.year ? ` · ${b.year}` : ""}
                  </p>
                </div>
              </button>
            ))}

            {!loading && tab === "author" && authors.map((a) => (
              <button
                key={a.id}
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(`/authors/${a.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                {a.photo_url ? (
                  <img src={a.photo_url} alt={a.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                    <IconUser size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  {a.bio && <p className="text-xs text-muted-foreground truncate">{a.bio}</p>}
                </div>
              </button>
            ))}
          </div>

          {/* Advanced search button */}
          <button
            onClick={() => {
              setOpen(false);
              setQuery("");
              navigate(`/books${query ? `?q=${encodeURIComponent(query)}` : ""}`);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-border/60 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <IconAdjustmentsHorizontal size={14} />
            Расширенный поиск книг
          </button>
        </div>
      )}
    </div>
  );
};
