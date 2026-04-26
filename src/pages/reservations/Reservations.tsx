import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconBookmark,
  IconX,
  IconClock,
  IconRefresh,
  IconBook2,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { reservationsApi } from "@/lib/api";
import type { Reservation } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { fadeUpSm } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDate, formatDateShort } from "@/lib/utils";

function daysUntil(iso: string): number {
  const diff = new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* ── Loan Card (active — книга на руках) ──────────────────────────────────── */

const LoanCard = ({ reservation }: { reservation: Reservation }) => {
  const [extendOpen, setExtendOpen] = useState(false);
  const qc = useQueryClient();

  const extendMutation = useMutation({
    mutationFn: () => reservationsApi.extend(reservation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Срок продлён на 7 дней");
    },
    onError: () => toast.error("Не удалось продлить"),
  });

  const book = reservation.book;
  const library = reservation.library;
  const days = daysUntil(reservation.due_date);
  const canExtend = reservation.extended_count === 0;

  const urgency =
    days <= 3
      ? { bar: "bg-red-500", text: "text-red-600", badge: "bg-red-50 border-red-200", label: "text-red-700" }
      : days <= 7
      ? { bar: "bg-amber-400", text: "text-amber-600", badge: "bg-amber-50 border-amber-200", label: "text-amber-700" }
      : { bar: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-50 border-emerald-200", label: "text-emerald-700" };

  const daysLabel =
    days < 0
      ? "Просрочено"
      : days === 0
      ? "Сегодня последний день"
      : days === 1
      ? "Остался 1 день"
      : `Осталось ${days} ${days < 5 ? "дня" : "дней"}`;

  return (
    <motion.div
      {...fadeUpSm}
      className="rounded-2xl border border-border bg-white overflow-hidden flex flex-col sm:flex-row"
    >
      {/* Urgency accent bar */}
      <div className={`w-full sm:w-1 h-1 sm:h-auto flex-shrink-0 ${urgency.bar}`} />

      <div className="flex flex-col sm:flex-row gap-4 p-5 flex-1 min-w-0">
        {/* Cover */}
        {book?.cover_url ? (
          <Link to={`/books/${book.id}`} className="flex-shrink-0">
            <img src={book.cover_url} alt={book.title} className="w-16 h-24 rounded-lg object-cover" />
          </Link>
        ) : (
          <div className="w-16 h-24 rounded-lg bg-muted/40 flex-shrink-0 flex items-center justify-center">
            <IconBook2 size={24} className="text-muted-foreground/40" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title + days badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {book ? (
                <Link to={`/books/${book.id}`} className="hover:text-primary transition-colors">
                  {book.title}
                </Link>
              ) : (
                `Книга #${reservation.id}`
              )}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 border ${urgency.badge} ${urgency.label}`}>
              <IconClock size={11} />
              {daysLabel}
            </span>
          </div>

          {library && <p className="text-sm text-muted-foreground mb-2">{library.name}</p>}

          <p className="text-xs text-muted-foreground mb-3">
            Вернуть до{" "}
            <span className={`font-medium ${urgency.text}`}>{formatDate(reservation.due_date)}</span>
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {canExtend ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={extendMutation.isPending}
                onClick={() => setExtendOpen(true)}
              >
                <IconRefresh size={14} />
                {extendMutation.isPending ? "Продлеваем..." : "Продлить на 7 дней"}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground self-center">Продление использовано</span>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={extendOpen} onOpenChange={setExtendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Продлить срок возврата?</AlertDialogTitle>
            <AlertDialogDescription>
              Срок возврата книги будет продлён на 7 дней. Продление можно использовать только один раз.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => extendMutation.mutate()}>Продлить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

/* ── Pending Card (бронирование — ещё не забрал) ──────────────────────────── */

const PendingCard = ({ reservation }: { reservation: Reservation }) => {
  const qc = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => reservationsApi.cancel(reservation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Бронь отменена");
    },
    onError: () => toast.error("Не удалось отменить"),
  });

  const book = reservation.book;
  const library = reservation.library;
  const days = daysUntil(reservation.due_date);
  const daysLabel =
    days <= 0 ? "Истекла" : days === 1 ? "Последний день" : `${days} ${days < 5 ? "дня" : "дней"} на получение`;

  return (
    <motion.div
      {...fadeUpSm}
      className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 flex flex-col sm:flex-row gap-4"
    >
      {/* Cover */}
      {book?.cover_url ? (
        <Link to={`/books/${book.id}`} className="flex-shrink-0">
          <img src={book.cover_url} alt={book.title} className="w-16 h-24 rounded-lg object-cover" />
        </Link>
      ) : (
        <div className="w-16 h-24 rounded-lg bg-amber-100 flex-shrink-0 flex items-center justify-center">
          <IconBook2 size={24} className="text-amber-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Title + status */}
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 bg-amber-100 text-amber-700 border border-amber-200">
            <IconClock size={11} />
            Ожидает получения
          </span>
        </div>

        {library && <p className="text-sm text-muted-foreground mb-2">{library.name}</p>}

        <p className="text-xs text-muted-foreground mb-3">
          Заберите до{" "}
          <span className="font-medium text-amber-700">{formatDate(reservation.due_date)}</span>
          <span className="ml-2 text-amber-600">· {daysLabel}</span>
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            <IconX size={14} className="mr-1" />
            {cancelMutation.isPending ? "Отменяем..." : "Отменить"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── History Card (completed / cancelled) ─────────────────────────────────── */

const HistoryCard = ({ reservation }: { reservation: Reservation }) => {
  const book = reservation.book;
  const library = reservation.library;
  const isCancelled = reservation.status === "cancelled";

  return (
    <div className="rounded-xl border border-border bg-white/60 p-4 flex gap-3 opacity-70">
      {book?.cover_url ? (
        <img src={book.cover_url} alt={book.title} className="w-10 h-14 rounded object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-14 rounded bg-muted/40 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-medium text-foreground truncate">
            {book?.title ?? `#${reservation.id}`}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-md flex-shrink-0 ${isCancelled ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
            {isCancelled ? "Отменена" : "Возвращена"}
          </span>
        </div>
        {library && <p className="text-xs text-muted-foreground">{library.name}</p>}
        <p className="text-xs text-muted-foreground mt-0.5">
          {reservation.returned_at
            ? `Возвращена ${formatDateShort(reservation.returned_at)}`
            : `Создана ${formatDateShort(reservation.reserved_at)}`}
        </p>
      </div>
    </div>
  );
};

/* ── Section Header ───────────────────────────────────────────────────────── */

const SectionHeader = ({
  icon: Icon,
  title,
  count,
  color,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  color: string;
}) => (
  <div className={`flex items-center gap-2 mb-3`}>
    <Icon size={16} className={color} />
    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    <span className="text-xs text-muted-foreground">· {count}</span>
  </div>
);

/* ── Page ──────────────────────────────────────────────────────────────────── */

const Reservations = () => {
  const [historyOpen, setHistoryOpen] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationsApi.list(),
  });

  const reservations = data || [];

  const loans = reservations.filter((r) => r.status === "active");
  const pending = reservations.filter((r) => r.status === "pending");
  const history = reservations.filter((r) => r.status === "completed" || r.status === "cancelled");

  const activeCount = loans.length + pending.length;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <PageHeader
        title="Мои книги"
        subtitle={activeCount > 0 ? `${activeCount} активных` : "Нет активных книг"}
      />

      {isLoading ? (
        <div className="space-y-4 max-w-3xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-28 rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : activeCount === 0 && history.length === 0 ? (
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
        <div className="max-w-3xl space-y-8">
          {/* На руках */}
          {loans.length > 0 && (
            <section>
              <SectionHeader icon={IconBook2} title="На руках" count={loans.length} color="text-emerald-600" />
              <div className="space-y-3">
                {loans.map((r) => (
                  <LoanCard key={r.id} reservation={r} />
                ))}
              </div>
            </section>
          )}

          {/* Бронирования */}
          {pending.length > 0 && (
            <section>
              <SectionHeader icon={IconClock} title="Забронированы" count={pending.length} color="text-amber-600" />
              <div className="space-y-3">
                {pending.map((r) => (
                  <PendingCard key={r.id} reservation={r} />
                ))}
              </div>
            </section>
          )}

          {/* История */}
          {history.length > 0 && (
            <section>
              <button
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                onClick={() => setHistoryOpen((v) => !v)}
              >
                {historyOpen ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
                История · {history.length}
              </button>
              {historyOpen && (
                <div className="space-y-2">
                  {history.map((r) => (
                    <HistoryCard key={r.id} reservation={r} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

    </div>
  );
};

export default Reservations;
