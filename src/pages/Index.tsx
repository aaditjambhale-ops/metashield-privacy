import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhySection from "@/components/WhySection";
import TransparencyReport from "@/components/TransparencyReport";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WhySection />
      <TransparencyReport />

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">MetaShield</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 MetaShield. All processing happens locally in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
