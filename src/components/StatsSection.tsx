import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { IconBook, IconBuilding, IconUsers, IconQrcode } from "@tabler/icons-react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(count, value, { duration: 2, ease: "easeOut" });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  { icon: IconBook,     value: 200,  suffix: "+", label: "книг в каталоге",    color: "from-emerald-500 to-teal-600" },
  { icon: IconBuilding, value: 10,   suffix: "",  label: "библиотек в Алматы", color: "from-teal-500 to-cyan-600" },
  { icon: IconUsers,    value: 500,  suffix: "+", label: "активных читателей", color: "from-cyan-500 to-blue-500" },
  { icon: IconQrcode,   value: 0,    suffix: "",  label: "QR читательский билет", color: "from-emerald-400 to-green-500", isQR: true },
];

export const StatsSection = () => (
  <section className="relative py-20 bg-[#0a1f17] overflow-hidden">
    {/* Subtle grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />

    {/* Glow orbs */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]" />

    <div className="container mx-auto px-4 lg:px-8 relative">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative"
          >
            <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 lg:p-8 text-center overflow-hidden">
              {/* Hover gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />

              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} mb-5 shadow-lg shadow-emerald-900/20`}>
                <s.icon size={26} className="text-white" stroke={1.5} />
              </div>

              <div className="text-3xl lg:text-4xl font-bold text-white mb-1.5">
                {s.isQR ? "QR" : <AnimatedNumber value={s.value} suffix={s.suffix} />}
              </div>
              <div className="text-sm text-white/50 font-medium">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
