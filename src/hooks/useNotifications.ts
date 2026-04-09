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
    refetchInterval: 60_000,
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

    if (!cancel) return;
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

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: markReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
  };
}

export function useNotificationCount() {
  const { unreadCount } = useNotifications();
  return unreadCount;
}
