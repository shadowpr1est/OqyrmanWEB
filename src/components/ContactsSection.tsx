import { motion } from "framer-motion";
import { IconMail, IconBrandTelegram, IconPhone } from "@tabler/icons-react";

const contacts = [
  {
    icon: IconMail,
    label: "Email",
    value: "oqyrmanapp@gmail.com",
    href: "mailto:oqyrmanapp@gmail.com",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: IconBrandTelegram,
    label: "Telegram",
    value: "@a2jz_power",
    href: "https://t.me/a2jz_power",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: IconPhone,
    label: "Телефон",
    value: "+7 (705) 196-26-55",
    href: "tel:+77051962655",
    gradient: "from-cyan-500 to-blue-500",
  },
];

export const ContactsSection = () => (
  <section id="contacts" className="py-24 md:py-32 bg-[#fafbfa] relative overflow-hidden">
    {/* Dot pattern */}
    <div
      className="absolute inset-0 opacity-[0.3]"
      style={{
        backgroundImage: "radial-gradient(circle, hsl(155 50% 23% / 0.07) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />

    {/* Glow */}
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/[0.04] rounded-full blur-[120px]" />
    <div className="absolute top-1/3 -left-20 w-72 h-72 bg-teal-500/[0.04] rounded-full blur-[100px]" />

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
          Контакты
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">
          Свяжитесь с нами
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Есть вопросы, предложения или хотите сотрудничать? Мы всегда рады обратной связи.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        {/* Contact cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {contacts.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative block"
            >
              <div className="relative h-full rounded-2xl border border-border bg-white p-6 text-center overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/[0.04]">
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px] scale-[1.02]`} />
                <div className="absolute inset-[1px] rounded-[15px] bg-white -z-10" />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/10`}>
                  <c.icon size={22} className="text-white" stroke={1.5} />
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-1">{c.label}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300">{c.value}</p>

                {/* Bottom gradient line */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  </section>
);
