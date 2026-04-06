import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconMapPin, IconCheck, IconX } from "@tabler/icons-react";
import { libraryBooksApi, reservationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BookAvailabilityProps {
  bookId: string | number;
}

export const BookAvailability = ({ bookId }: BookAvailabilityProps) => {
  const qc = useQueryClient();

  const { data: libraryBooks, isLoading } = useQuery({
    queryKey: ["library-books", "book", bookId],
    queryFn: () => libraryBooksApi.getByBook(bookId),
    enabled: !!bookId,
    retry: false,
  });

  const reserveMutation = useMutation({
    mutationFn: (libraryBookId: number) => reservationsApi.create(libraryBookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-books", "book", bookId] });
      toast.success("Книга забронирована!");
    },
    onError: () => toast.error("Не удалось забронировать"),
  });

  const handleReserve = (libraryBookId: number) => {
    reserveMutation.mutate(libraryBookId);
  };

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
        const available = lb.available_copies > 0;
        return (
          <motion.div
            key={lb.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-xl border border-border/60 p-4 bg-white"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"
            }`}>
              {available ? <IconCheck size={18} stroke={2} /> : <IconX size={18} stroke={2} />}
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
                {available
                  ? `${lb.available_copies} из ${lb.total_copies} доступно`
                  : "Нет свободных экземпляров"}
              </p>
            </div>

            {available && (
              <Button
                size="sm"
                variant="outline"
                disabled={reserveMutation.isPending}
                onClick={() => handleReserve(lb.id)}
                className="flex-shrink-0"
              >
                Забронировать
              </Button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
