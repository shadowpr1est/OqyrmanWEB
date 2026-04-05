import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlistExists, useToggleWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";

interface WishlistButtonProps {
  bookId: number;
  size?: "sm" | "md";
}

export const WishlistButton = ({ bookId, size = "md" }: WishlistButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data } = useWishlistExists(bookId);
  const { add, remove } = useToggleWishlist(bookId);
  const isWished = data?.exists || false;
  const loading = add.isPending || remove.isPending;

  const iconSize = size === "sm" ? 18 : 22;
  const classes =
    size === "sm"
      ? "p-1.5 rounded-lg"
      : "p-2.5 rounded-xl";

  const handleClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isWished) remove.mutate();
    else add.mutate();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      disabled={loading}
      className={`${classes} transition-colors ${
        isWished
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-red-400"
      }`}
      title={isWished ? "Убрать из избранного" : "В избранное"}
    >
      {isWished ? (
        <IconHeartFilled size={iconSize} />
      ) : (
        <IconHeart size={iconSize} stroke={1.5} />
      )}
    </motion.button>
  );
};
