// ========================================
// GENERATE-CULT-SCENE EDGE FUNCTION
// ========================================
// Orchestrator Entry Point:
// Modes:
// A. Direct Mode: Receives Topic -> Generates -> Saves (Slow, blocks UI)
// B. Background Mode: Receives script_id (with queued status) -> Generates -> Updates

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

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Gemini API Failed [${res.status}]:`, errorText);
        throw new Error(`Gemini API Error (${res.status}): ${errorText.substring(0, 200)}...`);
    }

    const data = await res.json();

    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        if (data.promptFeedback?.blockReason) {
            throw new Error(`Gemini Safety Block: ${data.promptFeedback.blockReason}`);
        }
        throw new Error(`Gemini returned invalid response structure: ${JSON.stringify(data)}`);
    }

    return JSON.parse(data.candidates[0].content.parts[0].text);
}

// --- MAIN ---
// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const payload = await req.json();
        let { topic, style_preset = "documentary", user_id, script_id } = payload;

        // @ts-ignore
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // @ts-ignore
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        // @ts-ignore
        const geminiKey = Deno.env.get("GEMINI_API_KEY")!;

        // --- MODE B: FETCH EXISTING IF QUEUED ---
        if (script_id && !topic) {
            const { data: existing, error } = await supabase
                .from('scripts')
                .select('*')
                .eq('id', script_id)
                .single();
            if (error || !existing) throw new Error("Script not found");
            topic = existing.topic;
            style_preset = existing.style_preset;
            user_id = existing.user_id;

            // Mark as processing if currently queued
            if (existing.status === 'queued') {
                await supabase.from('scripts').update({ status: 'generating_script' }).eq('id', script_id);
            }
        }

        // 1. Generate Script & Shots
        const generated = await callGeminiJSON("gemini-2.0-flash", geminiKey, buildTrace(topic, style_preset));

        // Validate response structure
        if (!generated || !generated.script_text || !Array.isArray(generated.shots)) {
            throw new Error(`Invalid Gemini response structure: ${JSON.stringify(generated)}`);
        }

        let finalScriptId = script_id;

        // 2. Create or Update Script Record
        if (finalScriptId) {
            await supabase.from('scripts').update({
                script_text: generated.script_text,
                status: 'generating_visuals'
            }).eq('id', finalScriptId);
        } else {
            const { data: script, error: scriptError } = await supabase
                .from('scripts')
                .insert({
                    user_id,
                    topic,
                    script_text: generated.script_text,
                    style_preset,
                    status: 'generating_visuals'
                })
                .select()
                .single();
            if (scriptError) throw scriptError;
            finalScriptId = script.id;
        }

        // 3. Create Shot Records
        const shotsToInsert = generated.shots.map((s: any) => ({
            script_id: finalScriptId,
            sequence_index: s.index,
            visual_prompt: s.visual_prompt,
            motion_prompt: s.motion_prompt,
            duration: s.duration,
            status: 'pending'
        }));

        const { error: shotsError } = await supabase.from('shots').insert(shotsToInsert);
        if (shotsError) throw shotsError;

        // 4. Trigger Asset Processing with Retry Logic
        const baseUrl = req.url.split('/generate-cult-scene')[0];
        const functionsUrl = `${supabaseUrl}/functions/v1`;

        // Helper: Retry async function call up to N times
        async function triggerWithRetry(url: string, maxRetries: number = 3) {
            let lastError: any;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({})
                    });
                    if (res.ok) {
                        console.log(`✓ Asset processing triggered successfully on attempt ${attempt}`);
                        return;
                    }
                    lastError = await res.text();
                    console.warn(`Attempt ${attempt}: Asset trigger returned ${res.status}:`, lastError);
                } catch (e) {
                    lastError = e;
                    console.warn(`Attempt ${attempt} failed:`, lastError);
                    if (attempt < maxRetries) {
                        // Exponential backoff: 100ms, 200ms, 400ms
                        await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt - 1)));
                    }
                }
            }
            // Log final failure but don't throw (non-blocking)
            console.error(`✗ Asset processing trigger failed after ${maxRetries} attempts:`, lastError);
        }

        try {
            // Trigger Visual Asset Processing with retry
            triggerWithRetry(`${functionsUrl}/process-cult-assets`).catch(e => {
                console.error("Unhandled error in asset trigger:", e);
            });
        } catch (e) {
            console.error("URL parsing error:", e);
        }

        return new Response(JSON.stringify({ ok: true, script_id: finalScriptId, shots_count: shotsToInsert.length }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
