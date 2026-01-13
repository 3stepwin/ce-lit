// ========================================
// GENERATE-CULT-SCENE EDGE FUNCTION
// ========================================
// Orchestrator Entry Point:
// 1. Receives Topic
// 2. Generates Script & Shot List (Gemini)
// 3. Saves to DB
// 4. Kicks off Async Asset Generation

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- PROMPTING ---
function buildTrace(topic: string, style: string) {
    return `
    You are an expert documentary director.
    Create a compelling 30-45 second script for a short video about: "${topic}".
    Style: ${style}.

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
    `;
}

async function callGeminiJSON(model: string, apiKey: string, prompt: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
        }),
    });
    const data = await res.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

// --- MAIN ---
// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { topic, style_preset = "documentary", user_id } = await req.json();

        // @ts-ignore
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // @ts-ignore
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        // @ts-ignore
        const geminiKey = Deno.env.get("GEMINI_API_KEY")!;

        // 1. Generate Script & Shots
        const generated = await callGeminiJSON("gemini-1.5-flash", geminiKey, buildTrace(topic, style_preset));

        // 2. Create Script Record
        const { data: script, error: scriptError } = await supabase
            .from('scripts')
            .insert({
                user_id,
                topic,
                script_text: generated.script_text,
                style_preset,
                status: 'generating_visuals' // Skipping audio step specific flag for MVP
            })
            .select()
            .single();

        if (scriptError) throw scriptError;

        // 3. Create Shot Records
        const shotsToInsert = generated.shots.map((s: any) => ({
            script_id: script.id,
            sequence_index: s.index,
            visual_prompt: s.visual_prompt,
            motion_prompt: s.motion_prompt,
            duration: s.duration,
            status: 'pending'
        }));

        const { error: shotsError } = await supabase.from('shots').insert(shotsToInsert);
        if (shotsError) throw shotsError;

        // 4. Trigger Asset Processing Immediately
        // Fire and forget trigger to start the pipeline
        try {
            const processorUrl = `${req.url.split('/generate-cult-scene')[0]}/process-cult-assets`;
            fetch(processorUrl, {
                method: 'POST',
                headers: {
                    'Authorization': req.headers.get('Authorization') || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            }).catch(e => console.error("Trigger fail:", e));
        } catch (e) {
            console.error("URL parsing error:", e);
        }

        return new Response(JSON.stringify({ ok: true, script_id: script.id, shots_count: shotsToInsert.length }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
