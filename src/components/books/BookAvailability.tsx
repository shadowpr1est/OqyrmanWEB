import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconMapPin, IconCheck, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { libraryBooksApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/books/ReservationModal";
import { useAuth } from "@/contexts/AuthContext";

interface BookAvailabilityProps {
  bookId: string | number;
  bookTitle?: string;
}

export const BookAvailability = ({ bookId, bookTitle }: BookAvailabilityProps) => {
  const [reserveOpen, setReserveOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReserveClick = () => {
    if (!user?.phone) {
      toast.error("Добавьте номер телефона в профиле перед бронированием", {
        action: { label: "Профиль", onClick: () => navigate("/profile") },
      });
      return;
    }
    setReserveOpen(true);
  };

  const { data: libraryBooks, isLoading } = useQuery({
    queryKey: ["library-books", "book", bookId],
    queryFn: () => libraryBooksApi.getByBook(bookId),
    enabled: !!bookId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse h-16 rounded-xl bg-muted/40" />
        ))}
      </div>
    );
  }

  const items = libraryBooks || [];
  const available = items.filter((lb) => lb.available_copies > 0);

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Книга пока недоступна в библиотеках
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((lb, i) => {
        const hasAvailable = lb.available_copies > 0;
        return (
          <motion.div
            key={lb.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-xl border border-border/60 p-4 bg-white"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              hasAvailable ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"
            }`}>
              {hasAvailable ? <IconCheck size={18} stroke={2} /> : <IconX size={18} stroke={2} />}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                to={`/libraries/${lb.library_id}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <IconMapPin size={14} className="inline mr-1 text-muted-foreground" />
                {lb.library?.name || `Библиотека #${lb.library_id}`}
              </Link>
              <p className="text-xs text-muted-foreground">
                {hasAvailable
                  ? `${lb.available_copies} из ${lb.total_copies} доступно`
                  : "Нет свободных экземпляров"}
              </p>
            </div>

            {hasAvailable && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReserveClick}
                className="flex-shrink-0"
              >
                Забронировать
              </Button>
            )}
          </motion.div>
        );
      })}

      {available.length > 0 && (
        <ReservationModal
          open={reserveOpen}
          onOpenChange={setReserveOpen}
          libraryBooks={available}
          bookTitle={bookTitle || ""}
        />
      )}
    </div>
  );
};
