import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    user,
    loading
  } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [{
    label: "Products",
    href: "#products"
  }, {
    label: "How It Works",
    href: "#how-it-works"
  }, {
    label: "Features",
    href: "#features"
  }];
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl tracking-tight text-foreground shadow-lg">
            Swaps
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(link => <a key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {link.label}
              </a>)}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && user ? <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="hero" size="default" asChild>
                  <Link to="/design">Start Creating</Link>
                </Button>
              </> : <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button variant="hero" size="default" asChild>
                  <Link to="/design">Start Creating</Link>
                </Button>
              </>}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && <div className="md:hidden py-6 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map(link => <a key={link.label} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </a>)}
              {!loading && user ? <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-4 h-4" />
                  Dashboard
                </Link> : <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign in
                </Link>}
              <Button variant="hero" size="lg" className="mt-4" asChild>
                <Link to="/design">Start Creating</Link>
              </Button>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;