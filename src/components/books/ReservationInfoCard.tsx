import {
  IconBuildingBank,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reservationsApi } from "@/lib/api";
import type { Reservation } from "@/lib/api/types";

interface ReservationInfoCardProps {
  reservation: Reservation;
}

const statusConfig = {
  pending: {
    label: "Ожидает получения",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: IconClock,
  },
  active: {
    label: "На руках",
    color: "text-primary",
    bg: "bg-emerald-50 border-emerald-200",
    icon: IconCheck,
  },
} as const;

export const ReservationInfoCard = ({ reservation }: ReservationInfoCardProps) => {
  const qc = useQueryClient();
  const config = statusConfig[reservation.status as "pending" | "active"];
  const StatusIcon = config.icon;

  const dueDate = new Date(reservation.due_date);
  const dueDateFormatted = dueDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cancelMutation = useMutation({
    mutationFn: () => reservationsApi.cancel(reservation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["library-books"] });
      toast.success("Бронь отменена");
    },
    onError: () => toast.error("Не удалось отменить бронь"),
  });

  const extendMutation = useMutation({
    mutationFn: () => reservationsApi.extend(reservation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Срок продлён на 7 дней");
    },
    onError: () => toast.error("Не удалось продлить"),
  });

  const canExtend = reservation.status === "active" && reservation.extended_count === 0;

  return (
    <div className={`rounded-xl border p-4 ${config.bg} w-fit max-w-sm`}>
      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <StatusIcon size={16} className={config.color} />
        <span className={`text-sm font-semibold ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Library */}
      <div className="flex items-center gap-2 text-sm text-foreground/80 mb-1.5">
        <IconBuildingBank size={14} className="text-muted-foreground flex-shrink-0" />
        <span>{reservation.library.name}</span>
      </div>

      {/* Due date */}
      <div className="flex items-center gap-2 text-sm text-foreground/80 mb-3">
        <IconCalendarEvent size={14} className="text-muted-foreground flex-shrink-0" />
        <span>
          {reservation.status === "pending" ? "Заберите до" : "Вернуть до"}{" "}
          <span className="font-medium">{dueDateFormatted}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {reservation.status === "pending" && (
          <button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
          >
            <IconX size={13} />
            {cancelMutation.isPending ? "Отменяем..." : "Отменить бронь"}
          </button>
        )}

        {canExtend && (
          <button
            onClick={() => extendMutation.mutate()}
            disabled={extendMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-white text-primary text-xs font-medium hover:bg-accent transition-colors"
          >
            <IconRefresh size={13} />
            {extendMutation.isPending ? "Продлеваем..." : "Продлить на 7 дней"}
          </button>
        )}

        {reservation.status === "active" && reservation.extended_count > 0 && (
          <span className="text-xs text-muted-foreground px-2 py-1.5">
            Продление использовано
          </span>
        )}
      </div>
    </div>
  );
};
