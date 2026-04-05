import { AnimateIn } from "@/components/AnimateIn";
import { BookOpen, MapPin, CalendarCheck, Sparkles, QrCode, Bell } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Большой каталог", desc: "Классика, казахская литература, мировые бестселлеры" },
  { icon: MapPin, title: "Карта библиотек", desc: "Найдите ближайшую библиотеку рядом с вами" },
  { icon: CalendarCheck, title: "Онлайн бронирование", desc: "Забронируйте книгу не выходя из дома" },
  { icon: Sparkles, title: "AI рекомендации", desc: "Персональные рекомендации на основе ваших предпочтений" },
  { icon: QrCode, title: "QR читательский билет", desc: "Ваш цифровой читательский билет всегда с вами" },
  { icon: Bell, title: "Уведомления", desc: "Напомним когда нужно вернуть книгу" },
];

export const FeaturesSection = () => (
  <section id="features" className="py-20 md:py-28">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimateIn className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Всё для комфортного чтения</h2>
      </AnimateIn>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <AnimateIn key={f.title} delay={i * 0.08}>
            <div className="group p-6 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <f.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </div>
  </section>
);
