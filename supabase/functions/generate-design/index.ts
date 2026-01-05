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
    const { prompt, productType, fabricType, color, referenceImage } = await req.json();
    
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
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a detailed prompt for clothing design
    const productContext = productType || 'hoodie';
    const fabricContext = fabricType || 'cotton';
    const colorContext = color || 'black';
    
    // Map fabric types to descriptive textures
    const fabricDescriptions: Record<string, string> = {
      cotton: 'soft cotton fabric with natural texture',
      polyester: 'smooth polyester fabric with slight sheen',
      nylon: 'lightweight nylon fabric with sleek finish',
      wool: 'warm woolen fabric with cozy texture',
      fleece: 'plush fleece fabric with soft fuzzy texture',
      linen: 'natural linen fabric with elegant drape'
    };
    
    const fabricDesc = fabricDescriptions[fabricContext] || 'premium fabric';
    
    let enhancedPrompt: string;
    if (referenceImage) {
      enhancedPrompt = `Create a professional product mockup of a ${colorContext} colored ${productContext} made from ${fabricDesc}, incorporating the uploaded image/logo into the design. 
      Additional instructions: ${prompt}. 
      The mockup should be photorealistic, studio lighting, floating on a dark background, premium quality apparel photography. 
      The fabric texture should be clearly visible showing the ${fabricContext} material. The garment color must be ${colorContext}.
      Show the garment from the front view with the design/logo clearly visible on the chest area.`;
    } else {
      enhancedPrompt = `Create a professional product mockup of a ${colorContext} colored ${productContext} made from ${fabricDesc} with this design: ${prompt}. 
      The mockup should be photorealistic, studio lighting, floating on a dark background, premium quality apparel photography. 
      The fabric texture should be clearly visible showing the ${fabricContext} material. The garment color must be ${colorContext}.
      Show the garment from the front view with the design clearly visible.`;
    }

    console.log('Generating design with prompt:', enhancedPrompt);
    console.log('Reference image provided:', !!referenceImage);

    // Build the message content
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    // Add the text prompt
    messageContent.push({
      type: 'text',
      text: enhancedPrompt
    });
    
    // Add reference image if provided
    if (referenceImage) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: referenceImage
        }
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: referenceImage ? messageContent : enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate design' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the generated image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'No image was generated. Please try a different prompt.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        description: textResponse || 'Design generated successfully'
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
