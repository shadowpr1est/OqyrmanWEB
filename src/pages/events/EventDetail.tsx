import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconCalendarEvent, IconMapPin, IconClock, IconArrowLeft } from "@tabler/icons-react";
import { eventsApi } from "@/lib/api";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const { data: event, isLoading } = useQuery({
    queryKey: ["events", eventId],
    queryFn: () => eventsApi.getById(eventId),
    enabled: eventId > 0,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-[300px] bg-muted/20" />
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-4">
          <div className="h-8 bg-muted/40 rounded w-1/3" />
          <div className="h-20 bg-muted/20 rounded" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Мероприятие не найдено</p>
        <Link to="/events" className="text-primary hover:underline text-sm mt-2 inline-block">
          Все мероприятия
        </Link>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#0a1f17] to-[#0d2b1f] overflow-hidden">
        {event.cover_url && (
          <div
            className="absolute inset-0 opacity-[0.15] blur-[40px] scale-150"
            style={{
              backgroundImage: `url(${event.cover_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16 relative">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-6"
          >
            <IconArrowLeft size={16} /> Все мероприятия
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover */}
            {event.cover_url && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-shrink-0"
              >
                <img
                  src={event.cover_url}
                  alt={event.title}
                  className="w-full md:w-[360px] rounded-xl shadow-2xl shadow-black/30 object-cover aspect-[16/9]"
                />
              </motion.div>
            )}

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                {event.title}
              </h1>

              <div className="space-y-2 text-white/60">
                <p className="flex items-center gap-2">
                  <IconClock size={18} />
                  {formatDate(event.starts_at)}, {formatTime(event.starts_at)}
                  {event.ends_at && ` — ${formatTime(event.ends_at)}`}
                </p>
                {event.location && (
                  <p className="flex items-center gap-2">
                    <IconMapPin size={18} />
                    {event.location}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="max-w-3xl">
          {event.description ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Описание</h2>
              <p className="text-foreground/75 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </motion.div>
          ) : (
            <p className="text-muted-foreground">Описание отсутствует</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
