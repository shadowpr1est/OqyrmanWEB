import { IconHeart, IconHeartFilled, IconBook, IconCircleCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useWishlistExists, useToggleWishlist } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  bookId: string | number;
  size?: "sm" | "md";
}

export const WishlistButton = ({ bookId, size = "md" }: WishlistButtonProps) => {
  const { data } = useWishlistExists(bookId);
  const { add, remove } = useToggleWishlist(bookId);
  const status = data?.status ?? null;
  const loading = add.isPending || remove.isPending;

  const iconSize = size === "sm" ? 18 : 22;
  const classes = size === "sm" ? "p-1.5 rounded-lg" : "p-2.5 rounded-xl";

  // "reading" state — book is currently being read, shelf is managed automatically
  if (status === "reading") {
    return (
      <div
        className={`${classes} bg-blue-50 text-blue-400 cursor-default`}
        title="Вы сейчас читаете эту книгу"
      >
        <IconBook size={iconSize} stroke={1.5} />
      </div>
    );
  }

  // "finished" state — can remove from shelf
  if (status === "finished") {
    return (
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => remove.mutate()}
        disabled={loading}
        className={`${classes} transition-colors bg-green-50 text-green-500 hover:bg-green-100`}
        title="Прочитано — нажмите чтобы убрать с полки"
      >
        <IconCircleCheck size={iconSize} stroke={1.5} />
      </motion.button>
    );
  }

  // "want_to_read" — red heart, can remove
  if (status === "want_to_read") {
    return (
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => remove.mutate()}
        disabled={loading}
        className={`${classes} transition-colors bg-red-50 text-red-500 hover:bg-red-100`}
        title="Убрать из списка желаний"
      >
        <IconHeartFilled size={iconSize} />
      </motion.button>
    );
  }

  // Not on shelf — outline heart, add as want_to_read
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => add.mutate("want_to_read")}
      disabled={loading}
      className={`${classes} transition-colors bg-muted/50 text-muted-foreground hover:bg-muted hover:text-red-400`}
      title="Добавить в список желаний"
    >
      <IconHeart size={iconSize} stroke={1.5} />
    </motion.button>
  );
};
