import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, productType, fabricType, color, printSide = 'front', referenceImage, variationCount = 4 } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isCustomProduct = !productType || productType === 'custom';
    const isCustomFabric = !fabricType || fabricType === 'custom';
    const isCustomColor = !color || color === 'custom';
    
    const productContext = isCustomProduct ? 'apparel/clothing item' : productType;
    const colorContext = isCustomColor ? 'any color as described in the prompt' : color;
    
    const printSideContext = printSide === 'both' 
      ? 'BOTH FRONT AND BACK of the garment'
      : printSide === 'back' 
        ? 'the BACK of the garment'
        : 'the FRONT of the garment';
    
    const fabricDescriptions: Record<string, string> = {
      cotton: 'soft premium cotton fabric',
      polyester: 'smooth high-performance polyester fabric',
      nylon: 'lightweight durable nylon fabric',
      wool: 'luxurious warm woolen fabric',
      fleece: 'ultra-soft plush fleece fabric',
      linen: 'breathable natural linen fabric',
      custom: 'premium fabric as specified'
    };
    
    const fabricDesc = isCustomFabric ? 'appropriate premium fabric' : (fabricDescriptions[fabricType] || 'premium fabric');

    const styleVariations = [
      { style: 'casual everyday', emphasis: 'simple relaxed styling, like something from Uniqlo or Muji' },
      { style: 'streetwear minimal', emphasis: 'clean urban look, subtle branding, Zara-inspired' },
      { style: 'vintage washed', emphasis: 'slightly faded, lived-in feel, soft worn-in texture' },
      { style: 'modern essential', emphasis: 'timeless wardrobe staple, H&M basics aesthetic' },
      { style: 'artisan handmade', emphasis: 'imperfect charm, screen-printed or hand-stitched feel' },
    ];

    const numVariations = Math.min(Math.max(variationCount, 1), 5);
    const selectedStyles = styleVariations.slice(0, numVariations);

    console.log(`Generating ${numVariations} design variations via Lovable AI`);

    const generateDesign = async (styleVariation: { style: string; emphasis: string }, index: number) => {
      const enhancedPrompt = `Photograph a real ${isCustomColor ? '' : `${colorContext} `}${productContext}${isCustomFabric ? '' : ` made from ${fabricDesc}`} laid flat on a clean surface or worn casually by a person.

STYLE DIRECTION: ${styleVariation.style} — ${styleVariation.emphasis}
DESIGN CONCEPT: ${prompt}
PRINT PLACEMENT: ${printSideContext}

${isCustomProduct || isCustomColor || isCustomFabric ? 'NOTE: Some options left open — interpret the prompt naturally.' : ''}

IMPORTANT RULES:
- Must look like a REAL PHOTOGRAPH of a real garment, not a digital render or concept art
- Show realistic fabric texture: natural wrinkles, soft folds, visible weave or knit
- Use soft natural daylight lighting only — NO neon, NO dramatic studio lighting, NO glossy reflections
- The design/print on the garment should be simple, intentional, and minimal — like something from Zara, Uniqlo, or H&M
- Avoid perfect symmetry, excessive detail, or fantasy elements
- Garment proportions must be realistic and wearable
- Background should be simple: white/cream surface, wooden table, or neutral bedroom setting
- If showing on a person, use natural casual posing — NOT a fashion runway pose
- The overall mood should feel approachable, everyday, and commercially viable
- NO metallic textures, NO holographic effects, NO hyper-detailed illustrations on the garment`;

      const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'text', text: enhancedPrompt }
      ];

      if (referenceImage) {
        messageContent.push({
          type: 'image_url',
          image_url: { url: referenceImage }
        });
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [{ role: 'user', content: messageContent }],
          modalities: ['image', 'text'],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Lovable AI error for variation ${index + 1}:`, response.status, errorText);

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded. Please try again in a moment.' };
        }
        if (response.status === 402) {
          throw { status: 402, message: 'AI credits exhausted. Please add credits in Settings > Workspace > Usage.' };
        }
        
        throw { status: 500, message: 'Failed to generate design variation' };
      }

      const data = await response.json();
      
      const choice = data.choices?.[0]?.message;
      const textResponse = choice?.content || '';
      const imageUrl = choice?.images?.[0]?.image_url?.url || '';

      if (!imageUrl) {
        console.error(`No image in response for variation ${index + 1}:`, JSON.stringify(data).slice(0, 500));
        return null;
      }

      return {
        imageUrl,
        style: styleVariation.style,
        description: textResponse || `${styleVariation.style} design variation`
      };
    };

    const results = await Promise.allSettled(
      selectedStyles.map((style, index) => generateDesign(style, index))
    );

    const designs: Array<{ imageUrl: string; style: string; description: string }> = [];
    let firstError: { status: number; message: string } | null = null;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        designs.push(result.value);
      } else if (result.status === 'rejected' && !firstError) {
        firstError = result.reason;
      }
    }

    if (designs.length === 0) {
      if (firstError) {
        return new Response(
          JSON.stringify({ error: firstError.message }),
          { status: firstError.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'No designs were generated. Please try a different prompt.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated ${designs.length} design variations`);

    return new Response(
      JSON.stringify({ designs, count: designs.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-design function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
