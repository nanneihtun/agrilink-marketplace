import { Leaf, Sprout, Truck, ShoppingCart } from "lucide-react";

interface AppFooterProps {
  onShowAboutUs: () => void;
  onShowContactUs: () => void;
  onShowFAQ: () => void;
}

export function AppFooter({
  onShowAboutUs,
  onShowContactUs,
  onShowFAQ,
}: AppFooterProps) {
  return (
    <footer className="border-t bg-card mt-8">
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        {/* Core Mission Statement */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm md:text-base font-semibold">
              Connecting Myanmar's Agricultural Community
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
            Transparent pricing • Direct connections •
            Quality products • Trusted marketplace
          </p>
        </div>

        {/* Key Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sprout className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm md:text-base">
                For Farmers
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Direct sales • Fair pricing • Wider market
              reach
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm md:text-base">
                For Traders
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Quality sourcing • Efficient distribution •
              Network growth
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm md:text-base">
                For Buyers
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Quality sourcing • Efficient distribution •
              Network growth
            </p>
          </div>
        </div>
      </div>

      {/* Full-width separator */}
      <div className="border-t"></div>

      {/* Footer Links */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Project Information */}
          <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            <p>
              © 2025 AgriLink - Academic Project developed
              in partnership with Infinity Success Co. Ltd.
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <button
              onClick={onShowAboutUs}
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              About Us
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={onShowContactUs}
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Contact Us
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={onShowFAQ}
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}