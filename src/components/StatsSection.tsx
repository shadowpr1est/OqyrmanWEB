import { AnimateIn } from "@/components/AnimateIn";
import { BookOpen, Building2, Users, QrCode } from "lucide-react";

const stats = [
  { icon: BookOpen, value: "200+", label: "книг в каталоге" },
  { icon: Building2, value: "10", label: "библиотек в Алматы" },
  { icon: Users, value: "500+", label: "читателей" },
  { icon: QrCode, value: "QR", label: "читательский билет" },
];

export const StatsSection = () => (
  <section className="py-16 bg-surface border-y border-border">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <AnimateIn key={s.label} delay={i * 0.1} className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <s.icon size={24} />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </AnimateIn>
        ))}
      </div>
    </div>
  </section>
);
