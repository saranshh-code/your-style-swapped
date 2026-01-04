import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import hoodieImage from "@/assets/hoodie-hero.png";
import tshirtImage from "@/assets/tshirt-product.png";
import crewneckImage from "@/assets/crewneck-product.png";

const products = [
  {
    name: "Hoodies",
    description: "Premium heavyweight cotton blend",
    image: hoodieImage,
    price: "From $59",
  },
  {
    name: "T-Shirts",
    description: "100% organic cotton",
    image: tshirtImage,
    price: "From $29",
  },
  {
    name: "Crewnecks",
    description: "Soft fleece interior",
    image: crewneckImage,
    price: "From $49",
  },
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <p className="text-primary uppercase tracking-widest text-sm mb-4">Our Canvas</p>
            <h2 className="font-display text-5xl md:text-6xl text-foreground">CHOOSE YOUR STYLE</h2>
          </div>
          <Button variant="heroOutline" size="lg" className="mt-6 md:mt-0">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="group relative rounded-2xl bg-background border border-border overflow-hidden hover:border-primary/50 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-80 overflow-hidden bg-secondary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-colors" />
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-2xl text-foreground">{product.name}</h3>
                  <span className="text-primary font-semibold">{product.price}</span>
                </div>
                <p className="text-muted-foreground text-sm">{product.description}</p>
                <Button variant="ghost" className="mt-4 w-full group-hover:text-primary">
                  Customize
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
