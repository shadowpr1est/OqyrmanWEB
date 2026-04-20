import { motion } from "framer-motion";
import {
  IconBell,
  IconCheck,
  IconTrash,
  IconBellOff,
  IconBookmark,
  IconBook,
  IconClock,
  IconAlertTriangle,
  IconBookmarkOff,
  IconAlertOctagon,
} from "@tabler/icons-react";
import type { Notification, NotificationType } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

const typeIconMap: Record<NotificationType, React.ElementType> = {
  reservation_success: IconBookmark,
  pickup_success: IconBook,
  reservation_deadline: IconClock,
  return_deadline: IconAlertTriangle,
  reservation_expired: IconBookmarkOff,
  return_overdue: IconAlertOctagon,
  event_reminder: IconClock,
  general: IconBell,
};

const typeColorMap: Record<NotificationType, { color: string; bg: string; border: string }> = {
  reservation_success: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  pickup_success: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200/60" },
  reservation_deadline: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/60" },
  return_deadline: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/60" },
  reservation_expired: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200/60" },
  return_overdue: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200/60" },
  event_reminder: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200/60" },
  general: { color: "text-foreground/70", bg: "bg-muted/50", border: "border-border/40" },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
};

const NotificationItem = ({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const Icon = typeIconMap[notification.type] || IconBell;
  const colors = typeColorMap[notification.type] || typeColorMap.general;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl border p-4 transition-colors ${
        notification.is_read
          ? "border-border/40 bg-white"
          : `${colors.border} bg-primary/[0.02]`
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
        >
          <Icon size={16} className={colors.color} stroke={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium mb-0.5 ${colors.color}`}>
            {notification.title}
          </p>
          <p className={`text-sm leading-relaxed ${
            notification.is_read ? "text-foreground/70" : "text-foreground font-medium"
          }`}>
            {notification.body}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(notification.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.is_read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Отметить прочитанным"
            >
              <IconCheck size={16} />
            </button>
          )}
          <button
            onClick={() => {
              onDelete(notification.id);
              toast.success("Уведомление удалено");
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Удалить"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Notifications = () => {
  const { notifications, unreadCount, isLoading, markRead, deleteNotification } =
    useNotifications();

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Уведомления</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} непрочитанных`
              : "Все прочитано"}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3 max-w-2xl">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-20 rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={IconBellOff}
          title="Нет уведомлений"
          description="Здесь появятся уведомления о бронях, возвратах и новых книгах"
        />
      ) : (
        <div className="space-y-3 max-w-2xl">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={markRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
