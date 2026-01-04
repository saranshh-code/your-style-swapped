import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import hoodieImage from "@/assets/hoodie-hero.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Design</span>
            </div>
            
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-none mb-6">
              YOUR VISION,
              <br />
              <span className="gradient-text">WE CREATE</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8">
              Upload your inspiration, choose your style, and let AI craft the perfect custom apparel. 
              From concept to doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl">
                Design Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="heroOutline" size="xl">
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 justify-center lg:justify-start">
              <div>
                <p className="font-display text-4xl text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Designs Created</p>
              </div>
              <div>
                <p className="font-display text-4xl text-foreground">48HR</p>
                <p className="text-sm text-muted-foreground">Fast Delivery</p>
              </div>
              <div>
                <p className="font-display text-4xl text-foreground">100%</p>
                <p className="text-sm text-muted-foreground">Custom Made</p>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Hoodie */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] rounded-full bg-primary/20 blur-[80px]" />
            </div>
            <img
              src={hoodieImage}
              alt="Custom hoodie mockup"
              className="relative z-10 w-full max-w-[500px] animate-float drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
