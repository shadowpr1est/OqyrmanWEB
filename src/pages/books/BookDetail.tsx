import { Component, type ReactNode, type ErrorInfo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconBook,
  IconCalendar,
  IconLanguage,
  IconFileText,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useBook } from "@/hooks/useBooks";
import { Rating } from "@/components/shared/Rating";
import { GenreBadge } from "@/components/shared/GenreBadge";
import { BookReviews } from "@/components/books/BookReviews";
import { SimilarBooks } from "@/components/books/SimilarBooks";
import { BookActions } from "@/components/books/BookActions";
import { optimizedUrl } from "@/lib/imageProxy";
import { fadeLeft, fadeUpSm } from "@/lib/motion";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = id!;
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 -ml-2 px-2 py-1.5 rounded-lg hover:bg-muted/60"
        >
          <IconArrowLeft size={16} />
          Назад
        </button>

        {/* ── Top section: Cover + Info ── */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-10">
          {/* Cover */}
          <motion.div {...fadeLeft} className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-[200px] md:w-[220px] aspect-[2/3] rounded-xl overflow-hidden shadow-xl ring-1 ring-border/40">
              {book.cover_url ? (
                <img
                  src={optimizedUrl(book.cover_url, 440)}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <IconBook size={48} className="text-muted-foreground/30" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            {...fadeUpSm}
            transition={{ ...fadeUpSm.transition, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <h1 className="page-title mb-1">{book.title}</h1>

            {book.genre && (
              <div className="mb-2">
                <GenreBadge name={book.genre.name} id={book.genre.id} />
              </div>
            )}

            {book.author && (
              <Link
                to={`/authors/${book.author.id || book.author_id}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {book.author.name}
              </Link>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 mb-5">
              {book.year > 0 && (
                <span className="flex items-center gap-1">
                  <IconCalendar size={14} /> {book.year}
                </span>
              )}
              {book.file && book.total_pages > 0 && (
                <span className="flex items-center gap-1">
                  <IconFileText size={14} /> {book.total_pages} стр.
                </span>
              )}
              {book.language && (
                <span className="flex items-center gap-1">
                  <IconLanguage size={14} /> {book.language.toUpperCase()}
                </span>
              )}
              {book.avg_rating > 0 && (
                <span className="flex items-center gap-2">
                  <Rating value={book.avg_rating} size={14} />
                  <span className="font-medium text-foreground">{book.avg_rating.toFixed(1)}</span>
                </span>
              )}
            </div>

            <BookActions book={book} />
          </motion.div>
        </div>

        {/* ── Description ── */}
        {book.description && (
          <motion.section
            {...fadeUpSm}
            transition={{ ...fadeUpSm.transition, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="section-title mb-3">Описание</h2>
            <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line max-w-3xl">
              {book.description}
            </p>
          </motion.section>
        )}

        {/* ── Author card ── */}
        {book.author && (
          <motion.section
            {...fadeUpSm}
            transition={{ ...fadeUpSm.transition, delay: 0.25 }}
            className="mb-10"
          >
            <Link
              to={`/authors/${book.author.id || book.author_id}`}
              className="flex items-center gap-4 p-5 rounded-2xl border border-border/60 bg-white hover:shadow-md transition-shadow group w-full sm:w-fit sm:max-w-lg"
            >
              {book.author.photo_url ? (
                <img
                  src={optimizedUrl(book.author.photo_url, 128)}
                  alt={book.author.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary/40">{book.author.name[0]}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {book.author.name}
                </p>
                {book.author.bio && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {book.author.bio}
                  </p>
                )}
              </div>
            </Link>
          </motion.section>
        )}

        {/* ── Similar books ── */}
        <motion.section
          {...fadeUpSm}
          transition={{ ...fadeUpSm.transition, delay: 0.3 }}
          className="mb-10"
        >
          <SimilarBooks bookId={bookId} />
        </motion.section>

        {/* ── Reviews ── */}
        <motion.section
          id="reviews-section"
          {...fadeUpSm}
          transition={{ ...fadeUpSm.transition, delay: 0.35 }}
          className="mb-10"
        >
          <BookReviews bookId={book.id} />
        </motion.section>
      </div>
    </div>
  );
};

class BookDetailErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("BookDetail crash:", error, info.componentStack);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-red-500 font-semibold mb-2">Ошибка при загрузке страницы</p>
          <p className="text-sm text-muted-foreground">Попробуйте обновить страницу</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const BookDetailWithBoundary = () => (
  <BookDetailErrorBoundary>
    <BookDetail />
  </BookDetailErrorBoundary>
);

export default BookDetailWithBoundary;
