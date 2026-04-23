import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconBrandGithub, IconBook, IconMapPin, IconStar, IconCode, IconMail } from "@tabler/icons-react";

const navLinks = [
  { label: "Каталог", to: "/catalog", icon: IconBook },
  { label: "Библиотеки", to: "/libraries", icon: IconMapPin },
  { label: "Возможности", to: "/#features", icon: IconStar },
];

export const Footer = () => (
  <footer className="relative bg-[#0a1f17] overflow-hidden">
    {/* Background texture */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,.3) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />

    {/* Glow accents */}
    <div className="absolute top-0 left-1/3 w-80 h-40 bg-emerald-500/10 rounded-full blur-[100px]" />
    <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-teal-400/8 rounded-full blur-[80px]" />

    {/* Top gradient divider */}
    <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

    <div className="container mx-auto px-4 lg:px-8 relative">
      {/* Main footer content */}
      <div className="py-16 md:py-20 grid md:grid-cols-12 gap-12 md:gap-8">
        {/* Brand column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5"
        >
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <img
              src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
              alt="Oqyrman"
              className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-xl font-bold text-white">Oqyrman</span>
          </Link>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-6">
            Цифровая библиотечная платформа Казахстана. Объединяем читателей
            и библиотеки в единую современную экосистему.
          </p>

          {/* Social / external links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/shadowpr1est/OqyrmanWEB"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.12] transition-all duration-300"
            >
              <IconBrandGithub size={18} stroke={1.5} />
            </a>
            <a
              href="mailto:oqyrmanapp@gmail.com"
              className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.12] transition-all duration-300"
            >
              <IconMail size={18} stroke={1.5} />
            </a>
          </div>
        </motion.div>

        {/* Navigation column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-3"
        >
          <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">
            Навигация
          </h4>
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="group flex items-center gap-2.5 text-sm text-white/50 hover:text-emerald-400 transition-colors duration-300"
              >
                <l.icon size={16} stroke={1.5} className="text-white/25 group-hover:text-emerald-400/70 transition-colors duration-300" />
                {l.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Developers column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-4"
        >
          <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">
            Разработчикам
          </h4>
          <a
            href="https://api.oqyrman.app/swagger/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <IconCode size={16} className="text-emerald-400" stroke={1.5} />
            </div>
            <div>
              <span className="block text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                API Documentation
              </span>
              <span className="block text-xs text-white/30">Swagger / OpenAPI</span>
            </div>
          </a>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Oqyrman. Все права защищены.
        </p>
        <p className="text-xs text-white/20">
          Сделано с ❤️ в Казахстане
        </p>
      </div>
    </div>

    {/* Bottom gradient line */}
    <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
  </footer>
);
