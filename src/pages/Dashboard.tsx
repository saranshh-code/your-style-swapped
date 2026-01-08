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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </Link>
            <h1 className="font-display text-xl text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl text-white">
              Swaps
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white/70 hover:text-white hover:bg-white/10"
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
                ? "bg-white text-black"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Designs ({designs.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "orders"
                ? "bg-white text-black"
                : "text-white/70 hover:text-white hover:bg-white/10"
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
              <div className="text-center py-20 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
                <Sparkles className="w-10 h-10 text-white/60 mx-auto mb-4" />
                <h3 className="font-display text-2xl text-white mb-2">
                  No designs yet
                </h3>
                <p className="text-white/70 mb-8 text-sm">
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
                    className="rounded-xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md group hover:border-white/30 transition-all duration-300"
                  >
                    <div className="aspect-square bg-white/5 relative overflow-hidden">
                      <img
                        src={design.generated_image_url}
                        alt={design.name}
                        className="w-full h-full object-contain p-4"
                      />
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDesign(design.id)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 bg-black/30">
                      <h4 className="font-medium text-white truncate">
                        {design.name}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs text-white/70 capitalize">
                          {design.product_type}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs text-white/70 capitalize">
                          {design.fabric_type}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs text-white/70 capitalize">
                          {design.color}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">
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
              <div className="text-center py-20 rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
                <Package className="w-10 h-10 text-white/60 mx-auto mb-4" />
                <h3 className="font-display text-2xl text-white mb-2">
                  No orders yet
                </h3>
                <p className="text-white/70 mb-8 text-sm">
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
                    className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md p-6 flex flex-col md:flex-row gap-6"
                  >
                    {order.saved_designs && (
                      <div className="w-20 h-20 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
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
                        <span className="text-sm text-white/70">
                          Order #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-white/70">
                        <span>Qty: {order.quantity}</span>
                        {order.size && <span>Size: {order.size}</span>}
                        {order.total_price && (
                          <span className="text-white font-medium">
                            ${order.total_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60">
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
