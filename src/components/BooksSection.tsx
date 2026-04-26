import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimateIn } from "@/components/AnimateIn";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { optimizedUrl } from "@/lib/imageProxy";

interface Book {
  id: number;
  title: string;
  cover_url: string;
  author?: { name: string };
  authors?: { name: string }[];
}

export const BooksSection = () => {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://api.oqyrman.app/api/v1/books/popular?limit=8")
      .then((r) => r.json())
      .then((data) => {
        setBooks(Array.isArray(data) ? data : data.data || data.books || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const getAuthor = (b: Book) => b.author?.name || b.authors?.[0]?.name || t("booksSection.unknownAuthor");

  return (
    <section id="books" className="py-20 md:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimateIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("booksSection.title")}</h2>
        </AnimateIn>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {error && (
          <p className="text-center text-muted-foreground">{t("booksSection.loadError")}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book, i) => (
              <AnimateIn key={book.id || i} delay={i * 0.05}>
                <div className="group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface mb-3">
                    <img
                      src={optimizedUrl(book.cover_url, 400)}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{getAuthor(book)}</p>
                  <Button variant="link" size="sm" className="px-0 mt-1 h-auto text-xs">
                    {t("booksSection.more")}
                  </Button>
                </div>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
