// Supabase Edge Function for generating cult scenes

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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // 1. Generate an idea
    const ideaResponse = await fetch(`${supabaseUrl}/functions/v1/generate-idea`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    if (!ideaResponse.ok) {
        throw new Error("Failed to generate an idea.");
    }

    const idea = await ideaResponse.json();

    // 2. Build the prompt package
    const promptPackageResponse = await fetch(`${supabaseUrl}/functions/v1/build-prompt-package`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(idea)
    });

    if (!promptPackageResponse.ok) {
        throw new Error("Failed to build the prompt package.");
    }

    const promptPackage = await promptPackageResponse.json();

    const { image_prompt, video_prompt, meta_tokens } = promptPackage;

    // 3. Generate the script and shots
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`
    const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `
                    You are an expert documentary director.
                    Create a compelling 30-45 second script for a short video about: "${idea.topic}".
                    Style: ${idea.aesthetic_preset}.

                    Output strictly valid JSON:
                    {
                      "script_text": "Full voiceover text here...",
                      "shots": [
                        {
                          "index": 0,
                          "visual_prompt": "detailed image prompt...",
                          "motion_prompt": "camera movement description...",
                          "duration": 4
                        },
                        ...
                      ]
                    }
                    `,
                }]
            }]
        })
    });

    if (!geminiResponse.ok) {
        throw new Error("Failed to generate a script from Gemini.");
    }

    const geminiData = await geminiResponse.json();
    const generated = JSON.parse(geminiData.candidates[0].content.parts[0].text);


    // 4. Save the script and shots to the database
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .insert({
        user_id: null,
        topic: idea.topic,
        script_text: generated.script_text,
        style_preset: idea.aesthetic_preset,
        status: 'generating_visuals'
      })
      .select()
      .single();

    if (scriptError) {
      throw scriptError;
    }

    const shotsToInsert = generated.shots.map((s: any) => ({
      script_id: script.id,
      sequence_index: s.index,
      visual_prompt: s.visual_prompt,
      motion_prompt: s.motion_prompt,
      duration: s.duration,
      status: 'pending'
    }));

    const { error: shotsError } = await supabase.from('shots').insert(shotsToInsert);

    if (shotsError) {
      throw shotsError;
    }

    return new Response(JSON.stringify({ ok: true, script_id: script.id, shots_count: shotsToInsert.length }), {
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
