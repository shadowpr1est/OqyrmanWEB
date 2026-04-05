import { useEffect, useState } from "react";
import { AnimateIn } from "@/components/AnimateIn";
import { MapPin, Phone, Loader2 } from "lucide-react";

interface Library {
  id: number;
  name: string;
  address: string;
  phone?: string;
}

export const LibrariesSection = () => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.oqyrman.app/api/v1/libraries")
      .then((r) => r.json())
      .then((data) => setLibraries(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="libraries" className="py-20 md:py-28 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimateIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Наши библиотеки в Алматы</h2>
        </AnimateIn>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraries.map((lib, i) => (
              <AnimateIn key={lib.id || i} delay={i * 0.08}>
                <div className="p-6 rounded-2xl border border-border bg-background hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{lib.name}</h3>
                      <p className="text-sm text-muted-foreground">{lib.address}</p>
                      {lib.phone && (
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                          <Phone size={14} />
                          {lib.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
