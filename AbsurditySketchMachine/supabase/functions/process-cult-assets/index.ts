// ========================================
// PROCESS-CULT-ASSETS EDGE FUNCTION
// ========================================
// LOCKED v3.0 - MULTI-SHOT CINEMATIC ORCHESTRATOR
// Handles T2I -> FaceSwap -> I2V for documentary scenes

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- API HELPERS ---

async function callNovitaSeedream(apiKey: string, prompt: string, webhookUrl: string) {
    // Using ASYNC endpoint for webhook support
    const url = `https://api.novita.ai/v3/async/txt2img`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model_name: "seedream_3_0",
            prompt: prompt,
            image_num: 1,
            width: 720,
            height: 1280,
            guidance_scale: 7.5,
            extra: {
                response_image_type: "jpeg",
                webhook: {
                    url: webhookUrl
                    // No event_type needed - Novita always sends ASYNC_TASK_RESULT
                }
            }
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Novita Seedream failed: ${JSON.stringify(data)}`);
    return data.task_id;
}

async function callNovitaKlingI2V(apiKey: string, imageUrl: string, prompt: string, webhookUrl: string) {
    // Kling V2.1 I2V requires FILE UPLOAD (multipart/form-data), not JSON
    const url = `https://api.novita.ai/v3/async/kling-v2.1-i2v-master`;

    // 1. Download image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error(`Failed to download image from ${imageUrl}`);
    const imageBlob = await imageResponse.blob();

    // 2. Create FormData with file upload
    const formData = new FormData();
    formData.append('image', imageBlob, 'frame.jpg');
    formData.append('prompt', prompt);
    formData.append('negative_prompt', 'blurry, distorted, low quality');
    formData.append('duration', '5'); // 5 or 10 seconds
    formData.append('cfg_scale', '0.5');

    // 3. Add webhook config as JSON string in extra field
    formData.append('extra', JSON.stringify({
        webhook: {
            url: webhookUrl
            // No event_type needed - Novita always sends ASYNC_TASK_RESULT
        }
    }));

    // 4. Send request (DO NOT set Content-Type - FormData sets it with boundary)
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`
            // Content-Type is auto-set by FormData with multipart boundary
        },
        body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Novita Kling I2V failed: ${JSON.stringify(data)}`);
    return data.task_id;
}

// --- MAIN ---

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        // @ts-ignore
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // @ts-ignore
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        // @ts-ignore
        const novitaKey = Deno.env.get("NOVITA_API_KEY")!;
        const webhookUrl = "https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-cult-webhook";

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 1. Process Pending T2I (Start of chain)
        const { data: pendingT2I, error: t2iError } = await supabase
            .from('shots')
            .select('id, visual_prompt')
            .eq('status', 'pending')
            .limit(5);

        if (t2iError) throw t2iError;

        for (const shot of (pendingT2I || [])) {
            try {
                const taskId = await callNovitaSeedream(novitaKey, shot.visual_prompt, webhookUrl);
                await supabase.from('shots').update({
                    status: 't2i_processing',
                    external_id: taskId,
                    updated_at: new Date().toISOString()
                }).eq('id', shot.id);
            } catch (e) { console.error(`T2I task failed for shot ${shot.id}:`, e); }
        }

        // 2. Process Pending I2V (Kling)
        const { data: pendingI2V, error: i2vError } = await supabase
            .from('shots')
            .select('*')
            .eq('status', 'i2v_pending')
            .limit(3);

        if (i2vError) throw i2vError;

        for (const shot of (pendingI2V || [])) {
            try {
                const imageUrl = shot.assets?.t2i_url;
                if (!imageUrl) continue;

                // For documentaries, we usually don't face-swap every background shot, 
                // but the logic is here if needed.
                const taskId = await callNovitaKlingI2V(novitaKey, imageUrl, shot.motion_prompt || "cinematic movement", webhookUrl);

                await supabase.from('shots').update({
                    status: 'i2v_processing',
                    external_id: taskId,
                    updated_at: new Date().toISOString()
                }).eq('id', shot.id);
            } catch (e) { console.error(`I2V task failed for shot ${shot.id}:`, e); }
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
