import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useNotificationCount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [sseCount, setSseCount] = useState<number | null>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list({ limit: 50 }),
    enabled: !!user,
    refetchInterval: 60_000, // fallback poll every minute
  });

  // SSE stream for real-time updates
  useEffect(() => {
    if (!user) return;

    const es = notificationsApi.createStream();
    if (!es) return;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.unread_count !== undefined) {
          setSseCount(payload.unread_count);
        }
        // Refresh the full list when new notification arrives
        qc.invalidateQueries({ queryKey: ["notifications"] });
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // SSE will auto-reconnect in most browsers
    };

    return () => es.close();
  }, [user, qc]);

  // Prefer SSE count, fallback to query count
  const queryCount = data?.items?.filter((n) => !n.read).length ?? 0;
  return sseCount ?? queryCount;
}
