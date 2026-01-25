import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      console.error('GOOGLE_GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured. Please add your Google Gemini API key.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle "custom" options - let the prompt define everything
    const isCustomProduct = !productType || productType === 'custom';
    const isCustomFabric = !fabricType || fabricType === 'custom';
    const isCustomColor = !color || color === 'custom';
    
    const productContext = isCustomProduct ? 'apparel/clothing item' : productType;
    const colorContext = isCustomColor ? 'any color as described in the prompt' : color;
    
    // Print side context
    const printSideContext = printSide === 'both' 
      ? 'BOTH FRONT AND BACK of the garment (show both sides or indicate dual-sided design)'
      : printSide === 'back' 
        ? 'the BACK of the garment'
        : 'the FRONT of the garment';
    
    // Map fabric types to descriptive textures
    const fabricDescriptions: Record<string, string> = {
      cotton: 'soft premium cotton fabric with natural organic texture and comfortable feel',
      polyester: 'smooth high-performance polyester fabric with athletic sheen and moisture-wicking properties',
      nylon: 'lightweight durable nylon fabric with sleek modern finish and water-resistant coating',
      wool: 'luxurious warm woolen fabric with cozy texture and premium hand-feel',
      fleece: 'ultra-soft plush fleece fabric with fuzzy texture and exceptional warmth',
      linen: 'breathable natural linen fabric with elegant drape and sophisticated texture',
      custom: 'premium fabric as specified in the customer\'s description'
    };
    
    const fabricDesc = isCustomFabric ? 'appropriate premium fabric as described by customer' : (fabricDescriptions[fabricType] || 'premium fabric');

    // Design style variations for variety
    const styleVariations = [
      { style: 'clean minimalist', emphasis: 'elegant simplicity with refined details and subtle sophistication' },
      { style: 'bold artistic', emphasis: 'vibrant expressive elements with creative flair and eye-catching composition' },
      { style: 'intricate detailed', emphasis: 'complex patterns with meticulous craftsmanship and fine artistry' },
      { style: 'modern contemporary', emphasis: 'trendy current aesthetics with fresh innovative approach' },
      { style: 'vintage retro', emphasis: 'classic nostalgic charm with timeless appeal and heritage feel' },
    ];

    // Limit variations
    const numVariations = Math.min(Math.max(variationCount, 1), 5);
    const selectedStyles = styleVariations.slice(0, numVariations);

    console.log(`Generating ${numVariations} design variations for prompt:`, prompt, 'Print side:', printSide);
    console.log('Reference image provided:', !!referenceImage);

    // Generate multiple designs in parallel
    const generateDesign = async (styleVariation: { style: string; emphasis: string }, index: number) => {
      let enhancedPrompt: string;
      
      if (referenceImage) {
        enhancedPrompt = `Create an EXTRAORDINARY, STATE-OF-THE-ART professional product mockup of ${isCustomColor ? 'a' : `a ${colorContext} colored`} ${productContext} ${isCustomFabric ? '' : `made from ${fabricDesc}`}.
        
DESIGN STYLE: ${styleVariation.style} - ${styleVariation.emphasis}

CUSTOMER VISION (FOLLOW THIS EXACTLY): ${prompt}

PRINT LOCATION: Design should be placed on ${printSideContext}

${isCustomProduct || isCustomColor || isCustomFabric ? 'NOTE: Customer has chosen "No Choice" for some options - interpret their prompt fully to determine product type, color, and/or fabric as they describe.' : ''}

CRITICAL REQUIREMENTS:
- Incorporate the uploaded image/logo SEAMLESSLY into the design with artistic integration
- The design must be VISUALLY STUNNING and PREMIUM quality that exceeds customer expectations
- Show INTRICATE details, sharp lines, and professional craftsmanship
- Create a design that customers will be PROUD to wear and show off
- The artwork should be perfectly placed on ${printSideContext} with proper scaling
- Add subtle artistic enhancements that complement the main design

TECHNICAL SPECS:
- Photorealistic studio quality photography with professional lighting
- Dark gradient background that makes the garment POP
- Clear visibility of fabric texture with realistic material properties
- ${printSide === 'back' ? 'Back view' : 'Front view'} with the design as the focal point
- Ultra high resolution, magazine-worthy quality`;
      } else {
        enhancedPrompt = `Create an EXTRAORDINARY, STATE-OF-THE-ART professional product mockup of ${isCustomColor ? 'a' : `a ${colorContext} colored`} ${productContext} ${isCustomFabric ? '' : `made from ${fabricDesc}`}.

DESIGN STYLE: ${styleVariation.style} - ${styleVariation.emphasis}

CUSTOMER VISION (FOLLOW THIS EXACTLY): ${prompt}

PRINT LOCATION: Design should be placed on ${printSideContext}

${isCustomProduct || isCustomColor || isCustomFabric ? 'NOTE: Customer has chosen "No Choice" for some options - interpret their prompt fully to determine product type, color, and/or fabric as they describe.' : ''}

CRITICAL REQUIREMENTS:
- Design must be VISUALLY STUNNING, INTRICATE, and UNIQUE
- Create artwork that tells a story and connects emotionally with customers
- Show EXCEPTIONAL attention to detail with professional artistry
- The design should be something customers will be EXCITED to wear
- Perfect composition and placement on ${printSideContext}
- Add complementary design elements that enhance the main concept

TECHNICAL SPECS:
- Photorealistic studio quality photography with professional lighting setup
- Dark gradient background that makes the garment stand out dramatically
- Clear visibility of fabric texture with realistic material properties
- ${printSide === 'back' ? 'Back view' : 'Front view'} with the design as the hero element
- Ultra high resolution, editorial/magazine-worthy quality
- Premium apparel photography aesthetic`;
      }

      // Build the message content
      const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
      
      messageContent.push({
        type: 'text',
        text: enhancedPrompt
      });
      
      if (referenceImage) {
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: referenceImage
          }
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: referenceImage 
                ? [
                    { text: enhancedPrompt },
                    { inline_data: { mime_type: 'image/png', data: referenceImage.replace(/^data:image\/\w+;base64,/, '') } }
                  ]
                : [{ text: enhancedPrompt }]
            }
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI Gateway error for variation ${index + 1}:`, response.status, errorText);
        
        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded. Please try again in a moment.' };
        }
        if (response.status === 402) {
          throw { status: 402, message: 'AI credits exhausted. Please add credits to continue.' };
        }
        
        throw { status: 500, message: 'Failed to generate design variation' };
      }

      const data = await response.json();
      
      // Extract image from Gemini response
      const parts = data.candidates?.[0]?.content?.parts || [];
      let imageUrl = '';
      let textResponse = '';
      
      for (const part of parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }

      if (!imageUrl) {
        console.error(`No image in response for variation ${index + 1}:`, JSON.stringify(data));
        return null;
      }

      return {
        imageUrl,
        style: styleVariation.style,
        description: textResponse || `${styleVariation.style} design variation`
      };
    };

    // Generate all variations in parallel
    const results = await Promise.allSettled(
      selectedStyles.map((style, index) => generateDesign(style, index))
    );

    // Process results
    const designs: Array<{ imageUrl: string; style: string; description: string }> = [];
    let firstError: { status: number; message: string } | null = null;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        designs.push(result.value);
      } else if (result.status === 'rejected' && !firstError) {
        firstError = result.reason;
      }
    }

    // If no designs were generated, return the error
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
      JSON.stringify({ 
        designs,
        count: designs.length
      }),
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
