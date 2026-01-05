import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Loader2, Download, RefreshCw, Upload, X, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ProductType = "hoodie" | "tshirt" | "crewneck";

const productOptions: { value: ProductType; label: string }[] = [
  { value: "hoodie", label: "Hoodie" },
  { value: "tshirt", label: "T-Shirt" },
  { value: "crewneck", label: "Crewneck" },
];

const DesignStudio = () => {
  const [prompt, setPrompt] = useState("");
  const [productType, setProductType] = useState<ProductType>("hoodie");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
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
        body: { prompt, productType, referenceImage: uploadedImage },
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
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <span className="text-border">|</span>
            <h1 className="font-display text-xl text-foreground">DESIGN STUDIO</h1>
          </div>
          <Link to="/" className="font-display text-2xl text-foreground">
            SWAPS
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Panel - Controls */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl text-foreground">AI DESIGN GENERATOR</h2>
              </div>
              <p className="text-muted-foreground">
                Describe your design idea and our AI will create a custom mockup for you.
              </p>
            </div>

            {/* Product Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Product Type</label>
              <div className="flex gap-3">
                {productOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setProductType(option.value)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                      productType === option.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Describe Your Design</label>
              <Textarea
                placeholder="Example: A vintage sunset with palm trees silhouette, retro 80s style with neon pink and orange gradients..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px] bg-card border-border resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about colors, style, and elements you want in your design.
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Upload Logo or Inspiration</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              
              {uploadedImage ? (
                <div className="relative p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{uploadedFileName}</p>
                      <p className="text-xs text-muted-foreground">Ready to incorporate into design</p>
                    </div>
                    <button
                      onClick={removeUploadedImage}
                      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 transition-colors group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-foreground">Click to upload an image</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a logo or inspiration image and the AI will incorporate it into your design.
              </p>
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
                  Generate Design
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
                    className="px-3 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <h3 className="font-display text-xl text-foreground">PREVIEW</h3>
            
            <div className="relative aspect-square rounded-2xl bg-card border border-border overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2/3 h-2/3 rounded-full bg-primary/10 blur-[80px]" />
              </div>

              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  </div>
                  <p className="text-muted-foreground">Creating your design...</p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated design mockup"
                  className="absolute inset-0 w-full h-full object-contain p-4"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-24 h-24 rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-center text-muted-foreground">
                    Your AI-generated design will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedImage && (
              <div className="flex gap-4">
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
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  Love your design? We can produce this on premium apparel and ship it to you within 48 hours.
                </p>
                <Button variant="hero" size="lg" className="w-full mt-4">
                  Order This Design
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
