import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  IconBook,
  IconMapPin,
  IconCalendarCheck,
  IconSparkles,
  IconQrcode,
  IconBell,
} from "@tabler/icons-react";

function TypingDots() {
  return (
    <div className="flex gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-border/60 w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-foreground/30"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/[0.03] rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-teal-500/[0.04] rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14 md:mb-20"
        >
          <span className="inline-block text-sm font-semibold text-primary tracking-wider uppercase mb-4">
            {t("features.badge")}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t("features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">

          {/* AI рекомендации */}
          <motion.div custom={0} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="sm:col-span-2 lg:col-span-2 group">
            <div className="relative h-full rounded-2xl border border-border bg-white p-6 lg:p-8 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]" />
              <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />
              <div className="relative grid sm:grid-cols-2 gap-6 items-start">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center mb-5 transition-colors duration-300">
                    <IconSparkles size={24} className="text-emerald-600" stroke={1.5} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-foreground mb-2.5">{t("features.ai.title")}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t("features.ai.desc")}</p>
                </div>
                <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 space-y-2.5">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground text-[11.5px] rounded-2xl rounded-br-sm px-3.5 py-2 max-w-[90%] leading-[1.55]">
                      {t("features.aiChat.userMsg")}
                    </div>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <IconSparkles size={9} className="text-emerald-600" />
                    </div>
                    <div className="bg-white border border-border/60 text-foreground/70 text-[11.5px] rounded-2xl rounded-bl-sm px-3.5 py-2 max-w-[90%] leading-[1.55]">
                      {t("features.aiChat.aiReply")}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <IconSparkles size={9} className="text-emerald-600" />
                    </div>
                    <TypingDots />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* QR билет */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="group">
            <div className="relative h-full rounded-2xl border border-border bg-white p-6 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]" />
              <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 flex items-center justify-center mb-5 transition-colors duration-300">
                <IconQrcode size={24} className="text-amber-600" stroke={1.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-foreground mb-2.5">{t("features.qr.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("features.qr.desc")}</p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* Каталог */}
          <motion.div custom={2} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="group">
            <div className="relative h-full rounded-2xl border border-border bg-white p-6 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]" />
              <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center mb-5 transition-colors duration-300">
                <IconBook size={24} className="text-emerald-600" stroke={1.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-foreground mb-2.5">{t("features.catalog.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("features.catalog.desc")}</p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* Карта */}
          <motion.div custom={3} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="group">
            <div className="relative h-full rounded-2xl border border-border bg-white p-6 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]" />
              <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 flex items-center justify-center mb-5 transition-colors duration-300">
                <IconMapPin size={24} className="text-teal-600" stroke={1.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-foreground mb-2.5">{t("features.map.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("features.map.desc")}</p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* Бронирование */}
          <motion.div custom={4} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="group">
            <div className="relative h-full rounded-2xl border border-border bg-white p-6 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]" />
              <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 flex items-center justify-center mb-5 transition-colors duration-300">
                <IconCalendarCheck size={24} className="text-cyan-600" stroke={1.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-foreground mb-2.5">{t("features.booking.title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("features.booking.desc")}</p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* Уведомления */}
          <motion.div custom={5} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="sm:col-span-2 lg:col-span-3">
            <div className="rounded-2xl border border-border bg-muted/30 p-6 lg:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10">
              <div className="sm:max-w-[260px] shrink-0">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                  <IconBell size={24} className="text-rose-500" stroke={1.5} />
                </div>
                <h3 className="text-[17px] font-semibold text-foreground mb-2">{t("features.notifications.title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t("features.notifications.desc")}</p>
              </div>

              <div className="hidden sm:block self-stretch w-px bg-border/60 shrink-0" />

              <div className="flex flex-col gap-2.5 flex-1 w-full">
                {([
                  { emoji: "📚", text: t("features.notifications.pill1"), cls: "border-amber-200/80 bg-amber-50 text-amber-800" },
                  { emoji: "🆕", text: t("features.notifications.pill2"), cls: "border-emerald-200/80 bg-emerald-50 text-emerald-800" },
                  { emoji: "✅", text: t("features.notifications.pill3"), cls: "border-blue-200/80 bg-blue-50 text-blue-800" },
                ] as const).map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[13px] font-medium ${n.cls}`}
                  >
                    <span>{n.emoji}</span>
                    <span>{n.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
