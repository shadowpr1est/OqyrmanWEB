import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMapPin,
  IconPhone,
  IconBuilding,
  IconX,
  IconExternalLink,
} from "@tabler/icons-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { librariesApi } from "@/lib/api";
import type { Library } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { staggerItem, backdropFade } from "@/lib/motion";
import { optimizedUrl } from "@/lib/imageProxy";

/* Fix default marker icons for leaflet + bundler */
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function twoGisUrl(lat: number, lng: number) {
  return `https://2gis.kz/almaty/geo/${lng},${lat}`;
}

const Libraries = () => {
  const [selected, setSelected] = useState<Library | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["libraries"],
    queryFn: () => librariesApi.list({ limit: 50 }),
  });

  const libraries = data?.items || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <PageHeader
        title="Библиотеки"
        subtitle={libraries.length > 0 ? `${data?.total || libraries.length} библиотек в системе` : "Загрузка..."}
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-muted/40 h-72" />
          ))}
        </div>
      ) : libraries.length === 0 ? (
        <EmptyState
          icon={IconBuilding}
          title="Библиотеки не найдены"
          description="Скоро здесь появятся библиотеки"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {libraries.map((lib, i) => (
            <motion.div
              key={lib.id}
              {...staggerItem}
              transition={{ ...staggerItem.transition, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => setSelected(lib)}
            >
              <div className="relative h-full rounded-2xl border border-border bg-white overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-black/[0.04]">
                {/* Image */}
                {lib.photo_url ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={optimizedUrl(lib.photo_url, 500)}
                      alt={lib.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center">
                    <IconBuilding size={40} className="text-primary/30" stroke={1.5} />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {lib.name}
                  </h3>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-start gap-1.5 min-w-0">
                      <IconMapPin size={14} stroke={1.5} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{lib.address}</span>
                    </p>
                    {lib.phone && (
                      <p className="flex items-center gap-1.5">
                        <IconPhone size={14} stroke={1.5} />
                        {lib.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Library Modal ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              {...backdropFade}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelected(null)}
            />

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
                  {selected.photo_url ? (
                    <img
                      src={optimizedUrl(selected.photo_url, 800)}
                      alt={selected.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <IconBuilding size={48} className="text-white/40" stroke={1.5} />
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
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                    <h2 className="section-title">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
                      <IconMapPin size={14} className="mt-0.5 shrink-0" />
                      {selected.address}
                    </p>
                  </div>

                  {/* Info cards */}
                  <div className="space-y-3">
                    {selected.phone && (
                      <a
                        href={`tel:${selected.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconPhone size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Телефон</p>
                          <p className="text-sm font-medium text-foreground">{selected.phone}</p>
                        </div>
                      </a>
                    )}

                    <a
                      href={twoGisUrl(selected.lat, selected.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconExternalLink size={18} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Маршрут</p>
                        <p className="text-sm font-medium text-foreground">Открыть в 2ГИС</p>
                      </div>
                    </a>
                  </div>

                  {/* Map */}
                  {selected.lat !== 0 && selected.lng !== 0 && (
                    <div className="rounded-xl overflow-hidden border border-border h-64">
                      <MapContainer
                        key={selected.id}
                        center={[selected.lat, selected.lng]}
                        zoom={15}
                        scrollWheelZoom={false}
                        className="h-full w-full"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={[selected.lat, selected.lng]} icon={defaultIcon}>
                          <Popup>
                            <strong>{selected.name}</strong>
                            <br />
                            {selected.address}
                          </Popup>
                        </Marker>
                      </MapContainer>
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

export default Libraries;
