import { Link } from "react-router-dom";
import { AnimateIn } from "@/components/AnimateIn";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CtaSection = () => (
  <section className="py-20 md:py-28 bg-surface">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimateIn className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Начните читать сегодня</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Присоединяйтесь к тысячам читателей Казахстана
        </p>
        <Button size="xl" asChild>
          <Link to="/register">
            Зарегистрироваться бесплатно <ArrowRight size={20} />
          </Link>
        </Button>
      </AnimateIn>
    </div>
  </section>
);
