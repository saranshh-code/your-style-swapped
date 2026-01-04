import { Palette, Shirt, ImageIcon, Zap, Shield, Truck } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Unlimited Colors",
    description: "Choose from an infinite palette to match your brand or style perfectly.",
  },
  {
    icon: Shirt,
    title: "Premium Fabrics",
    description: "Heavyweight cotton, organic blends, and performance materials.",
  },
  {
    icon: ImageIcon,
    title: "Upload Anything",
    description: "Logos, artwork, photos, or just describe your vision in words.",
  },
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Advanced AI creates production-ready designs in seconds.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "100% satisfaction guarantee on every custom piece.",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Production and delivery in as little as 48 hours.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary uppercase tracking-widest text-sm mb-4">Why Swaps</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">BUILT DIFFERENT</h2>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card/50 border border-border hover:border-primary/30 hover:bg-card transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
