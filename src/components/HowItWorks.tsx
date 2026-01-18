import { Upload, Wand2, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload & Customize",
    description:
      "Share your inspiration—upload a logo, image, or describe your vision. Select colors, fabrics, and styles.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "AI Generates",
    description:
      "Our AI transforms your ideas into stunning, production-ready designs. Preview your custom mockup instantly.",
  },
  {
    icon: Package,
    number: "03",
    title: "We Deliver",
    description:
      "Once approved, we produce your premium custom apparel and ship it directly to your door within 5-7 working days.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-20">
          <p className="text-sm tracking-[0.2em] uppercase text-white/60 mb-4">The Process</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6">
            How it works
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            From concept to creation in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+60px)] w-[calc(100%-60px)] h-px bg-white/20" />
              )}
              
              <div className="relative p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                {/* Number badge */}
                <span className="inline-block text-xs tracking-[0.2em] text-white/60 mb-6">
                  STEP {step.number}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl text-white mb-4">{step.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
