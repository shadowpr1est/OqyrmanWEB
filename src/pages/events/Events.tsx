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
import { PageHeader } from "@/components/shared/PageHeader";
import { staggerItem, backdropFade } from "@/lib/motion";
import { optimizedUrl } from "@/lib/imageProxy";
import { formatDate, formatTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const Events = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Event | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list({ limit: 50 }),
  });

  const now = Date.now();
  const events = (data?.items || []).filter((e) => new Date(e.ends_at).getTime() > now);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <PageHeader title={t("events.title")} subtitle={t("events.subtitle")} />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse h-72 rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={IconCalendarEvent}
          title={t("events.noUpcoming")}
          description={t("events.noUpcomingDesc")}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              {...staggerItem}
              transition={{ ...staggerItem.transition, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => setSelected(event)}
            >
              <div className="relative h-full rounded-2xl border border-border bg-white overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-black/[0.04]">
                {/* Cover */}
                {event.cover_url ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={optimizedUrl(event.cover_url, 500)}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center">
                    <IconCalendarEvent size={40} className="text-primary/30" stroke={1.5} />
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
                      <p className="flex items-center gap-1.5 min-w-0">
                        <IconMapPin size={14} stroke={1.5} className="flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
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
              {...backdropFade}
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
                {/* Hero image */}
                <div className="relative">
                  {selected.cover_url ? (
                    <img
                      src={optimizedUrl(selected.cover_url, 800)}
                      alt={selected.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <IconCalendarEvent size={48} className="text-white/40" stroke={1.5} />
                    </div>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white"
                  >
                    <IconX size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <h2 className="section-title leading-tight">
                    {selected.title}
                  </h2>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconClock size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("events.dateTime")}</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(selected.starts_at)}, {formatTime(selected.starts_at)}
                        {selected.ends_at && ` — ${formatTime(selected.ends_at)}`}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {selected.location && (
                    <a
                      href={`https://2gis.kz/almaty/search/${encodeURIComponent(selected.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconMapPin size={18} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{t("events.venueLabel")}</p>
                        <p className="text-sm font-medium text-foreground">{selected.location}</p>
                      </div>
                      <IconExternalLink size={16} className="text-primary" />
                    </a>
                  )}

                  {/* Description */}
                  {selected.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t("events.descriptionLabel")}</p>
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
