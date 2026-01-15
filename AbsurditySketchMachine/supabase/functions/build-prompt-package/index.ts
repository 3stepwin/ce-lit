// Supabase Edge Function for building prompt packages

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const idea = await req.json()
    console.log("Idea received in build-prompt-package:", idea);

    // 1. Get the image prompt packet
    let { data: imagePacket, error: imageError } = await supabase
      .from('image_prompt_packets')
      .select('json_payload')
      .eq('sketch_type', idea.sketch_type)
      .eq('aesthetic_preset', idea.aesthetic_preset)
      .single()

    if (imageError && imageError.code === 'PGRST116') { // No rows found
        console.warn(`No exact image packet found for sketch_type: ${idea.sketch_type}, aesthetic_preset: ${idea.aesthetic_preset}. Falling back to default.`);
        let { data: defaultImagePacket, error: defaultImageError } = await supabase
            .from('image_prompt_packets')
            .select('json_payload')
            .eq('sketch_type', 'default')
            .single()
        if (defaultImageError) {
            throw defaultImageError;
        }
        imagePacket = defaultImagePacket;
    } else if (imageError) {
        throw imageError;
    }
    console.log("Image packet:", imagePacket);


    // 2. Get the video prompt packet
    let { data: videoPacket, error: videoError } = await supabase
      .from('video_prompt_packets')
      .select('json_payload')
      .eq('sketch_type', idea.sketch_type)
      .eq('aesthetic_preset', idea.aesthetic_preset)
      .single()

    if (videoError && videoError.code === 'PGRST116') { // No rows found
        console.warn(`No exact video packet found for sketch_type: ${idea.sketch_type}, aesthetic_preset: ${idea.aesthetic_preset}. Falling back to default.`);
        let { data: defaultVideoPacket, error: defaultVideoError } = await supabase
            .from('video_prompt_packets')
            .select('json_payload')
            .eq('sketch_type', 'default')
            .single()
        if (defaultVideoError) {
            throw defaultVideoError;
        }
        videoPacket = defaultVideoPacket;
    } else if (videoError) {
        throw videoError;
    }
    console.log("Video packet:", videoPacket);

    // 3. Construct the prompt package
    const promptPackage = {
      idea: idea,
      image_prompt: {
        ...imagePacket.json_payload,
        subject: idea.topic,
      },
      video_prompt: videoPacket.json_payload,
      meta_tokens: idea.meta_tokens,
    }

    return new Response(JSON.stringify(promptPackage), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
