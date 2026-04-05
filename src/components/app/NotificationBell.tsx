import { Link } from "react-router-dom";
import { IconBell } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useNotificationCount } from "@/hooks/useNotifications";

export const NotificationBell = () => {
  const count = useNotificationCount();

  return (
    <Link
      to="/notifications"
      className="relative p-2 rounded-xl hover:bg-muted/60 transition-colors"
    >
      <IconBell size={20} stroke={1.5} className="text-foreground/70" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </Link>
  );
};
