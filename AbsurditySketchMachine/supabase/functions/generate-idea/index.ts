// Supabase Edge Function for generating ideas

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  try {
    const idea = {
      topic: 'A lone wolf howling at the moon',
      sketch_type: 'cinematic',
      aesthetic_preset: 'neon_void',
      meta_tokens: ['NATURE', 'SOLITUDE'],
    }

    return new Response(JSON.stringify(idea), {
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

