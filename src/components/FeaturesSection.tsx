import { motion } from "framer-motion";
import { IconBook, IconMapPin, IconCalendarCheck, IconSparkles, IconQrcode, IconBell } from "@tabler/icons-react";

const features = [
  {
    icon: IconBook,
    title: "Большой каталог",
    desc: "Классика, казахская литература, мировые бестселлеры — всё собрано в одном месте с удобным поиском и фильтрами.",
    gradient: "from-emerald-500 to-teal-500",
    accent: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
  {
    icon: IconMapPin,
    title: "Карта библиотек",
    desc: "Интерактивная карта с 10 библиотеками Алматы. Найдите ближайшую, посмотрите часы работы и наличие книг.",
    gradient: "from-teal-500 to-cyan-500",
    accent: "bg-teal-500/10 group-hover:bg-teal-500/20",
  },
  {
    icon: IconCalendarCheck,
    title: "Онлайн бронирование",
    desc: "Забронируйте книгу в два клика и заберите в удобное время. Система отслеживает наличие в реальном времени.",
    gradient: "from-cyan-500 to-blue-500",
    accent: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
  },
  {
    icon: IconSparkles,
    title: "AI рекомендации",
    desc: "Персональный AI-помощник анализирует ваши предпочтения и предлагает книги, которые вам точно понравятся.",
    gradient: "from-violet-500 to-purple-500",
    accent: "bg-violet-500/10 group-hover:bg-violet-500/20",
  },
  {
    icon: IconQrcode,
    title: "QR читательский билет",
    desc: "Забудьте про пластиковые карты. Ваш цифровой билет всегда в телефоне — просто покажите QR-код.",
    gradient: "from-amber-500 to-orange-500",
    accent: "bg-amber-500/10 group-hover:bg-amber-500/20",
  },
  {
    icon: IconBell,
    title: "Умные уведомления",
    desc: "Напомним о сроке возврата, подскажем когда появится ожидаемая книга и сообщим о новых поступлениях.",
    gradient: "from-rose-500 to-pink-500",
    accent: "bg-rose-500/10 group-hover:bg-rose-500/20",
  },
];

export const FeaturesSection = () => (
  <section id="features" className="py-24 md:py-32 relative overflow-hidden">
    {/* Background accents */}
    <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/[0.03] rounded-full blur-[100px]" />
    <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-teal-500/[0.04] rounded-full blur-[100px]" />

    <div className="container mx-auto px-4 lg:px-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 md:mb-20"
      >
        <span className="inline-block text-sm font-semibold text-primary tracking-wider uppercase mb-4">Возможности</span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          Всё для комфортного чтения
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Современные инструменты, которые делают чтение простым и доступным
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group relative"
          >
            <div className="relative h-full rounded-2xl border border-border bg-white p-6 lg:p-7 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]`} />
              <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${f.accent} flex items-center justify-center mb-5 transition-all duration-300`}>
                <f.icon size={24} className="text-foreground/80" stroke={1.5} />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2.5">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>

              {/* Bottom gradient line on hover */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
