import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, Package, Trash2, Plus, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SavedDesign {
  id: string;
  name: string;
  prompt: string;
  product_type: string;
  fabric_type: string;
  color: string;
  generated_image_url: string;
  created_at: string;
}

interface Order {
  id: string;
  design_id: string | null;
  status: string;
  quantity: number;
  size: string | null;
  total_price: number | null;
  created_at: string;
  saved_designs: SavedDesign | null;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"designs" | "orders">("designs");
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [designsRes, ordersRes] = await Promise.all([
        supabase
          .from("saved_designs")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("*, saved_designs(*)")
          .order("created_at", { ascending: false }),
      ]);

      if (designsRes.error) throw designsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      setDesigns(designsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load your data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_designs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDesigns((prev) => prev.filter((d) => d.id !== id));
      toast.success("Design deleted");
    } catch (error) {
      console.error("Error deleting design:", error);
      toast.error("Failed to delete design");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </Link>
            <h1 className="font-display text-xl text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl text-foreground">
              Swaps
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-10">
          <button
            onClick={() => setActiveTab("designs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "designs"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Designs ({designs.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "orders"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Package className="w-4 h-4" />
            Orders ({orders.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "designs" && (
          <div className="space-y-8">
            {designs.length === 0 ? (
              <div className="text-center py-20 rounded-xl border border-border bg-card">
                <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-2xl text-foreground mb-2">
                  No designs yet
                </h3>
                <p className="text-muted-foreground mb-8 text-sm">
                  Create your first custom design in the Design Studio
                </p>
                <Link to="/design">
                  <Button variant="hero" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create design
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="rounded-xl overflow-hidden border border-border bg-card group hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square bg-secondary/30 relative overflow-hidden">
                      <img
                        src={design.generated_image_url}
                        alt={design.name}
                        className="w-full h-full object-contain p-4"
                      />
                      <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDesign(design.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <h4 className="font-medium text-foreground truncate">
                        {design.name}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-md bg-secondary text-xs text-muted-foreground capitalize">
                          {design.product_type}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-secondary text-xs text-muted-foreground capitalize">
                          {design.fabric_type}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-secondary text-xs text-muted-foreground capitalize">
                          {design.color}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(design.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-20 rounded-xl border border-border bg-card">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-2xl text-foreground mb-2">
                  No orders yet
                </h3>
                <p className="text-muted-foreground mb-8 text-sm">
                  Order your first custom apparel from the Design Studio
                </p>
                <Link to="/design">
                  <Button variant="hero" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create design
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row gap-6"
                  >
                    {order.saved_designs && (
                      <div className="w-20 h-20 rounded-lg bg-secondary/30 overflow-hidden flex-shrink-0">
                        <img
                          src={order.saved_designs.generated_image_url}
                          alt="Order design"
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-md border text-xs font-medium capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Order #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Qty: {order.quantity}</span>
                        {order.size && <span>Size: {order.size}</span>}
                        {order.total_price && (
                          <span className="text-foreground font-medium">
                            ${order.total_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ordered on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
