import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconBell, IconCheck, IconTrash, IconBellOff } from "@tabler/icons-react";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const qc = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: () => notificationsApi.markRead(notification.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => notificationsApi.delete(notification.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Уведомление удалено");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl border p-4 transition-colors ${
        notification.read
          ? "border-border/40 bg-white"
          : "border-primary/20 bg-primary/[0.02]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
          notification.read ? "bg-transparent" : "bg-primary"
        }`} />

        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${
            notification.read ? "text-foreground/70" : "text-foreground font-medium"
          }`}>
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(notification.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.read && (
            <button
              onClick={() => markReadMutation.mutate()}
              disabled={markReadMutation.isPending}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Отметить прочитанным"
            >
              <IconCheck size={16} />
            </button>
          )}
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
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
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list({ limit: 50 }),
  });

  const notifications = data?.items || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

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
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
