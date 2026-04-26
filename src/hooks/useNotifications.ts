import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [sseCount, setSseCount] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list({ limit: 50 }),
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  // SSE stream for real-time updates
  useEffect(() => {
    if (!user) return;

    const cancel = notificationsApi.createStream((raw) => {
      try {
        const payload = JSON.parse(raw);
        if (payload.unread_count !== undefined) {
          setSseCount(payload.unread_count);
        }
        qc.invalidateQueries({ queryKey: ["notifications"] });
      } catch {
        // ignore parse errors
      }
    });

    return cancel;
  }, [user, qc]);

  const notifications: Notification[] = data?.items ?? [];
  const queryCount = notifications.filter((n) => !n.is_read).length;
  const unreadCount = sseCount ?? queryCount;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const [markingAll, setMarkingAll] = useState(false);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setMarkingAll(true);
    await Promise.all(unread.map((n) => notificationsApi.markRead(n.id)));
    await qc.invalidateQueries({ queryKey: ["notifications"] });
    setSseCount(0);
    setMarkingAll(false);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: markReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    markAllRead,
    markingAll,
  };
}

export function useNotificationCount() {
  const { unreadCount } = useNotifications();
  return unreadCount;
}
