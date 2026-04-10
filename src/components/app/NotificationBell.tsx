import { Link } from "react-router-dom";
import {
  IconBell,
  IconCheck,
  IconBookmark,
  IconBook,
  IconClock,
  IconAlertTriangle,
  IconBookmarkOff,
  IconAlertOctagon,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Notification, NotificationType } from "@/lib/api/types";
import { useState } from "react";

const typeIconMap: Record<NotificationType, React.ElementType> = {
  reservation_success: IconBookmark,
  pickup_success: IconBook,
  reservation_deadline: IconClock,
  return_deadline: IconAlertTriangle,
  reservation_expired: IconBookmarkOff,
  return_overdue: IconAlertOctagon,
  event_reminder: IconCalendarEvent,
  general: IconBell,
};

const typeColorMap: Record<NotificationType, { color: string; bg: string }> = {
  reservation_success: { color: "text-emerald-600", bg: "bg-emerald-50" },
  pickup_success: { color: "text-blue-600", bg: "bg-blue-50" },
  reservation_deadline: { color: "text-amber-600", bg: "bg-amber-50" },
  return_deadline: { color: "text-amber-600", bg: "bg-amber-50" },
  reservation_expired: { color: "text-red-600", bg: "bg-red-50" },
  return_overdue: { color: "text-red-600", bg: "bg-red-50" },
  event_reminder: { color: "text-primary", bg: "bg-primary/10" },
  general: { color: "text-foreground/70", bg: "bg-muted/50" },
};

const formatRelativeTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "сейчас";
  if (mins < 60) return `${mins} мин`;
  if (hours < 24) return `${hours} ч`;
  if (days < 7) return `${days} дн`;
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
};

const NotificationPopoverItem = ({
  notification,
  onMarkRead,
  onClose,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) => {
  const Icon = typeIconMap[notification.type] || IconBell;
  const colors = typeColorMap[notification.type] || typeColorMap.general;

  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40 ${
        !notification.is_read ? "bg-primary/[0.02]" : ""
      }`}
    >
      <div
        className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
      >
        <Icon size={15} className={colors.color} stroke={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] leading-snug line-clamp-2 ${
            notification.is_read
              ? "text-foreground/60"
              : "text-foreground font-medium"
          }`}
        >
          {notification.body}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="mt-0.5 flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Прочитано"
        >
          <IconCheck size={14} />
        </button>
      )}
    </div>
  );
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const recent = notifications.slice(0, 6);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-muted/60 transition-colors">
          <IconBell size={20} stroke={1.5} className="text-foreground/70" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 rounded-xl shadow-lg border border-border/60"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground">Уведомления</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} новых
            </span>
          )}
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <IconBell size={28} stroke={1.2} className="mb-2 opacity-40" />
              <p className="text-sm">Нет уведомлений</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {recent.map((n) => (
                <NotificationPopoverItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markRead}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/40 px-4 py-2.5">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Все уведомления
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
