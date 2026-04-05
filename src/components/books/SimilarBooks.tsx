import { useSimilarBooks } from "@/hooks/useBooks";
import { BookCard } from "./BookCard";

interface SimilarBooksProps {
  bookId: number;
}

export const SimilarBooks = ({ bookId }: SimilarBooksProps) => {
  const { data: books, isLoading } = useSimilarBooks(bookId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-xl bg-muted/40 mb-2" />
            <div className="h-3 bg-muted/40 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!books?.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-5">Похожие книги</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
};
