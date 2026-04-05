import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";

export const CtaSection = () => (
  <section className="py-24 md:py-32 relative overflow-hidden">
    <div className="container mx-auto px-4 lg:px-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative rounded-3xl overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b1f] via-[#13382a] to-[#0a1f17]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/15 rounded-full blur-[80px]" />

        {/* Content */}
        <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-300 text-sm font-medium mb-8 backdrop-blur-sm border border-white/10"
          >
            <IconSparkles size={16} />
            Бесплатно для всех читателей
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight"
          >
            Начните читать{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              сегодня
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-white/60 mb-10 max-w-lg mx-auto"
          >
            Присоединяйтесь к сотням читателей Казахстана. Регистрация занимает менее минуты.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              size="xl"
              className="bg-white text-primary hover:bg-white/90 font-semibold shadow-xl shadow-black/20 h-14 px-10 py-4 text-base"
              asChild
            >
              <Link to="/register">
                Зарегистрироваться бесплатно
                <IconArrowRight size={20} className="ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);
