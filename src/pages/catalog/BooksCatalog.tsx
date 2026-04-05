import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { IconBook, IconSortAscending, IconFilter } from "@tabler/icons-react";
import { useBooks, useGenres } from "@/hooks/useBooks";
import { BookCard } from "@/components/books/BookCard";
import { BookGridSkeleton } from "@/components/books/BookCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

const LIMIT = 24;

const sortOptions = [
  { value: "", label: "По умолчанию" },
  { value: "popular", label: "Популярные" },
  { value: "newest", label: "Новые" },
  { value: "rating", label: "По рейтингу" },
  { value: "title", label: "По названию" },
];

const BooksCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("genre") ? Number(searchParams.get("genre")) : undefined;
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page") || "1");
  const [showFilters, setShowFilters] = useState(false);

  const { data: genres } = useGenres();
  const { data, isLoading } = useBooks({
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
    genre_id: genreId,
    sort: sort || undefined,
  });

  const books = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Каталог книг
        </h1>
        <p className="text-muted-foreground">
          {total > 0 ? `${total} книг в каталоге` : "Загрузка..."}
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-primary text-primary" : ""}
        >
          <IconFilter size={16} className="mr-1.5" />
          Жанры
        </Button>

        <div className="flex items-center gap-1.5 ml-auto">
          <IconSortAscending size={16} className="text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value || undefined)}
            className="text-sm bg-transparent border-none text-foreground/70 focus:outline-none cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Genre chips */}
      {showFilters && genres && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          <button
            onClick={() => updateParam("genre", undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !genreId
                ? "bg-primary text-white"
                : "bg-muted/60 text-foreground/70 hover:bg-muted"
            }`}
          >
            Все
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => updateParam("genre", String(g.id))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                genreId === g.id
                  ? "bg-primary text-white"
                  : "bg-muted/60 text-foreground/70 hover:bg-muted"
              }`}
            >
              {g.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* Grid */}
      {isLoading ? (
        <BookGridSkeleton />
      ) : books.length === 0 ? (
        <EmptyState
          icon={IconBook}
          title="Книги не найдены"
          description="Попробуйте изменить фильтры или поисковой запрос"
          action={
            genreId ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParam("genre", undefined)}
              >
                Сбросить фильтры
              </Button>
            ) : undefined
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 lg:gap-6"
        >
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Назад
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Далее
          </Button>
        </div>
      )}
    </div>
  );
};

export default BooksCatalog;
