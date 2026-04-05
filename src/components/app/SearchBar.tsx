import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IconSearch } from "@tabler/icons-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { booksApi, authorsApi } from "@/lib/api";
import type { Book, Author } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setBooks([]);
      setAuthors([]);
      return;
    }
    setLoading(true);
    try {
      const [booksRes, authorsRes] = await Promise.all([
        booksApi.search(q, 5),
        authorsApi.search(q),
      ]);
      setBooks(booksRes.items || []);
      setAuthors(authorsRes.items?.slice(0, 3) || []);
    } catch {
      setBooks([]);
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-sm text-muted-foreground w-[200px] lg:w-[280px]"
      >
        <IconSearch size={16} stroke={1.5} />
        <span className="flex-1 text-left">Поиск...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/80 bg-white px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Поиск книг, авторов..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Ищем..." : query.length < 2 ? "Введите минимум 2 символа" : "Ничего не найдено"}
          </CommandEmpty>

          {books.length > 0 && (
            <CommandGroup heading="Книги">
              {books.map((b) => (
                <CommandItem
                  key={`book-${b.id}`}
                  onSelect={() => handleSelect(`/books/${b.id}`)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {b.cover_url ? (
                    <img
                      src={b.cover_url}
                      alt={b.title}
                      className="w-8 h-11 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-11 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {b.author?.name} · {b.year}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {authors.length > 0 && (
            <CommandGroup heading="Авторы">
              {authors.map((a) => (
                <CommandItem
                  key={`author-${a.id}`}
                  onSelect={() => handleSelect(`/authors/${a.id}`)}
                  className="cursor-pointer"
                >
                  <span className="text-sm">{a.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
