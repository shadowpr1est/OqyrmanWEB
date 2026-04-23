import { Link } from "react-router-dom";
import { WavyBackground } from "@/components/ui/wavy-background";
import { AnimateIn } from "@/components/AnimateIn";
import { BookOpen, ArrowRight } from "lucide-react";

export const HeroSection = () => (
  <WavyBackground
    containerClassName="relative min-h-screen pt-20"
    backgroundFill="#0d2b1f"
    waveOpacity={0.6}
    blur={8}
    speed="slow"
  >
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <AnimateIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium mb-8 backdrop-blur-sm border border-white/20">
            <BookOpen size={16} />
            Цифровая библиотека Казахстана
          </div>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Читайте больше.
            <br />
            <span className="text-emerald-400">Живите ярче.</span>
          </h1>
        </AnimateIn>

        <AnimateIn delay={0.2}>
          <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto text-balance">
            Oqyrman — цифровая библиотека Казахстана. Бронируйте книги онлайн и забирайте в ближайшей библиотеке.
          </p>
        </AnimateIn>

        <AnimateIn delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary hover:bg-white/90 font-semibold text-base transition-all duration-200"
            >
              Найти книгу <ArrowRight size={20} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-transparent border border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-semibold text-base transition-all duration-200"
            >
              Узнать больше
            </a>
          </div>
        </AnimateIn>
      </div>
    </div>
  </WavyBackground>
);
