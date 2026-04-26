import { motion } from "framer-motion";
import { IconHeart, IconX } from "@tabler/icons-react";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { BookCard } from "@/components/books/BookCard";
import { BookGridSkeleton } from "@/components/books/BookCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Book } from "@/lib/api";
import type { WishlistItem, ShelfStatus } from "@/lib/api/types";
import { useTranslation } from "react-i18next";

function toBook(item: WishlistItem): Book {
  const b = item.book;
  return {
    id: b.id,
    title: b.title,
    description: b.description ?? "",
    cover_url: b.cover_url,
    isbn: b.isbn ?? "",
    year: b.year ?? 0,
    total_pages: b.total_pages ?? 0,
    language: b.language ?? "",
    avg_rating: b.avg_rating,
    ratings_count: 0,
    author_id: b.author.id,
    genre_id: b.genre.id,
    author: { id: b.author.id, name: b.author.name, bio: "", photo_url: "" },
    genre: { id: b.genre.id, name: b.genre.name, slug: b.genre.slug ?? "" },
    created_at: item.added_at,
  };
}

const WishlistCard = ({ item }: { item: WishlistItem }) => {
  const { t } = useTranslation();
  const { remove } = useToggleWishlist(item.book.id);
  return (
    <div className="relative group/card">
      <BookCard book={toBook(item)} />
      <button
        onClick={(e) => {
          e.preventDefault();
          remove.mutate(undefined, {
            onSuccess: () => toast.success(t("wishlist.removeSuccess")),
          });
        }}
        disabled={remove.isPending}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover/card:opacity-100 hover:bg-red-500 transition-all disabled:opacity-40"
        title={t("wishlist.removeTitle")}
      >
        <IconX size={14} />
      </button>
    </div>
  );
};

const Wishlist = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("shelf") as ShelfStatus) || undefined;
  const setActiveTab = (value: ShelfStatus | undefined) => {
    setSearchParams(value ? { shelf: value } : {}, { replace: true });
  };
  const { data, isLoading } = useWishlist(activeTab);
  const items = data || [];

  const tabs: { label: string; value: ShelfStatus | undefined }[] = [
    { label: t("wishlist.all"), value: undefined },
    { label: t("wishlist.wantToRead"), value: "want_to_read" },
    { label: t("wishlist.reading"), value: "reading" },
    { label: t("wishlist.finished"), value: "finished" },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <PageHeader
        title={t("wishlist.title")}
        subtitle={items.length > 0 ? t("wishlist.booksCount", { count: items.length }) : t("wishlist.subtitle")}
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
          title={t("wishlist.empty")}
          description={t("wishlist.emptySubtitle")}
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/catalog">{t("reservations.toCatalog")}</Link>
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
              <WishlistCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
