import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import hoodieImage from "@/assets/hoodie-hero.png";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-6">
              AI-Powered Custom Apparel
            </p>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 text-foreground">
              Precision crafted,
              <br />
              <span className="text-muted-foreground">uniquely yours</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed">
              Transform your vision into premium custom apparel with AI-powered design. 
              No minimum orders, delivered to your door.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/design">
                  Start designing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <a href="#how-it-works">
                  Learn more
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="gap-12 mt-16 lg:justify-start flex-row flex items-start justify-center">
              <div>
                <p className="text-3xl font-display text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground mt-1">Designs created</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-3xl font-display text-foreground">48h</p>
                <p className="text-sm text-muted-foreground mt-1">Fast delivery</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-3xl font-display text-foreground">100%</p>
                <p className="text-sm text-muted-foreground mt-1">Custom made</p>
              </div>
            </div>
          </div>

          {/* Right Content - Product Image */}
          <div className="relative flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/50 rounded-3xl -rotate-3 scale-95" />
              <div className="relative bg-secondary rounded-2xl p-12">
                <img src={hoodieImage} alt="Custom hoodie mockup" className="relative z-10 w-full max-w-[420px] animate-float drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
      </div>
    </section>;
};
export default HeroSection;