import type { NotificationType } from "@/lib/api/types";

export const notificationTypeConfig: Record<
  NotificationType,
  { icon: string; color: string; bg: string; label: string }
> = {
  reservation_success: {
    icon: "IconBookmark",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Бронь подтверждена",
  },
  pickup_success: {
    icon: "IconBook",
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Книга выдана",
  },
  reservation_deadline: {
    icon: "IconClock",
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Срок брони",
  },
  return_deadline: {
    icon: "IconAlertTriangle",
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Срок возврата",
  },
  reservation_expired: {
    icon: "IconBookmarkOff",
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Бронь истекла",
  },
  return_overdue: {
    icon: "IconAlertOctagon",
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Просрочен возврат",
  },
  event_reminder: {
    icon: "IconCalendarEvent",
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Мероприятие",
  },
  general: {
    icon: "IconBell",
    color: "text-foreground/70",
    bg: "bg-muted/50",
    label: "Уведомление",
  },
};
