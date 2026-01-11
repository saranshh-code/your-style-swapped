import { Palette, Shirt, ImageIcon, Zap, Shield, Truck } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Unlimited Colors",
    description: "Choose from an infinite palette to match your brand or personal style with precision.",
  },
  {
    icon: Shirt,
    title: "Premium Fabrics",
    description: "Heavyweight cotton, organic blends, and performance materials crafted for comfort.",
  },
  {
    icon: ImageIcon,
    title: "Upload Anything",
    description: "Logos, artwork, photographs, or simply describe your vision in words.",
  },
  {
    icon: Zap,
    title: "AI-Powered Design",
    description: "Advanced AI creates production-ready designs in seconds, not hours.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "100% satisfaction guarantee on every custom piece we produce.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Production and delivery in as little as 5 days worldwide.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-sm tracking-[0.2em] uppercase text-white/60 mb-4">Why Swaps</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
            Built for quality,
            <br />designed for you
          </h2>
          <p className="text-white/70 text-lg">
            Every detail considered. Every stitch intentional.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-xl text-white mb-3">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
