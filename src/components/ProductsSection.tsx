import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import hoodieImage from "@/assets/hoodie-hero.jpg";
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
    <section id="products" className="py-32">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div className="max-w-lg">
            <p className="text-sm tracking-[0.2em] uppercase text-white/60 mb-4">Our Canvas</p>
            <h2 className="font-display text-4xl md:text-5xl text-white">
              Choose your style
            </h2>
          </div>
          <Button variant="heroOutline" size="lg" className="mt-6 md:mt-0 border-white/30 text-white hover:bg-white/10">
            View all products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              to="/design"
              key={product.name}
              className="group relative rounded-xl bg-white/10 backdrop-blur-md border border-white/10 overflow-hidden hover:border-white/30 hover:shadow-lg transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-80 overflow-hidden bg-white/5">
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-6 bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-xl text-white">{product.name}</h3>
                  <span className="text-sm font-medium text-white/70">{product.price}</span>
                </div>
                <p className="text-white/70 text-sm">{product.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-white group-hover:underline underline-offset-4">
                  Customize
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
