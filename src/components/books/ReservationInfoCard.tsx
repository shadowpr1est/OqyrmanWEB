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
import { useTranslation } from "react-i18next";

interface ReservationInfoCardProps {
  reservation: Reservation;
}

export const ReservationInfoCard = ({ reservation }: ReservationInfoCardProps) => {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const statusConfig = {
    pending: {
      label: t("reservations.pending"),
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      icon: IconClock,
    },
    active: {
      label: t("reservations.active"),
      color: "text-primary",
      bg: "bg-emerald-50 border-emerald-200",
      icon: IconCheck,
    },
  } as const;

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
      toast.success(t("reservations.cancelSuccess"));
    },
    onError: () => toast.error(t("reservations.cancelError")),
  });

  const extendMutation = useMutation({
    mutationFn: () => reservationsApi.extend(reservation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success(t("reservations.extendSuccess"));
    },
    onError: () => toast.error(t("reservations.extendError")),
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
          {reservation.status === "pending" ? t("reservations.pickupDeadline") : t("reservations.returnBy")}{" "}
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
            {cancelMutation.isPending ? t("reservations.cancelling") : t("reservations.cancel")}
          </button>
        )}

        {canExtend && (
          <button
            onClick={() => extendMutation.mutate()}
            disabled={extendMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-white text-primary text-xs font-medium hover:bg-accent transition-colors"
          >
            <IconRefresh size={13} />
            {extendMutation.isPending ? t("reservations.extending") : t("reservations.extendDays")}
          </button>
        )}

        {reservation.status === "active" && reservation.extended_count > 0 && (
          <span className="text-xs text-muted-foreground px-2 py-1.5">
            {t("reservations.extendUsed")}
          </span>
        )}
      </div>
    </div>
  );
};
