import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconCalendarEvent, IconMapPin, IconClock } from "@tabler/icons-react";
import { eventsApi } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";

const Events = () => {
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
              className="group"
            >
              <Link to={`/events/${event.id}`}>
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
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
