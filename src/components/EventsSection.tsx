import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimateIn } from "@/components/AnimateIn";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { kk } from "date-fns/locale/kk";

interface Event {
  id: number;
  title: string;
  description: string;
  location?: string;
  starts_at: string;
}

export const EventsSection = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.oqyrman.app/api/v1/events?limit=4")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dateLocale = i18n.language === "kk" ? kk : ru;

  return (
    <section id="events" className="py-20 md:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimateIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("eventsSection.title")}</h2>
        </AnimateIn>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("eventsSection.empty")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {events.map((ev, i) => (
              <AnimateIn key={ev.id || i} delay={i * 0.1}>
                <div className="p-6 rounded-2xl border border-border bg-background hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
                    <Calendar size={16} />
                    {format(new Date(ev.starts_at), "d MMMM yyyy, HH:mm", { locale: dateLocale })}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{ev.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
                  {ev.location && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <MapPin size={14} />
                      {ev.location}
                    </div>
                  )}
                </div>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
