import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconMapPin, IconPhone, IconBuilding, IconBook } from "@tabler/icons-react";
import { librariesApi, libraryBooksApi } from "@/lib/api";
import { BookCard } from "@/components/books/BookCard";
import { BookGridSkeleton } from "@/components/books/BookCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const LibraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const libraryId = Number(id);

  const { data: library, isLoading: libLoading } = useQuery({
    queryKey: ["libraries", libraryId],
    queryFn: () => librariesApi.getById(libraryId),
    enabled: libraryId > 0,
  });

  const { data: libraryBooks, isLoading: booksLoading } = useQuery({
    queryKey: ["library-books", "library", libraryId],
    queryFn: () => libraryBooksApi.getByLibrary(libraryId),
    enabled: libraryId > 0,
  });

  if (libLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-muted/20 h-[200px]" />
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-4">
          <div className="h-8 bg-muted/40 rounded w-1/3" />
          <div className="h-4 bg-muted/30 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Библиотека не найдена</p>
        <Link to="/libraries" className="text-primary hover:underline text-sm mt-2 inline-block">
          Все библиотеки
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0a1f17] to-[#0d2b1f]">
        <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl shadow-primary/30 flex-shrink-0">
              <IconBuilding size={28} className="text-white" stroke={1.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {library.name}
              </h1>
              <div className="space-y-1.5">
                <p className="text-white/60 flex items-center gap-2">
                  <IconMapPin size={16} /> {library.address}
                </p>
                {library.phone && (
                  <p className="text-white/60 flex items-center gap-2">
                    <IconPhone size={16} />
                    <a href={`tel:${library.phone}`} className="hover:text-primary-light transition-colors">
                      {library.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Books in this library */}
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Книги в библиотеке
          {libraryBooks && ` (${libraryBooks.length})`}
        </h2>

        {booksLoading ? (
          <BookGridSkeleton count={8} />
        ) : !libraryBooks?.length ? (
          <EmptyState
            icon={IconBook}
            title="Нет книг"
            description="В этой библиотеке пока нет книг в системе"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {libraryBooks.map((lb, i) =>
              lb.book ? (
                <motion.div
                  key={lb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <BookCard book={lb.book} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {lb.available_copies} из {lb.total_copies} доступно
                  </p>
                </motion.div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryDetail;
