import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconBookmark, IconX, IconClock, IconCheck } from "@tabler/icons-react";
import { reservationsApi } from "@/lib/api";
import type { Reservation } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Ожидает", color: "bg-amber-100 text-amber-700", icon: IconClock },
  active: { label: "На руках", color: "bg-emerald-100 text-emerald-700", icon: IconCheck },
  completed: { label: "Возвращена", color: "bg-gray-100 text-gray-600", icon: IconCheck },
  cancelled: { label: "Отменена", color: "bg-red-100 text-red-600", icon: IconX },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" });

const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
  const qc = useQueryClient();
  const status = statusConfig[reservation.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const cancelMutation = useMutation({
    mutationFn: () => reservationsApi.cancel(reservation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Бронь отменена");
    },
    onError: () => toast.error("Не удалось отменить"),
  });

  const extendMutation = useMutation({
    mutationFn: () => reservationsApi.extend(reservation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Срок продлён");
    },
    onError: () => toast.error("Не удалось продлить"),
  });

  const book = reservation.book;
  const library = reservation.library;
  const canCancel = reservation.status === "pending";
  const canExtend = reservation.status === "active" && reservation.extended_count === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-white p-5 flex flex-col sm:flex-row gap-4"
    >
      {/* Book cover */}
      {book?.cover_url ? (
        <Link to={`/books/${book.id}`} className="flex-shrink-0">
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-16 h-24 rounded-lg object-cover"
          />
        </Link>
      ) : (
        <div className="w-16 h-24 rounded-lg bg-muted/40 flex-shrink-0" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">
            {book ? (
              <Link to={`/books/${book.id}`} className="hover:text-primary transition-colors">
                {book.title}
              </Link>
            ) : (
              `Бронь #${reservation.id}`
            )}
          </h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 ${status.color}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>

        {library && (
          <p className="text-sm text-muted-foreground mb-2">
            {library.name}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Создана: {formatDate(reservation.reserved_at)}</span>
          <span>Срок: {formatDate(reservation.due_date)}</span>
          {reservation.returned_at && (
            <span>Возврат: {formatDate(reservation.returned_at)}</span>
          )}
        </div>

        {/* Actions */}
        {(canCancel || canExtend) && (
          <div className="flex gap-2 mt-3">
            {canExtend && (
              <Button
                size="sm"
                variant="outline"
                disabled={extendMutation.isPending}
                onClick={() => extendMutation.mutate()}
              >
                Продлить
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Отменить
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Reservations = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationsApi.list(),
  });

  const reservations = data || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Мои брони</h1>
        <p className="text-muted-foreground">
          {reservations.length > 0
            ? `${reservations.length} бронирований`
            : "Управляйте своими бронированиями"}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-28 rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={IconBookmark}
          title="Нет бронирований"
          description="Забронируйте книгу в каталоге — и она появится здесь"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4 max-w-3xl">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservations;
