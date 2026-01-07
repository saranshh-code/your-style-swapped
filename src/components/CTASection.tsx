import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-6">
            Get Started
          </p>
          <h2 className="font-display text-4xl md:text-6xl text-foreground mb-8">
            Ready to create
            <br />
            something unique?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            Turn your ideas into custom apparel today. No minimum orders, no design skills required. 
            Just your vision and our AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/design">
                Start your design
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl">
              Contact sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
