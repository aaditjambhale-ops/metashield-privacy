import { Cloud, HardDrive, FolderOpen, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CloudProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  comingSoon: boolean;
}

const providers: CloudProvider[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "🔵",
    description: "Scan and clean metadata from files stored in your Google Drive account.",
    connected: false,
    comingSoon: true,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "🔷",
    description: "Connect your Dropbox to detect and remove hidden metadata from documents.",
    connected: false,
    comingSoon: true,
  },
  {
    id: "onedrive",
    name: "OneDrive",
    icon: "☁️",
    description: "Integrate with Microsoft OneDrive for cloud-based metadata scanning.",
    connected: false,
    comingSoon: true,
  },
  {
    id: "icloud",
    name: "iCloud Drive",
    icon: "🍎",
    description: "Access and sanitize files from your iCloud Drive storage.",
    connected: false,
    comingSoon: true,
  },
];

const CloudStorageSection = () => {
  return (
    <section id="cloud-storage" className="py-20 px-6">
      <div className="container mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Cloud className="h-4 w-4" />
            Coming Soon
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Cloud Storage <span className="gradient-text">Integration</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Connect your cloud storage accounts to scan, detect, and remove metadata from all your files — without downloading them first.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: FolderOpen, title: "Connect", desc: "Link your cloud storage account securely via OAuth" },
            { icon: HardDrive, title: "Scan", desc: "We analyze metadata across all your cloud files" },
            { icon: Lock, title: "Clean", desc: "Remove sensitive metadata with one click" },
          ].map((step, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="glass-card p-6 space-y-4 hover-lift group relative overflow-hidden"
            >
              {provider.comingSoon && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              )}

              <div className="text-3xl">{provider.icon}</div>

              <div className="space-y-1">
                <h3 className="font-display font-semibold text-foreground">{provider.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{provider.description}</p>
              </div>

              <Button
                variant="glass"
                size="sm"
                className="w-full gap-2 opacity-60 cursor-not-allowed"
                disabled
              >
                {provider.connected ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </>
                ) : (
                  <>
                    Connect
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card p-8 text-center space-y-4 max-w-xl mx-auto glow-effect">
          <h3 className="font-display text-xl font-bold text-foreground">
            Want early access?
          </h3>
          <p className="text-sm text-muted-foreground">
            Cloud storage integration is under development. Join the waitlist to be notified when it launches.
          </p>
          <Button variant="gradient" className="gap-2">
            Join Waitlist
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CloudStorageSection;
