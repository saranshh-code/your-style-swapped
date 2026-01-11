import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import hoodieImage from "@/assets/hoodie-hero.png";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden">
      {/* Gradient Overlay for Hero Section */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <p className="text-sm tracking-[0.2em] uppercase text-white/60 mb-6">
              AI-Powered Custom Apparel
            </p>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 text-white">
              Precision crafted,
              <br />
              <span className="text-white/70">uniquely yours</span>
            </h1>

            <p className="text-lg text-white/70 max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed">Transform your vision into premium custom apparel with AI-powered design , swap away your old boring designs and bring your ideas to life with swaps.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/design">
                  Start designing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild className="border-white/30 text-white hover:bg-white/10">
                <a href="#how-it-works">
                  Learn more
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="gap-12 mt-16 lg:justify-start flex-row flex items-start justify-center">
              <div>
                <p className="text-3xl font-display text-white">1k+</p>
                <p className="text-sm text-white/60 mt-1">Designs created</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-display text-white">5-7 days</p>
                <p className="text-sm text-white/60 mt-1">Fast delivery</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-display text-white">100%</p>
                <p className="text-sm text-white/60 mt-1">Custom made</p>
              </div>
            </div>
          </div>

          {/* Right Content - Product Image */}
          <div className="relative flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl -rotate-3 scale-95" />
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/10">
                <img alt="Custom hoodie mockup" className="relative z-10 w-full max-w-[420px] animate-float drop-shadow-2xl" src="/lovable-uploads/10ad7f5f-4a09-4d2b-aebb-ec1613a8826e.png" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="text-xs text-white/50 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>;
};
export default HeroSection;