import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconX,
  IconExternalLink,
} from "@tabler/icons-react";
import { eventsApi } from "@/lib/api";
import type { Event } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";

const Events = () => {
  const [selected, setSelected] = useState<Event | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list({ limit: 50 }),
  });

  const events = data?.items || [];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Мероприятия
        </h1>
        <p className="text-muted-foreground">
          События и встречи в библиотеках
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse h-72 rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={IconCalendarEvent}
          title="Нет предстоящих мероприятий"
          description="Следите за обновлениями — скоро здесь появятся события"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => setSelected(event)}
            >
              <div className="relative rounded-2xl border border-border bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.04]">
                {/* Cover */}
                {event.cover_url ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={event.cover_url}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#0d2b1f] to-[#13382a] flex items-center justify-center">
                    <IconCalendarEvent size={40} className="text-white/20" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <IconClock size={14} stroke={1.5} />
                      {formatDate(event.starts_at)}, {formatTime(event.starts_at)}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-1.5">
                        <IconMapPin size={14} stroke={1.5} />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Event Modal ── */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelected(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-lg max-h-[85vh] overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cover */}
                {selected.cover_url ? (
                  <div className="relative aspect-[16/9] flex-shrink-0">
                    <img
                      src={selected.cover_url}
                      alt={selected.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelected(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-white"
                    >
                      <IconX size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-[16/9] flex-shrink-0 bg-gradient-to-br from-[#0d2b1f] to-[#13382a] flex items-center justify-center">
                    <IconCalendarEvent size={48} className="text-white/20" />
                    <button
                      onClick={() => setSelected(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-colors text-white"
                    >
                      <IconX size={20} />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <h2 className="text-lg font-bold text-foreground leading-tight">
                    {selected.title}
                  </h2>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <IconClock size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Дата и время</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(selected.starts_at)}, {formatTime(selected.starts_at)}
                        {selected.ends_at && ` — ${formatTime(selected.ends_at)}`}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {selected.location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                        <IconMapPin size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Место проведения</p>
                        <p className="text-sm font-medium text-foreground">{selected.location}</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-primary"
                        title="Открыть в Google Maps"
                      >
                        <IconExternalLink size={16} />
                      </a>
                    </div>
                  )}

                  {/* Description */}
                  {selected.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Описание</p>
                      <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line">
                        {selected.description}
                      </p>
                    </div>
                  )}


                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
