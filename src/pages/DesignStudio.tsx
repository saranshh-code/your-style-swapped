import { useState, useRef } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Loader2, Download, RefreshCw, Upload, X, Palette, Save, User, Check, Ruler, DollarSign, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
type ProductType = "hoodie" | "tshirt" | "crewneck" | "custom";
type FabricType = "cotton" | "polyester" | "nylon" | "wool" | "fleece" | "linen" | "custom";
type ColorType = string;
type PrintSide = "front" | "back" | "both";
interface GeneratedDesign {
  imageUrl: string;
  style: string;
  description: string;
}
const printSideOptions: {
  value: PrintSide;
  label: string;
  description: string;
}[] = [{
  value: "front",
  label: "Front Only",
  description: "Design on front"
}, {
  value: "back",
  label: "Back Only",
  description: "Design on back"
}, {
  value: "both",
  label: "Front & Back",
  description: "Both sides"
}];
const sizeGuide = {
  tshirt: [{
    size: "XS",
    chest: "32-34",
    length: "26",
    shoulder: "16"
  }, {
    size: "S",
    chest: "34-36",
    length: "27",
    shoulder: "17"
  }, {
    size: "M",
    chest: "38-40",
    length: "28",
    shoulder: "18"
  }, {
    size: "L",
    chest: "42-44",
    length: "29",
    shoulder: "19"
  }, {
    size: "XL",
    chest: "46-48",
    length: "30",
    shoulder: "20"
  }, {
    size: "2XL",
    chest: "50-52",
    length: "31",
    shoulder: "21"
  }],
  hoodie: [{
    size: "XS",
    chest: "34-36",
    length: "25",
    shoulder: "17"
  }, {
    size: "S",
    chest: "36-38",
    length: "26",
    shoulder: "18"
  }, {
    size: "M",
    chest: "40-42",
    length: "27",
    shoulder: "19"
  }, {
    size: "L",
    chest: "44-46",
    length: "28",
    shoulder: "20"
  }, {
    size: "XL",
    chest: "48-50",
    length: "29",
    shoulder: "21"
  }, {
    size: "2XL",
    chest: "52-54",
    length: "30",
    shoulder: "22"
  }],
  crewneck: [{
    size: "XS",
    chest: "34-36",
    length: "25",
    shoulder: "17"
  }, {
    size: "S",
    chest: "36-38",
    length: "26",
    shoulder: "18"
  }, {
    size: "M",
    chest: "40-42",
    length: "27",
    shoulder: "19"
  }, {
    size: "L",
    chest: "44-46",
    length: "28",
    shoulder: "20"
  }, {
    size: "XL",
    chest: "48-50",
    length: "29",
    shoulder: "21"
  }, {
    size: "2XL",
    chest: "52-54",
    length: "30",
    shoulder: "22"
  }]
};
const pricingInfo = {
  tshirt: { base: 300 },
  hoodie: { base: 600 },
  crewneck: { base: 500 },
  custom: { base: 400 }
};
const productOptions: {
  value: ProductType;
  label: string;
}[] = [{
  value: "custom",
  label: "No Choice (Custom)"
}, {
  value: "hoodie",
  label: "Hoodie"
}, {
  value: "tshirt",
  label: "T-Shirt"
}, {
  value: "crewneck",
  label: "Crewneck"
}];
const fabricOptions: {
  value: FabricType;
  label: string;
  description: string;
}[] = [{
  value: "custom",
  label: "No Choice",
  description: "Describe in prompt"
}, {
  value: "cotton",
  label: "Cotton",
  description: "Soft & breathable"
}, {
  value: "polyester",
  label: "Polyester",
  description: "Durable & quick-dry"
}, {
  value: "nylon",
  label: "Nylon",
  description: "Lightweight & strong"
}, {
  value: "wool",
  label: "Wool",
  description: "Warm & natural"
}, {
  value: "fleece",
  label: "Fleece",
  description: "Cozy & insulating"
}, {
  value: "linen",
  label: "Linen",
  description: "Cool & elegant"
}];
const colorOptions = [{
  value: "custom",
  label: "No Choice",
  hex: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
  isGradient: true
}, {
  value: "black",
  label: "Black",
  hex: "#1a1a1a",
  isGradient: false
}, {
  value: "white",
  label: "White",
  hex: "#ffffff",
  isGradient: false
}, {
  value: "navy",
  label: "Navy",
  hex: "#1e3a5f",
  isGradient: false
}, {
  value: "gray",
  label: "Gray",
  hex: "#6b7280",
  isGradient: false
}, {
  value: "red",
  label: "Red",
  hex: "#dc2626",
  isGradient: false
}, {
  value: "forest",
  label: "Forest",
  hex: "#166534",
  isGradient: false
}, {
  value: "burgundy",
  label: "Burgundy",
  hex: "#7f1d1d",
  isGradient: false
}, {
  value: "cream",
  label: "Cream",
  hex: "#fef3c7",
  isGradient: false
}];
const DesignStudio = () => {
  const [prompt, setPrompt] = useState("");
  const [productType, setProductType] = useState<ProductType>("custom");
  const [fabricType, setFabricType] = useState<FabricType>("custom");
  const [selectedColor, setSelectedColor] = useState<ColorType>("custom");
  const [printSide, setPrintSide] = useState<PrintSide>("front");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<GeneratedDesign[]>([]);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number>(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user
  } = useAuth();
  const selectedDesign = generatedDesigns[selectedDesignIndex] || null;
  const getCurrentPrice = () => {
    const pricing = pricingInfo[productType];
    return `₹${pricing.base}`;
  };
  const getCurrentSizeGuide = () => {
    if (productType === "custom") return sizeGuide.tshirt;
    return sizeGuide[productType];
  };
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
    reader.onload = e => {
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
    setGeneratedDesigns([]);
    setSelectedDesignIndex(0);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: {
          prompt,
          productType,
          fabricType,
          color: selectedColor,
          printSide,
          referenceImage: uploadedImage,
          variationCount: 4,
        },
      });

      if (error) {
        console.error("Function error:", error);

        if (error instanceof FunctionsHttpError) {
          try {
            const errorBody = await error.context.json();
            const errorMessage =
              typeof errorBody?.error === "string"
                ? errorBody.error
                : error.message || "Failed to generate designs";
            toast.error(errorMessage);
            return;
          } catch (parseError) {
            console.error("Failed to parse function error body:", parseError);
          }
        }

        toast.error(error.message || "Failed to generate designs");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.designs && data.designs.length > 0) {
        setGeneratedDesigns(data.designs);
        toast.success(`Generated ${data.designs.length} unique designs for you!`);
      } else {
        toast.error("No designs were generated. Try a different prompt.");
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
    if (!selectedDesign) {
      toast.error("No design to save");
      return;
    }
    setIsSaving(true);
    try {
      const {
        error
      } = await supabase.from("saved_designs").insert({
        user_id: user.id,
        name: prompt.slice(0, 50) || "Untitled Design",
        prompt,
        product_type: productType,
        fabric_type: fabricType,
        color: selectedColor,
        generated_image_url: selectedDesign.imageUrl
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
    if (!selectedDesign) return;
    const link = document.createElement("a");
    link.href = selectedDesign.imageUrl;
    link.download = `swaps-design-${selectedDesign.style.replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Design downloaded!");
  };
  return <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="font-display text-xl text-white">Design Studio</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl text-white">
              Swaps
            </Link>
            {user ? <Link to="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <User className="w-4 h-4" />
              </Link> : <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white hover:bg-white/10">
                <Link to="/auth">Sign in</Link>
              </Button>}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Panel - Controls */}
          <div className="space-y-10 p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-white/60 mb-3">
                AI Design Generator
              </p>
              <h2 className="font-display text-3xl text-white mb-2">Start Creating</h2>
              <p className="text-white/70 text-sm">
                Choose your product, color, fabric or select "No Choice" to customize everything in your prompt. We'll generate 4 unique designs for you to choose from.
              </p>
            </div>

            {/* Product Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white">Choose Your Product</label>
              <div className="flex gap-2">
                {productOptions.map(option => <button key={option.value} onClick={() => setProductType(option.value)} className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${productType === option.value ? "bg-white text-black" : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20"}`}>
                    {option.label}
                  </button>)}
              </div>
            </div>

            {/* Print Side Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white">Print Location</label>
              <div className="grid grid-cols-3 gap-3">
                {printSideOptions.map(option => <button key={option.value} onClick={() => setPrintSide(option.value)} className={`p-4 rounded-lg border transition-all duration-200 text-center ${printSide === option.value ? "border-white bg-white/20" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                    <p className={`text-sm font-medium ${printSide === option.value ? "text-white" : "text-white/70"}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {option.description}
                    </p>
                    {option.value === "both"}
                  </button>)}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Choose Your Color
              </label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map(color => <button key={color.value} onClick={() => setSelectedColor(color.value)} className={`group relative w-10 h-10 rounded-full transition-all duration-200 ${selectedColor === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : "hover:scale-105"}`} style={{
                background: color.isGradient ? color.hex : color.hex,
                border: color.value === 'white' || color.value === 'cream' ? '1px solid rgba(255,255,255,0.3)' : 'none'
              }} title={color.value === 'custom' ? 'No Choice - Describe in prompt' : color.label} />)}
              </div>
              <p className="text-xs text-white/60">
                Selected: <span className="capitalize font-medium text-white">
                  {selectedColor === 'custom' ? 'No Choice (describe in prompt)' : selectedColor}
                </span>
              </p>
            </div>

            {/* Fabric Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white">Choose Your Fabric</label>
              <div className="grid grid-cols-3 gap-3">
                {fabricOptions.map(fabric => <button key={fabric.value} onClick={() => setFabricType(fabric.value)} className={`p-4 rounded-lg border transition-all duration-200 text-left ${fabricType === fabric.value ? "border-white bg-white/20" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                    <p className={`text-sm font-medium ${fabricType === fabric.value ? "text-white" : "text-white/70"}`}>
                      {fabric.label}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {fabric.description}
                    </p>
                  </button>)}
              </div>
            </div>

            {/* Size Guide & Pricing Info */}
            <div className="grid grid-cols-2 gap-4">
              {/* Size Guide */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <Ruler className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Size Guide</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-black/95 border-white/20 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      Size Guide {productType !== "custom" && `- ${productType.charAt(0).toUpperCase() + productType.slice(1)}`}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="text-xs text-white/60 mb-4">All measurements in inches</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left py-2 px-2 text-white/70 font-medium">Size</th>
                            <th className="text-left py-2 px-2 text-white/70 font-medium">Chest</th>
                            <th className="text-left py-2 px-2 text-white/70 font-medium">Length</th>
                            <th className="text-left py-2 px-2 text-white/70 font-medium">Shoulder</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentSizeGuide().map(row => <tr key={row.size} className="border-b border-white/10">
                              <td className="py-2 px-2 font-medium text-white">{row.size}</td>
                              <td className="py-2 px-2 text-white/70">{row.chest}"</td>
                              <td className="py-2 px-2 text-white/70">{row.length}"</td>
                              <td className="py-2 px-2 text-white/70">{row.shoulder}"</td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-white/60 flex items-start gap-2">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Measure your best-fitting garment flat and compare to our size chart for the perfect fit.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Pricing Info */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <DollarSign className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Pricing Info</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-black/95 border-white/20 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">T-Shirt</span>
                        <span className="text-white font-medium">From ₹{pricingInfo.tshirt.base}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Crewneck</span>
                        <span className="text-white font-medium">From ₹{pricingInfo.crewneck.base}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Hoodie</span>
                        <span className="text-white font-medium">From ₹{pricingInfo.hoodie.base}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-sm font-medium text-white mb-3">Add-ons</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-white/70">
                          <span>Back Print</span>
                          <span>+₹200-400</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Premium Fabric (Wool/Linen)</span>
                          <span>+₹100-200</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 flex items-start gap-2">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Free shipping on orders over ₹2000. All designs include premium DTG printing.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Current Price Estimate */}
            

            {/* Prompt Input */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white">Describe Your Design Vision</label>
              <Textarea placeholder="Example: A majestic wolf howling at the moon with intricate tribal patterns, aurora borealis in the background..." value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[140px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none text-sm" />
              <p className="text-xs text-white/60">
                Be detailed! The more specific you are, the more stunning your designs will be.
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white">Upload Logo or Inspiration (Optional)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              
              {uploadedImage ? <div className="relative p-4 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{uploadedFileName}</p>
                      <p className="text-xs text-white/60">Ready to incorporate</p>
                    </div>
                    <button onClick={removeUploadedImage} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div> : <button onClick={() => fileInputRef.current?.click()} className="w-full p-8 rounded-lg border border-dashed border-white/20 hover:border-white/40 bg-white/5 transition-colors group">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-white">Click to upload</p>
                      <p className="text-xs text-white/60 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </button>}
            </div>

            {/* Generate Button */}
            <Button variant="hero" size="xl" className="w-full" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating 4 Unique Designs...
                </> : <>
                  <Sparkles className="w-5 h-5" />
                  Generate 4 Designs
                </>}
            </Button>

            {/* Example Prompts */}
            <div className="space-y-3">
              <p className="text-sm text-white/60">Need inspiration? Try these:</p>
              <div className="flex flex-wrap gap-2">
                {["Majestic mountain sunset with geometric patterns", "Japanese koi fish with cherry blossoms", "Abstract cosmic galaxy with planets", "Vintage motorcycle with flames"].map(example => <button key={example} onClick={() => setPrompt(example)} className="px-3 py-1.5 rounded-md bg-white/10 text-xs text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                    {example}
                  </button>)}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <p className="text-sm tracking-[0.2em] uppercase text-white/60">Your Design Options</p>
            
            {/* Main Preview */}
            <div className="relative aspect-square rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              {isGenerating ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-white" />
                    <Sparkles className="w-5 h-5 text-white/60 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">Creating your designs...</p>
                    <p className="text-white/60 text-sm mt-1">Our AI is crafting 4 unique variations</p>
                  </div>
                </div> : selectedDesign ? <>
                  <img src={selectedDesign.imageUrl} alt={`Generated design - ${selectedDesign.style}`} className="absolute inset-0 w-full h-full object-contain p-4" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/60 backdrop-blur-sm">
                    <p className="text-sm text-white font-medium capitalize">{selectedDesign.style} Style</p>
                  </div>
                </> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-center text-white/60 text-sm">
                    Your AI-generated designs will appear here
                  </p>
                </div>}
            </div>

            {/* Design Variations Grid */}
            {generatedDesigns.length > 0 && <div className="space-y-3">
                <p className="text-sm text-white/60">Click to select a design variation:</p>
                <div className="grid grid-cols-4 gap-3">
                  {generatedDesigns.map((design, index) => <button key={index} onClick={() => setSelectedDesignIndex(index)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedDesignIndex === index ? "border-white scale-105 shadow-lg shadow-white/20" : "border-white/20 hover:border-white/50"}`}>
                      <img src={design.imageUrl} alt={`Design option ${index + 1} - ${design.style}`} className="w-full h-full object-cover" />
                      {selectedDesignIndex === index && <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>}
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 backdrop-blur-sm">
                        <p className="text-[10px] text-white truncate capitalize">{design.style}</p>
                      </div>
                    </button>)}
                </div>
              </div>}

            {/* Action Buttons */}
            {selectedDesign && <div className="flex gap-3">
                <Button variant="heroOutline" size="lg" className="flex-1" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4" />
                  New Designs
                </Button>
                <Button variant="heroOutline" size="lg" className="flex-1" onClick={handleSaveDesign} disabled={isSaving || !user}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {user ? "Save" : "Sign in to Save"}
                </Button>
                <Button variant="hero" size="lg" className="flex-1" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>}

            {selectedDesign && <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <p className="text-sm text-white/70">
                  Love your design? We can produce this on premium apparel and ship it to you within 48 hours.
                </p>
                <Button variant="hero" size="lg" className="w-full mt-4">
                  Order this design
                </Button>
              </div>}
          </div>
        </div>
      </div>
    </main>;
};
export default DesignStudio;
