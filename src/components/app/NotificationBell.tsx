import { Link } from "react-router-dom";
import {
  IconBell,
  IconCheck,
  IconChecks,
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
import { useTranslation } from "react-i18next";

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

const NotificationPopoverItem = ({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) => {
  const Icon = typeIconMap[notification.type] || IconBell;
  const colors = typeColorMap[notification.type] || typeColorMap.general;

  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40 ${
        !notification.is_read ? "bg-primary/[0.02]" : ""
      }`}
    >
      <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
        <Icon size={15} className={colors.color} stroke={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] leading-snug line-clamp-2 ${notification.is_read ? "text-foreground/60" : "text-foreground font-medium"}`}>
          {notification.body}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {notification.title}
        </p>
      </div>
      {!notification.is_read && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
          className="mt-0.5 flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <IconCheck size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead, markingAll } = useNotifications();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const recent = notifications.slice(0, 6);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2.5 rounded-xl hover:bg-muted/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={unreadCount > 0 ? t("notifications.unreadCount", { count: unreadCount }) : t("notifications.title")}
        >
          <IconBell size={20} stroke={1.5} className="text-foreground/70" aria-hidden="true" />
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
        className="w-[min(360px,calc(100vw-2rem))] p-0 rounded-xl shadow-lg border border-border/60"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <h3 className="text-sm font-semibold text-foreground">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
            >
              <IconChecks size={14} />
              {markingAll ? "..." : t("notifications.readAll")}
            </button>
          )}
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <IconBell size={28} stroke={1.2} className="mb-2 opacity-40" />
              <p className="text-sm">{t("notifications.empty")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {recent.map((n) => (
                <NotificationPopoverItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markRead}
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
            {t("notifications.seeAll")}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
