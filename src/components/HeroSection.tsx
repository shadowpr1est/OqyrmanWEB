import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

const AVATAR_INITIALS = ["А", "Д", "М", "С"];
const AVATAR_COLORS = ["bg-emerald-400", "bg-teal-400", "bg-cyan-400", "bg-green-400"];

function ReaderMockup() {
  return (
    <div className="relative w-full max-w-[420px]">
      {/* Ambient glow */}
      <div className="absolute -inset-6 bg-emerald-500/15 rounded-3xl blur-3xl pointer-events-none" />

      {/* Main reader card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative rounded-2xl border border-white/[0.1] bg-[#0c2318]/95 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-black/20">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
          <div className="flex-1 flex justify-center">
            <div className="h-4 rounded-md bg-white/[0.05] w-36" />
          </div>
          <span className="text-[10px] text-emerald-400/50 font-medium tabular-nums">стр. 47 / 112</span>
        </div>

        {/* Book header */}
        <div className="px-6 pt-5 pb-3 border-b border-white/[0.04]">
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Ф. М. Достоевский</p>
          <p className="text-sm font-semibold text-white/65">Преступление и наказание</p>
        </div>

        {/* Book content */}
        <div className="px-6 py-5 space-y-3 font-serif">
          <p className="text-[12.5px] leading-[1.9] text-white/50">
            Раскольников медленно поднялся по узкой лестнице к своей каморке на пятом этаже.
          </p>

          {/* Highlighted passage */}
          <div className="relative flex">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-emerald-400/70 rounded-full" />
            <p className="text-[12.5px] leading-[1.9] text-white/90 bg-emerald-500/[0.13] rounded-r-md pl-3 pr-2 py-1">
              — Тварь ли я дрожащая или право имею?
            </p>
          </div>

          <p className="text-[12.5px] leading-[1.9] text-white/50">
            Мысли путались, он никак не мог сосредоточиться на главном...
          </p>
        </div>

        {/* Progress */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/20">Прогресс чтения</span>
            <span className="text-[10px] text-emerald-400/60 font-medium">42%</span>
          </div>
          <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "42%" }}
              transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Floating AI popover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5, ease: "easeOut" }}
        className="absolute -bottom-6 -right-6 w-[228px] rounded-2xl bg-white border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.18)] p-4 z-10"
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles size={12} className="text-primary" />
          </div>
          <span className="text-[12px] font-semibold text-foreground">AI Ассистент</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-[11.5px] text-muted-foreground leading-[1.65]">
          «Тварь дрожащая» — ключевая фраза теории Раскольникова. Наполеон как архетип «право имеющего»...
        </p>
        <div className="flex gap-2 mt-3">
          <div className="text-[10.5px] text-primary bg-primary/10 rounded-lg px-2.5 py-1.5 font-medium cursor-default">
            В чат →
          </div>
          <div className="text-[10.5px] text-muted-foreground bg-muted rounded-lg px-2.5 py-1.5 cursor-default">
            В заметки
          </div>
        </div>
      </motion.div>



    </div>
  );
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-20 bg-[#0d2b1f] overflow-hidden">
    {/* Gradient orbs */}
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.24, 0.18] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-700/20 rounded-full blur-[120px] pointer-events-none"
    />
    <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute top-1/2 -right-20 w-[280px] h-[280px] bg-emerald-900/30 rounded-full blur-[80px] pointer-events-none" />

    {/* Subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.032] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />

    <div className="container mx-auto px-4 lg:px-8 relative z-10 py-16">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: text */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={item}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] text-emerald-300 text-sm font-medium mb-8 border border-white/[0.1]">
              <BookOpen size={14} />
              Цифровая библиотека Казахстана
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6"
          >
            Вся библиотека
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Алматы — в кармане.
            </span>
          </motion.h1>

          <motion.p variants={item} className="text-base sm:text-lg text-white/55 mb-10 max-w-lg leading-relaxed">
            Бронируйте книги онлайн, читайте с&nbsp;AI-ассистентом прямо в&nbsp;читалке
            и&nbsp;забирайте в&nbsp;ближайшей библиотеке Алматы.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary hover:bg-white/90 font-semibold text-[15px] transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_60px_rgba(255,255,255,0.18)]"
            >
              Найти книгу <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white/70 hover:bg-white/[0.1] hover:text-white font-medium text-[15px] transition-all duration-200"
            >
              Узнать больше
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={item} className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {AVATAR_INITIALS.map((letter, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full ${AVATAR_COLORS[i]} border-2 border-[#0d2b1f] flex items-center justify-center text-[10px] font-bold text-white`}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/35">
              <span className="text-white/60 font-medium">Сотни читателей</span> уже с нами
            </p>
          </motion.div>
        </motion.div>

        {/* Right: product mockup */}
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex justify-center lg:justify-end"
        >
          <ReaderMockup />
        </motion.div>
      </div>
    </div>

    {/* Bottom fade into StatsSection */}
    <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0a1f17] to-transparent pointer-events-none" />
  </section>
);
