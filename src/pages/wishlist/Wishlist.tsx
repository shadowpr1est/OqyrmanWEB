import { motion } from "framer-motion";
import { IconHeart } from "@tabler/icons-react";
import { useWishlist } from "@/hooks/useWishlist";
import { BookCard } from "@/components/books/BookCard";
import { BookGridSkeleton } from "@/components/books/BookCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  const { data, isLoading } = useWishlist();
  const items = data || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Избранное</h1>
        <p className="text-muted-foreground">
          {items.length > 0
            ? `${items.length} книг в вашем списке`
            : "Сохраняйте понравившиеся книги"}
        </p>
      </motion.div>

      {isLoading ? (
        <BookGridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={IconHeart}
          title="Список пуст"
          description="Нажмите ❤ на странице книги, чтобы добавить её в избранное"
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
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 lg:gap-6"
        >
          {items.map((item, i) =>
            item.book ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <BookCard book={item.book} />
              </motion.div>
            ) : null,
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
