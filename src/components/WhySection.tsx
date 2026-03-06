import { Lock, Shield } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "100% Local",
    description: "All processing happens in your browser's memory. We never see your files.",
  },
  {
    icon: Shield,
    title: "Batch Stripping",
    description: "Process hundreds of files at once with our high-performance engine.",
  },
];

const WhySection = () => {
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-14 space-y-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Why ExifShield?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We built the most secure metadata removal tool by ensuring your data never leaves your device.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-8 hover-lift glow-effect space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}

          {/* Cyber-themed visual card */}
          <div className="glass-card p-8 flex items-center justify-center glow-effect overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 text-xs font-mono text-primary/60 space-y-1">
                <p>{">"} scanning metadata...</p>
                <p>{">"} EXIF data detected</p>
                <p>{">"} GPS coordinates found</p>
                <p>{">"} device info: iPhone 13</p>
                <p>{">"} stripping metadata...</p>
                <p>{">"} ✓ clean file generated</p>
              </div>
            </div>
            <div className="text-center space-y-3 relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto animate-pulse-glow">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <p className="font-display text-sm font-semibold text-muted-foreground">
                Secure Workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
