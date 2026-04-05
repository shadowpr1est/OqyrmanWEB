import { motion } from "framer-motion";
import { IconUserPlus, IconSearch, IconBookmark } from "@tabler/icons-react";

const steps = [
  {
    icon: IconUserPlus,
    num: "01",
    title: "Зарегистрируйтесь",
    desc: "Создайте аккаунт за 1 минуту. Получите цифровой читательский билет с QR-кодом мгновенно.",
  },
  {
    icon: IconSearch,
    num: "02",
    title: "Найдите книгу",
    desc: "Ищите по названию, автору или жанру. AI подскажет похожие книги и персональные рекомендации.",
  },
  {
    icon: IconBookmark,
    num: "03",
    title: "Заберите в библиотеке",
    desc: "Забронируйте онлайн. Придите в библиотеку, покажите QR-код — и книга ваша.",
  },
];

export const HowItWorksSection = () => (
  <section className="py-24 md:py-32 bg-[#fafbfa] relative overflow-hidden">
    {/* Decorative dots pattern */}
    <div
      className="absolute inset-0 opacity-[0.3]"
      style={{
        backgroundImage: "radial-gradient(circle, hsl(155 50% 23% / 0.07) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />

    <div className="container mx-auto px-4 lg:px-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 md:mb-20"
      >
        <span className="inline-block text-sm font-semibold text-primary tracking-wider uppercase mb-4">Как это работает</span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground">
          Три простых шага
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-[72px] left-[16%] right-[16%] h-[2px]">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 origin-left"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative text-center"
            >
              {/* Step number badge */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative inline-block mb-6"
              >
                <div className="w-[88px] h-[88px] rounded-3xl bg-white border-2 border-primary/10 shadow-lg shadow-primary/[0.06] flex items-center justify-center relative">
                  <s.icon size={36} className="text-primary" stroke={1.5} />

                  {/* Number tag */}
                  <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {s.num}
                  </span>
                </div>
              </motion.div>

              <h3 className="text-xl font-bold text-foreground mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
