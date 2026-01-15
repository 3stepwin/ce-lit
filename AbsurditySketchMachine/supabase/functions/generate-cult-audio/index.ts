// ========================================
// GENERATE-CULT-AUDIO EDGE FUNCTION
// ========================================
// Agent: Developer Amelia
// Purpose: Convert script text to master narration audio via Novita TTS

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function callNovitaTTS(apiKey: string, text: string, webhookUrl: string) {
    const url = "https://api.novita.ai/v3/async/txt2speech";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            request: {
                voice_id: "onyx",
                language: "en-US",
                texts: [text],
                speed: 1.0
            },
            extra: {
                response_audio_type: "mp3",
                webhook: {
                    url: webhookUrl,
                    event_type: "ASYNC_TASK_RESULT"
                }
            }
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Novita TTS failed: ${JSON.stringify(data)}`);
    return data.task_id;
}

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { script_id } = await req.json();

        // @ts-ignore
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // @ts-ignore
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        // @ts-ignore
        const novitaKey = Deno.env.get("NOVITA_API_KEY")!;
        const webhookUrl = "https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-cult-webhook";

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 1. Get Script Text
        const { data: script, error: scriptError } = await supabase
            .from('scripts')
            .select('*')
            .eq('id', script_id)
            .single();

        if (scriptError || !script) throw new Error("Script not found");

        // 2. Trigger Novita TTS
        const taskId = await callNovitaTTS(novitaKey, script.script_text, webhookUrl);

        // 3. Update DB
        const existingAssets = script.assets || {};
        await supabase.from('scripts').update({
            status: 'generating_audio',
            assets: { ...existingAssets, audio_task_id: taskId }
        }).eq('id', script_id);

        return new Response(JSON.stringify({ ok: true, task_id: taskId }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
