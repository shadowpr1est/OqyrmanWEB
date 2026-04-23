import { motion } from "framer-motion";
import { IconTargetArrow, IconHeart, IconBulb, IconUsers, IconCheck } from "@tabler/icons-react";

const values = [
  {
    icon: IconTargetArrow,
    title: "Миссия",
    desc: "Сделать чтение доступным каждому жителю Казахстана через современные цифровые технологии.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: IconBulb,
    title: "Инновации",
    desc: "AI-рекомендации, QR-билеты, онлайн-бронирование — мы переосмысляем библиотечный опыт.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: IconHeart,
    title: "Сообщество",
    desc: "Объединяем читателей, авторов и библиотеки в единую экосистему знаний и культуры.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: IconUsers,
    title: "Доступность",
    desc: "Бесплатный доступ к каталогу для каждого. Никаких подписок — просто приходи и читай.",
    gradient: "from-violet-500 to-purple-500",
  },
];

const highlights = [
  "AI-ассистент прямо в читалке",
  "QR-билет вместо пластиковой карты",
  "Онлайн-бронирование в два клика",
  "Уведомления о сроках возврата",
];

export const AboutSection = () => (
  <section id="about" className="py-24 md:py-32 relative overflow-hidden">
    {/* Background accents */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 -left-40 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[100px]" />

    <div className="container mx-auto px-4 lg:px-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 md:mb-20"
      >
        <span className="inline-block text-sm font-semibold text-primary tracking-wider uppercase mb-4">
          О проекте
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">
          Мы верим в силу{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
            знаний
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Oqyrman — это не просто каталог книг. Это платформа, которая соединяет людей с книгами,
          библиотеками и друг с другом. Мы строим будущее чтения в Казахстане.
        </p>
      </motion.div>

      {/* Story block */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden mb-20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b1f] via-[#13382a] to-[#0a1f17]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-teal-400/10 rounded-full blur-[80px]" />

        <div className="relative px-8 py-14 md:px-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: story text */}
            <div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block text-xs font-semibold text-emerald-400/70 uppercase tracking-widest mb-4"
              >
                Наша история
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold text-white mb-5 leading-tight"
              >
                От идеи студентов до{" "}
                <span className="text-emerald-400">цифровой платформы</span>
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-white/55 leading-relaxed"
              >
                Oqyrman родился из простой проблемы: найти нужную книгу в библиотеках Алматы
                было слишком сложно. Мы решили это изменить — создали платформу, где каждый
                может найти, забронировать и забрать книгу за пару кликов.
              </motion.p>
            </div>

            {/* Right: feature highlights */}
            <div className="flex flex-col gap-3">
              {highlights.map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-5 py-3.5"
                >
                  <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <IconCheck size={13} className="text-emerald-400" stroke={2.5} />
                  </div>
                  <span className="text-sm text-white/75 font-medium">{text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Values */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group relative"
          >
            <div className="relative h-full rounded-2xl border border-border bg-white p-6 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${v.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]`} />
              <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />

              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/10`}>
                <v.icon size={20} className="text-white" stroke={1.5} />
              </div>

              <h3 className="text-base font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>

              <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${v.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
