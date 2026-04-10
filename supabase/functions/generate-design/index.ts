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
      { style: 'casual everyday', emphasis: 'effortless daily wear, Uniqlo basics vibe — zero styling effort needed' },
      { style: 'modern streetwear', emphasis: 'Essentials / Fear of God inspired, oversized relaxed fit, premium minimalism' },
      { style: 'washed vintage', emphasis: 'slightly sun-faded, soft worn-in cotton, thrift-store charm' },
      { style: 'clean essential', emphasis: 'Zara menswear staple, structured but comfortable, wardrobe backbone' },
      { style: 'artisan minimal', emphasis: 'subtle hand-finished details, screen-print texture, imperfect on purpose' },
    ];

    const numVariations = Math.min(Math.max(variationCount, 1), 5);
    const selectedStyles = styleVariations.slice(0, numVariations);

    console.log(`Generating ${numVariations} design variations via Lovable AI`);

    const generateDesign = async (styleVariation: { style: string; emphasis: string }, index: number) => {
      const enhancedPrompt = `A candid, editorial-style photograph of a real person wearing a ${isCustomColor ? '' : `${colorContext} `}${productContext}${isCustomFabric ? '' : ` made from ${fabricDesc}`}, shot in a clean white photography studio.

STYLE: ${styleVariation.style} — ${styleVariation.emphasis}
DESIGN IDEA: ${prompt}
PRINT PLACEMENT: ${printSideContext}

${isCustomProduct || isCustomColor || isCustomFabric ? 'NOTE: Some options left open — interpret naturally based on the prompt.' : ''}

PHOTOGRAPHY DIRECTION:
- Soft, diffused natural daylight — as if shot near a large window in a white studio
- Gentle realistic shadows on the floor, NO harsh directional light
- 3/4 body or full body framing, model centered with generous negative space
- The model should stand in a relaxed, natural posture — weight shifted to one leg, hands in pockets or at sides
- NOT a stiff catalog pose — think "friend photographed casually"

GARMENT & FABRIC REALISM:
- The garment must show real fabric behavior: natural drape, soft folds, slight wrinkles at elbows/waist
- Visible fabric texture — you should be able to see the cotton weave, terry loops, or knit pattern
- The fit should look like how a real person wears clothes — slightly bunched at the waist, collar sitting naturally
- Any design/graphic on the garment should be minimal, intentional, and look screen-printed or embroidered — NOT digitally overlaid

AESTHETIC:
- Modern streetwear inspired by Zara, Uniqlo, Essentials, COS
- Premium but understated — strong negative space, no visual clutter
- Subtle imperfections that make it feel authentic (a tiny crease, slightly uneven hem)
- The overall image should look like it belongs on a real e-commerce site or fashion lookbook

MANDATORY:
- A REAL human model must be wearing the garment
- Clean white seamless studio backdrop
- Must look like a REAL PHOTOGRAPH taken with a professional camera
- The design on the garment must be simple and minimal

DO NOT:
- Show the garment alone without a model (no flat-lays, no ghost mannequins)
- Use perfect symmetry or mathematically precise graphics
- Add glossy, metallic, holographic, or plastic-looking textures
- Include neon lighting, colored gels, or dramatic studio effects
- Create anything that looks like digital concept art, 3D render, or AI-generated imagery
- Use busy backgrounds, props, or environmental settings`;

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
