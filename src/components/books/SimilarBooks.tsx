import { useSimilarBooks } from "@/hooks/useBooks";
import { BookCard } from "./BookCard";
import { HorizontalScroll } from "@/components/shared/HorizontalScroll";
import { useTranslation } from "react-i18next";

interface SimilarBooksProps {
  bookId: string | number;
}

export const SimilarBooks = ({ bookId }: SimilarBooksProps) => {
  const { data: books, isLoading } = useSimilarBooks(bookId, 10);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="w-[160px] flex-shrink-0 animate-pulse">
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
      <h3 className="text-lg font-semibold text-foreground mb-5">{t("book.similarBooks")}</h3>
      <HorizontalScroll>
        {books.slice(0, 10).map((b) => (
          <div key={b.id} className="w-[160px] flex-shrink-0">
            <BookCard book={b} />
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
};
