import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconUser, IconArrowLeft } from "@tabler/icons-react";
import { authorsApi, booksApi } from "@/lib/api";
import { BookCard } from "@/components/books/BookCard";
import { BookGridSkeleton } from "@/components/books/BookCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { fadeUpSm, fadeUp, staggerItem } from "@/lib/motion";
import { useTranslation } from "react-i18next";

const AuthorDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const authorId = id!;
  const navigate = useNavigate();

  const { data: author, isLoading: authorLoading } = useQuery({
    queryKey: ["authors", authorId],
    queryFn: () => authorsApi.getById(authorId),
    enabled: !!authorId,
  });

  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ["books", "author", authorId],
    queryFn: () => booksApi.getByAuthor(authorId, { limit: 50 }),
    enabled: !!authorId,
  });

  const books = booksData?.items || [];

  if (authorLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-muted/20 h-[250px]" />
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-4">
          <div className="h-8 bg-muted/40 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">{t("author.notFound")}</p>
        <Link to="/catalog" className="text-primary hover:underline text-sm mt-2 inline-block">
          {t("author.backToCatalog")}
        </Link>
      </div>
    );
  }

  const formatLifespan = () => {
    const parts: string[] = [];
    if (author.birth_date) parts.push(new Date(author.birth_date).getFullYear().toString());
    if (author.death_date) parts.push(new Date(author.death_date).getFullYear().toString());
    else if (author.birth_date) parts.push(t("author.present"));
    return parts.length > 0 ? parts.join(" — ") : null;
  };

  const lifespan = formatLifespan();

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#0a1f17] to-[#0d2b1f] overflow-hidden">
        {author.photo_url && (
          <div
            className="absolute inset-0 opacity-[0.08] blur-[60px] scale-150"
            style={{
              backgroundImage: `url(${author.photo_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16 relative">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-6 -ml-2 px-2 py-1.5 rounded-lg hover:bg-white/10"
          >
            <IconArrowLeft size={16} /> {t("common.back")}
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0"
            >
              {author.photo_url ? (
                <img
                  src={author.photo_url}
                  alt={author.name}
                  className="w-40 h-40 md:w-52 md:h-52 rounded-2xl object-cover shadow-2xl shadow-black/30 ring-2 ring-white/10"
                />
              ) : (
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <IconUser size={64} className="text-white/60" />
                </div>
              )}
            </motion.div>

            <motion.div
              {...fadeUpSm}
              transition={{ ...fadeUpSm.transition, delay: 0.1 }}
              className="text-center md:text-left"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {author.name}
              </h1>
              {lifespan && (
                <p className="text-white/40 text-sm mb-3">{lifespan}</p>
              )}
              {books.length > 0 && (
                <p className="text-white/50 text-sm mb-5">
                  {t("author.booksInCatalog", { count: books.length })}
                </p>
              )}

              {/* Bio inside hero */}
              {author.bio && (
                <div className="mt-2 max-w-2xl">
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                    {i18n.language === "kk" && author.bio_kk ? author.bio_kk : author.bio}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* Books */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
        >
          <h2 className="section-title mb-5">
            {t("author.booksTitle")}
          </h2>

          {booksLoading ? (
            <BookGridSkeleton count={6} />
          ) : books.length === 0 ? (
            <EmptyState
              icon={IconUser}
              title={t("author.noBooks")}
              description={t("author.noBooksDesc")}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {books.map((book, i) => (
                <motion.div
                  key={book.id}
                  {...staggerItem}
                  transition={{ ...staggerItem.transition, delay: i * 0.03 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthorDetail;
