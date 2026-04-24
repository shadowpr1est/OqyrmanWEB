import { useState } from "react";
import { motion } from "framer-motion";
import { IconHeart } from "@tabler/icons-react";
import { useWishlist } from "@/hooks/useWishlist";
import { BookCard } from "@/components/books/BookCard";
import { BookGridSkeleton } from "@/components/books/BookCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Book } from "@/lib/api";
import type { WishlistItem, ShelfStatus } from "@/lib/api/types";

function toBook(item: WishlistItem): Book {
  const b = item.book;
  return {
    id: b.id as unknown as number,
    title: b.title,
    description: b.description ?? "",
    cover_url: b.cover_url,
    isbn: b.isbn ?? "",
    year: b.year ?? 0,
    total_pages: b.total_pages ?? 0,
    language: b.language ?? "",
    avg_rating: b.avg_rating,
    ratings_count: 0,
    author_id: b.author.id as unknown as number,
    genre_id: b.genre.id as unknown as number,
    author: { id: b.author.id, name: b.author.name, bio: "", photo_url: "" },
    genre: { id: b.genre.id, name: b.genre.name, slug: b.genre.slug ?? "" },
    created_at: item.added_at,
  };
}

const tabs: { label: string; value: ShelfStatus | undefined }[] = [
  { label: "Все", value: undefined },
  { label: "Хочу прочитать", value: "want_to_read" },
  { label: "Читаю", value: "reading" },
  { label: "Прочитано", value: "finished" },
];

const Wishlist = () => {
  const [activeTab, setActiveTab] = useState<ShelfStatus | undefined>(undefined);
  const { data, isLoading } = useWishlist(activeTab);
  const items = data || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <PageHeader
        title="Полка"
        subtitle={items.length > 0 ? `${items.length} книг в вашем списке` : "Сохраняйте понравившиеся книги"}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <BookGridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={IconHeart}
          title="Список пуст"
          description="Нажмите на странице книги, чтобы добавить её в избранное"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <BookCard book={toBook(item)} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
