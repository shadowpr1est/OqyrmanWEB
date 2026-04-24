import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSearch, IconFilter, IconSortDescending, IconUser, IconCheck, IconX } from "@tabler/icons-react";
import { BookCard } from "@/components/books/BookCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBookFilters } from "@/hooks/useBookFilters";
import { fadeUp, fadeUpSm, staggerItem, slideDown } from "@/lib/motion";

const SORT_OPTIONS = [
  { value: "", label: "По умолчанию" },
  { value: "newest", label: "Новые" },
  { value: "rating", label: "По рейтингу" },
  { value: "title", label: "По названию" },
] as const;

const BooksSearch = () => {
  const {
    query, genreIds, authorIds, sort, page,
    books, total, loading, genres, authors,
    totalPages, currentSortLabel, filteredGenres, filteredAuthors, pageRange,
    genreSearch, authorSearch, setGenreSearch, setAuthorSearch,
    handleSearch, toggleGenre, clearGenres, toggleAuthor, clearAuthors, handleSort, handlePage, clearAll,
  } = useBookFilters();

  const [genreOpen, setGenreOpen] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const closeAll = () => { setGenreOpen(false); setAuthorOpen(false); setSortOpen(false); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        title="Каталог книг"
        subtitle={`${total} ${pluralBooks(total)} в каталоге`}
      />

      {/* Search + filters row */}
      <motion.div {...fadeUpSm} className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-lg">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="поиск книг"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {/* Genre filter */}
          <div className="relative">
            <button
              onClick={() => { setGenreOpen(!genreOpen); setAuthorOpen(false); setSortOpen(false); setGenreSearch(""); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                genreIds.length > 0 ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:bg-muted/50"
              }`}
            >
              <IconFilter size={16} />
              {genreIds.length > 0 ? `Жанры (${genreIds.length})` : "Жанры"}
            </button>

            <AnimatePresence>
              {genreOpen && (
                <motion.div
                  {...slideDown}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-border bg-background shadow-lg z-50"
                >
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
                    <button onClick={() => { clearGenres(); setGenreOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-b border-border">
                      <IconX size={14} />Сбросить все
                    </button>
                  )}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredGenres.map((g) => {
                      const isSelected = genreIds.includes(g.id?.toString());
                      return (
                        <button key={g.id} onClick={() => toggleGenre(g.id?.toString())} className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${isSelected ? "text-primary font-medium bg-primary/5" : ""}`}>
                          <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                            {isSelected && <IconCheck size={12} className="text-white" />}
                          </span>
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Author filter */}
          <div className="relative">
            <button
              onClick={() => { setAuthorOpen(!authorOpen); setGenreOpen(false); setSortOpen(false); setAuthorSearch(""); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                authorIds.length > 0 ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:bg-muted/50"
              }`}
            >
              <IconUser size={16} />
              {authorIds.length > 0 ? `Авторы (${authorIds.length})` : "Авторы"}
            </button>

            <AnimatePresence>
              {authorOpen && (
                <motion.div
                  {...slideDown}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-border bg-background shadow-lg z-50"
                >
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
                    <button onClick={() => { clearAuthors(); setAuthorOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-b border-border">
                      <IconX size={14} />Сбросить все
                    </button>
                  )}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredAuthors.map((a) => {
                      const isSelected = authorIds.includes(a.id?.toString());
                      return (
                        <button key={a.id} onClick={() => toggleAuthor(a.id?.toString())} className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${isSelected ? "text-primary font-medium bg-primary/5" : ""}`}>
                          <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                            {isSelected && <IconCheck size={12} className="text-white" />}
                          </span>
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => { setSortOpen(!sortOpen); setGenreOpen(false); setAuthorOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors"
            >
              <IconSortDescending size={16} />
              {currentSortLabel}
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  {...slideDown}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full right-0 mt-1 w-44 rounded-xl border border-border bg-background shadow-lg z-50"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { handleSort(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${sort === opt.value ? "text-primary font-medium bg-primary/5" : ""}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Close dropdowns on outside click */}
      {(genreOpen || authorOpen || sortOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      {/* Active filter chips */}
      <AnimatePresence>
        {(genreIds.length > 0 || authorIds.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex flex-wrap items-center gap-2 overflow-hidden"
          >
            {genreIds.map((gid) => {
              const genre = genres.find((g) => g.id?.toString() === gid);
              if (!genre) return null;
              return (
                <motion.span
                  key={`gc-${gid}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {genre.name}
                  <button onClick={() => toggleGenre(gid)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                    <IconX size={12} />
                  </button>
                </motion.span>
              );
            })}
            {authorIds.map((aid) => {
              const author = authors.find((a) => a.id?.toString() === aid);
              if (!author) return null;
              return (
                <motion.span
                  key={`ac-${aid}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium"
                >
                  {author.name}
                  <button onClick={() => toggleAuthor(aid)} className="hover:bg-blue-500/20 rounded-full p-0.5 transition-colors">
                    <IconX size={12} />
                  </button>
                </motion.span>
              );
            })}
            <button onClick={clearAll} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors">
              <IconX size={12} />Сбросить все
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-xl bg-muted/60" />
                <div className="mt-3 h-3.5 w-3/4 rounded bg-muted/60" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <IconSearch size={40} strokeWidth={1.5} className="mb-3 opacity-40" />
            <p className="text-sm">Книги не найдены</p>
            {query && <p className="text-xs mt-1">Попробуйте изменить поисковый запрос</p>}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5"
          >
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                {...staggerItem}
                transition={{ ...staggerItem.transition, delay: i * 0.03 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <motion.div {...fadeUp} className="mt-10 flex items-center justify-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => handlePage(page - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            &lt;
          </button>

          {pageRange.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-muted-foreground text-sm">...</span>
            ) : (
              <button
                key={p}
                onClick={() => handlePage(p as number)}
                className={`min-w-[36px] px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                  page === p ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted/50"
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
        </motion.div>
      )}
    </div>
  );
};

function pluralBooks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "книга";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "книги";
  return "книг";
}

export default BooksSearch;
