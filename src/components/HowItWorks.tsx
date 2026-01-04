import { Upload, Wand2, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "UPLOAD & CUSTOMIZE",
    description:
      "Share your inspiration—upload a logo, image, or describe your vision. Select colors, fabrics, and embroidery styles.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "AI MAGIC",
    description:
      "Our AI transforms your ideas into stunning, production-ready designs. Preview your custom mockup in seconds.",
  },
  {
    icon: Package,
    number: "03",
    title: "WE SHIP",
    description:
      "Once approved, we produce your premium custom apparel and ship it directly to your door within 48 hours.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary uppercase tracking-widest text-sm mb-4">The Process</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">HOW IT WORKS</h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Number */}
              <span className="absolute top-4 right-4 font-display text-6xl text-muted/30">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-2xl text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>

              {/* Connector line (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-border to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
