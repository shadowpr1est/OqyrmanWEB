import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactsSection } from "@/components/ContactsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background overflow-x-hidden">
    <Navbar />
    <HeroSection />
    <StatsSection />
    <FeaturesSection />
    <HowItWorksSection />
    <AboutSection />
    <ContactsSection />
    <CtaSection />
    <Footer />
  </div>
);

export default Index;
