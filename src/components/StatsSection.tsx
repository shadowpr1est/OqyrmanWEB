import { motion } from "framer-motion";
import { IconBook, IconBuilding, IconQrcode, IconCalendarEvent } from "@tabler/icons-react";

const features = [
  {
    icon: IconBook,
    title: "Каталог казахстанских библиотек",
    description: "Книги на казахском и русском языках в одном месте",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: IconBuilding,
    title: "Умный ИИ-помощник",
    description: "Объяснения, перевод и рекомендации прямо в читалке",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: IconQrcode,
    title: "QR читательский билет",
    description: "Одно сканирование — и вы в библиотеке",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: IconCalendarEvent,
    title: "Онлайн-бронирование и события",
    description: "Бронируйте книги и следите за мероприятиями без очередей",
    color: "from-emerald-400 to-green-500",
  },
];

export const StatsSection = () => (
  <section className="relative py-20 bg-[#0a1f17] overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />

    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]" />

    <div className="container mx-auto px-4 lg:px-8 relative">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative"
          >
            <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 lg:p-8 text-center overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />

              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} mb-5 shadow-lg shadow-emerald-900/20`}>
                <f.icon size={26} className="text-white" stroke={1.5} />
              </div>

              <div className="text-sm lg:text-base font-semibold text-white mb-2 leading-snug">
                {f.title}
              </div>
              <div className="text-xs text-white/45 leading-relaxed">{f.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
