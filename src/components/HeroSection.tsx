import { CheckCircle, ArrowRight, Cpu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="space-y-8 animate-fade-in">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            Protect Your{" "}
            <span className="gradient-text">Digital Footprint</span>{" "}
            Without Leaving Your Browser.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            ExifShield strips hidden metadata from your photos and documents locally.
            No uploads, no servers, 100% privacy.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary">
              <Cpu className="h-4 w-4" />
              Local Processing
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 border border-success/20 px-4 py-2 text-sm text-success">
              <ShieldCheck className="h-4 w-4" />
              Integrity Guaranteed
            </span>
          </div>
        </div>

        {/* Right - Scan Result Card */}
        <div className="flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="gradient-border p-8 w-full max-w-sm animate-float">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Scan Complete</h3>
              <p className="text-sm text-muted-foreground">2 files analyzed</p>
              <Button variant="gradient" size="lg" className="w-full mt-4">
                View Report <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
