import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Loader2, Download, RefreshCw, Upload, X, Palette, Save, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type ProductType = "hoodie" | "tshirt" | "crewneck";
type FabricType = "cotton" | "polyester" | "nylon" | "wool" | "fleece" | "linen";

const productOptions: { value: ProductType; label: string }[] = [
  { value: "hoodie", label: "Hoodie" },
  { value: "tshirt", label: "T-Shirt" },
  { value: "crewneck", label: "Crewneck" },
];

const fabricOptions: { value: FabricType; label: string; description: string }[] = [
  { value: "cotton", label: "Cotton", description: "Soft & breathable" },
  { value: "polyester", label: "Polyester", description: "Durable & quick-dry" },
  { value: "nylon", label: "Nylon", description: "Lightweight & strong" },
  { value: "wool", label: "Wool", description: "Warm & natural" },
  { value: "fleece", label: "Fleece", description: "Cozy & insulating" },
  { value: "linen", label: "Linen", description: "Cool & elegant" },
];

const colorOptions = [
  { value: "black", label: "Black", hex: "#1a1a1a" },
  { value: "white", label: "White", hex: "#ffffff" },
  { value: "navy", label: "Navy", hex: "#1e3a5f" },
  { value: "gray", label: "Gray", hex: "#6b7280" },
  { value: "red", label: "Red", hex: "#dc2626" },
  { value: "forest", label: "Forest", hex: "#166534" },
  { value: "burgundy", label: "Burgundy", hex: "#7f1d1d" },
  { value: "cream", label: "Cream", hex: "#fef3c7" },
];

const DesignStudio = () => {
  const [prompt, setPrompt] = useState("");
  const [productType, setProductType] = useState<ProductType>("hoodie");
  const [fabricType, setFabricType] = useState<FabricType>("cotton");
  const [selectedColor, setSelectedColor] = useState("black");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedImage(base64);
      setUploadedFileName(file.name);
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your design idea");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: { 
          prompt, 
          productType, 
          fabricType, 
          color: selectedColor,
          referenceImage: uploadedImage 
        },
      });

      if (error) {
        console.error("Function error:", error);
        toast.error(error.message || "Failed to generate design");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("Design generated successfully!");
      } else {
        toast.error("No image was generated. Try a different prompt.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast.error("Please sign in to save your design");
      return;
    }

    if (!generatedImage) {
      toast.error("No design to save");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("saved_designs").insert({
        user_id: user.id,
        name: prompt.slice(0, 50) || "Untitled Design",
        prompt,
        product_type: productType,
        fabric_type: fabricType,
        color: selectedColor,
        generated_image_url: generatedImage,
      });

      if (error) throw error;

      toast.success("Design saved to your dashboard!");
    } catch (err) {
      console.error("Error saving design:", err);
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `swaps-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Design downloaded!");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="font-display text-xl text-foreground">Design Studio</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl text-foreground">
              Swaps
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Panel - Controls */}
          <div className="space-y-10">
            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3">
                AI Design Generator
              </p>
              <h2 className="font-display text-3xl text-foreground mb-2">Create your design</h2>
              <p className="text-muted-foreground text-sm">
                Describe your vision and our AI will create a custom mockup for you.
              </p>
            </div>

            {/* Product Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Product Type</label>
              <div className="flex gap-2">
                {productOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setProductType(option.value)}
                    className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      productType === option.value
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color
              </label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`group relative w-10 h-10 rounded-full transition-all duration-200 ${
                      selectedColor === color.value
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ 
                      backgroundColor: color.hex,
                      border: color.value === 'white' || color.value === 'cream' ? '1px solid hsl(var(--border))' : 'none'
                    }}
                    title={color.label}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: <span className="capitalize">{selectedColor}</span>
              </p>
            </div>

            {/* Fabric Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Fabric</label>
              <div className="grid grid-cols-3 gap-3">
                {fabricOptions.map((fabric) => (
                  <button
                    key={fabric.value}
                    onClick={() => setFabricType(fabric.value)}
                    className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                      fabricType === fabric.value
                        ? "border-foreground bg-secondary"
                        : "border-border bg-card hover:border-muted-foreground"
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      fabricType === fabric.value ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {fabric.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fabric.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Describe Your Design</label>
              <Textarea
                placeholder="Example: A vintage sunset with palm trees silhouette, retro 80s style with neon pink and orange gradients..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[140px] bg-card border-border resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about colors, style, and elements you want in your design.
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Upload Logo or Inspiration</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              
              {uploadedImage ? (
                <div className="relative p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{uploadedFileName}</p>
                      <p className="text-xs text-muted-foreground">Ready to incorporate</p>
                    </div>
                    <button
                      onClick={removeUploadedImage}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 rounded-lg border border-dashed border-border hover:border-muted-foreground bg-card transition-colors group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-foreground">Click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Generate Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate design
                </>
              )}
            </Button>

            {/* Example Prompts */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try these ideas:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Minimalist mountain landscape",
                  "Japanese wave art style",
                  "Geometric abstract pattern",
                  "Vintage car illustration",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="px-3 py-1.5 rounded-md bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground">Preview</p>
            
            <div className="relative aspect-square rounded-xl bg-secondary/30 border border-border overflow-hidden">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                  <p className="text-muted-foreground text-sm">Creating your design...</p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated design mockup"
                  className="absolute inset-0 w-full h-full object-contain p-4"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-center text-muted-foreground text-sm">
                    Your AI-generated design will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedImage && (
              <div className="flex gap-3">
                <Button
                  variant="heroOutline"
                  size="lg"
                  className="flex-1"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button
                  variant="heroOutline"
                  size="lg"
                  className="flex-1"
                  onClick={handleSaveDesign}
                  disabled={isSaving || !user}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {user ? "Save" : "Sign in to Save"}
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            )}

            {generatedImage && (
              <div className="p-6 rounded-xl bg-card border border-border">
                <p className="text-sm text-muted-foreground">
                  Love your design? We can produce this on premium apparel and ship it to you within 48 hours.
                </p>
                <Button variant="hero" size="lg" className="w-full mt-4">
                  Order this design
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DesignStudio;
