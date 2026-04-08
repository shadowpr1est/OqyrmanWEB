import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMapPin,
  IconPhone,
  IconBuilding,
  IconX,
  IconExternalLink,
  IconNavigation,
} from "@tabler/icons-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { librariesApi } from "@/lib/api";
import type { Library } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";

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

const Libraries = () => {
  const [selected, setSelected] = useState<Library | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["libraries"],
    queryFn: () => librariesApi.list({ limit: 50 }),
  });

  const libraries = data?.items || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Библиотеки
        </h1>
        <p className="text-muted-foreground">
          {libraries.length > 0
            ? `${data?.total || libraries.length} библиотек в системе`
            : "Загрузка..."}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse h-48 rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : libraries.length === 0 ? (
        <EmptyState
          icon={IconBuilding}
          title="Библиотеки не найдены"
          description="Скоро здесь появятся библиотеки"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {libraries.map((lib, i) => (
            <motion.div
              key={lib.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => setSelected(lib)}
            >
              <div className="relative h-full rounded-2xl border border-border bg-white p-6 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]" />
                <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/10">
                  <IconBuilding size={22} className="text-white" stroke={1.5} />
                </div>

                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {lib.name}
                </h3>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <IconMapPin size={14} stroke={1.5} />
                    {lib.address}
                  </p>
                  {lib.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <IconPhone size={14} stroke={1.5} />
                      {lib.phone}
                    </p>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Library Modal ── */}
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
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/10 flex-shrink-0">
                    <IconBuilding size={22} className="text-white" stroke={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <IconMapPin size={14} />
                      {selected.address}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
                >
                  <IconX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Info */}
                <div className="space-y-3">
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <IconPhone size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Телефон</p>
                        <p className="text-sm font-medium text-foreground">{selected.phone}</p>
                      </div>
                    </a>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      <IconNavigation size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Координаты</p>
                      <p className="text-sm font-medium text-foreground">
                        {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                      </p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-primary"
                      title="Открыть в Google Maps"
                    >
                      <IconExternalLink size={16} />
                    </a>
                  </div>
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
