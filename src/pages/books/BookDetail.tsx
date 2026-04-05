import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconBook, IconCalendar, IconLanguage, IconFileText } from "@tabler/icons-react";
import { useBook } from "@/hooks/useBooks";
import { Rating } from "@/components/shared/Rating";
import { GenreBadge } from "@/components/shared/GenreBadge";
import { WishlistButton } from "@/components/books/WishlistButton";
import { BookAvailability } from "@/components/books/BookAvailability";
import { BookReviews } from "@/components/books/BookReviews";
import { SimilarBooks } from "@/components/books/SimilarBooks";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const { data: book, isLoading } = useBook(bookId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-muted/20 h-[400px]" />
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-4">
          <div className="h-8 bg-muted/40 rounded w-1/3" />
          <div className="h-4 bg-muted/30 rounded w-1/4" />
          <div className="h-20 bg-muted/20 rounded" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Книга не найдена</p>
        <Link to="/catalog" className="text-primary hover:underline text-sm mt-2 inline-block">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero section */}
      <div className="relative bg-gradient-to-b from-[#0a1f17] to-[#0d2b1f] overflow-hidden">
        {/* Background blur of cover */}
        {book.cover_url && (
          <div
            className="absolute inset-0 opacity-[0.08] blur-[60px] scale-150"
            style={{
              backgroundImage: `url(${book.cover_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <div className="container mx-auto px-4 lg:px-8 py-10 md:py-16 relative">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 mx-auto md:mx-0"
            >
              <div className="w-[200px] md:w-[240px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center">
                    <IconBook size={48} className="text-white/30" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 text-center md:text-left"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                {book.genre && (
                  <GenreBadge name={book.genre.name} slug={book.genre.slug} />
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {book.title}
              </h1>

              {book.author && (
                <Link
                  to={`/authors/${book.author_id}`}
                  className="inline-block text-lg text-white/70 hover:text-emerald-400 transition-colors mb-4"
                >
                  {book.author.name}
                </Link>
              )}

              {/* Rating */}
              {book.avg_rating > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Rating value={book.avg_rating} size={18} />
                    <span className="text-white font-semibold">
                      {book.avg_rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-white/40 text-sm">
                    {book.ratings_count} оценок
                  </span>
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/50">
                {book.year > 0 && (
                  <span className="flex items-center gap-1.5">
                    <IconCalendar size={15} /> {book.year}
                  </span>
                )}
                {book.total_pages > 0 && (
                  <span className="flex items-center gap-1.5">
                    <IconFileText size={15} /> {book.total_pages} стр.
                  </span>
                )}
                {book.language && (
                  <span className="flex items-center gap-1.5">
                    <IconLanguage size={15} /> {book.language}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                <WishlistButton bookId={book.id} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            {book.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-3">Описание</h3>
                <p className="text-foreground/75 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <BookReviews bookId={book.id} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Наличие в библиотеках
              </h3>
              <BookAvailability bookId={book.id} />
            </motion.div>
          </div>
        </div>

        {/* Similar books */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-16"
        >
          <SimilarBooks bookId={book.id} />
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetail;
