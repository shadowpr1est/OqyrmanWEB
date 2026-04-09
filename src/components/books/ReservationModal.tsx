import { useState } from "react";
import { motion } from "framer-motion";
import {
  IconBuildingBank,
  IconMapPin,
  IconBook2,
  IconCalendarEvent,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reservationsApi } from "@/lib/api";
import type { LibraryBook } from "@/lib/api/types";

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraryBooks: LibraryBook[];
  bookTitle: string;
}

export const ReservationModal = ({
  open,
  onOpenChange,
  libraryBooks,
  bookTitle,
}: ReservationModalProps) => {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const qc = useQueryClient();

  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const dueDateStr = dueDate.toISOString().split("T")[0];
  const dueDateFormatted = dueDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reserveMutation = useMutation({
    mutationFn: () => reservationsApi.create(selectedId!, dueDateStr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Книга забронирована! Заберите до " + dueDateFormatted);
      onOpenChange(false);
      setSelectedId(null);
    },
    onError: () => toast.error("Не удалось забронировать"),
  });

  const handleClose = (value: boolean) => {
    if (!reserveMutation.isPending) {
      onOpenChange(value);
      if (!value) setSelectedId(null);
    }
  };

  const available = libraryBooks.filter((lb) => lb.available_copies > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-[#1E5945]/[0.04] to-transparent">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1E5945]/10 flex items-center justify-center flex-shrink-0">
                <IconBuildingBank size={18} className="text-[#1E5945]" />
              </div>
              Забронировать книгу
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              <span className="font-medium text-foreground/70">{bookTitle}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Due date notice */}
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60">
            <IconCalendarEvent size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Заберите книгу до <span className="font-semibold">{dueDateFormatted}</span>
            </p>
          </div>
        </div>

        {/* Library list */}
        <div className="px-6 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Выберите библиотеку
          </p>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {available.map((lb, i) => {
              const isSelected = selectedId === lb.id;
              return (
                <motion.button
                  key={lb.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  onClick={() => setSelectedId(lb.id)}
                  className={`w-full text-left rounded-xl border-2 p-3.5 transition-all duration-200 ${
                    isSelected
                      ? "border-[#1E5945] bg-[#1E5945]/[0.04] shadow-sm"
                      : "border-border/60 bg-white hover:border-border hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "border-[#1E5945] bg-[#1E5945]"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <IconCircleCheck size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Library info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold transition-colors ${
                        isSelected ? "text-[#1E5945]" : "text-foreground"
                      }`}>
                        {lb.library?.name || `Библиотека #${lb.library_id}`}
                      </p>
                      {lb.library?.address && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <IconMapPin size={12} className="flex-shrink-0" />
                          {lb.library.address}
                        </p>
                      )}
                    </div>

                    {/* Copies badge */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 flex-shrink-0">
                      <IconBook2 size={13} className="text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">
                        {lb.available_copies}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {available.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Нет доступных экземпляров
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => handleClose(false)}
            disabled={reserveMutation.isPending}
          >
            Отмена
          </Button>
          <Button
            className="flex-1 bg-[#1E5945] hover:bg-[#174a39] text-white"
            disabled={!selectedId || reserveMutation.isPending}
            onClick={() => reserveMutation.mutate()}
          >
            {reserveMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Бронируем...
              </span>
            ) : (
              "Подтвердить"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
