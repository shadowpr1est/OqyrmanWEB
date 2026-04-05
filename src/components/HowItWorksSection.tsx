import { AnimateIn } from "@/components/AnimateIn";
import { UserPlus, Search, BookCheck } from "lucide-react";

const steps = [
  { icon: UserPlus, num: "01", title: "Зарегистрируйтесь", desc: "Создайте аккаунт за 1 минуту" },
  { icon: Search, num: "02", title: "Найдите книгу", desc: "Поиск по названию, автору или жанру" },
  { icon: BookCheck, num: "03", title: "Заберите в библиотеке", desc: "Покажите QR-код и получите книгу" },
];

export const HowItWorksSection = () => (
  <section className="py-20 md:py-28 bg-surface">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimateIn className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Как это работает?</h2>
      </AnimateIn>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((s, i) => (
          <AnimateIn key={s.num} delay={i * 0.15} className="text-center">
            <div className="text-5xl font-bold text-primary/20 mb-4">{s.num}</div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4">
              <s.icon size={28} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm">{s.desc}</p>
          </AnimateIn>
        ))}
      </div>
    </div>
  </section>
);
