import { Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">
              Goal<span className="text-primary">Sync</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Sign In
            </Link>
            <Button asChild className="gap-2 rounded-full px-5">
              <Link to="/auth?mode=signup">
                <Sparkles className="w-4 h-4" />
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
