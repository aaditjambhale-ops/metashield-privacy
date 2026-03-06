import { Shield, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navLinks = ["Features", "How it Works", "Privacy", "Pricing"];

const Navbar = () => {
  const [isDark, setIsDark] = useState(true);

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50 px-6 py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">MetaShield</span>
        </div>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="text-muted-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">user@metashield.io</span>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
