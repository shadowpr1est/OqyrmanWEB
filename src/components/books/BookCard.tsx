import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rating } from "@/components/shared/Rating";
import { GenreBadge } from "@/components/shared/GenreBadge";
import type { Book } from "@/lib/api";

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="group"
  >
    <Link to={`/books/${book.id}`} className="block">
      {/* Cover */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-muted/40">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl font-bold text-primary/20">
              {book.title[0]}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating on hover */}
        {book.avg_rating > 0 && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Rating value={book.avg_rating} size={14} showValue count={book.ratings_count} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs text-muted-foreground truncate">
            {book.author.name}
          </p>
        )}
        <div className="flex items-center gap-2">
          {book.genre && (
            <GenreBadge name={book.genre.name} slug={book.genre.slug} interactive={false} />
          )}
          {book.year > 0 && (
            <span className="text-xs text-muted-foreground">{book.year}</span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);
