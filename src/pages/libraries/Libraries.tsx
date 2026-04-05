import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconMapPin, IconPhone, IconBuilding } from "@tabler/icons-react";
import { librariesApi } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";

const Libraries = () => {
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
              className="group"
            >
              <Link to={`/libraries/${lib.id}`}>
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
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Libraries;
