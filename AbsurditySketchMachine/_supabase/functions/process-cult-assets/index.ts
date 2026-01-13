// ========================================
// PROCESS-CULT-ASSETS EDGE FUNCTION
// ========================================
// The Workhorse Orchestrator:
// 1. Finds 'pending' shots.
// 2. Triggers Novita T2I (Text-to-Image).
// 3. Updates shot status to 't2i_processing'.

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- NOVITA API ---
async function callNovitaT2I(apiKey: string, prompt: string, webhookUrl: string) {
    const url = `https://api.novita.ai/v3/async/txt2img`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model_name: "juggernaut_xl_v9_rundiffusionphoto_v2.safetensors",
            prompt: prompt,
            negative_prompt: "nsfw, ugly, deformed, text, watermark, blurry",
            width: 1280, // Landscape for video
            height: 720,
            steps: 30,
            guidance_scale: 7,
            extra: {
                webhook: {
                    url: webhookUrl,
                    event_type: "task.finish"
                }
            }
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Novita T2I failed: ${JSON.stringify(data)}`);
    return data.task_id;
}

// --- MAIN ---
// @ts-ignore
Deno.serve(async (req) => {
    // Cron trigger or manual invocation
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

        // 1. Find Pending Shots (Limit 10 to avoid timeouts)
        // We look for shots where the PARENT script is not failed/complete? 
        // Or just process any pending shot.
        const { data: shots, error: fetchError } = await supabase
            .from('shots')
            .select('id, visual_prompt, script_id')
            .eq('status', 'pending')
            .limit(10);

        if (fetchError) throw fetchError;

        // 1b. Find I2V Pending Shots
        const { data: i2vShots, error: i2vError } = await supabase
            .from('shots')
            .select('*')
            .eq('status', 'i2v_pending')
            .limit(5); // Throttle video gen

        if (i2vError) throw i2vError;

        if ((!shots || shots.length === 0) && (!i2vShots || i2vShots.length === 0)) {
            return new Response(JSON.stringify({ message: "No pending tasks found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        console.log(`Found ${shots?.length || 0} T2I tasks and ${i2vShots?.length || 0} I2V tasks.`);
        const results = [];

        // 2. Fan-out T2I Calls
        for (const shot of shots) {
            try {
                // Trigger T2I
                const taskId = await callNovitaT2I(novitaKey, shot.visual_prompt, webhookUrl);

                // Update DB
                await supabase.from('shots').update({
                    status: 't2i_processing',
                    assets: { t2i_task_id: taskId },
                    updated_at: new Date().toISOString()
                }).eq('id', shot.id);

                results.push({ id: shot.id, status: 'started', task_id: taskId });

            } catch (err: any) {
                console.error(`Failed shot ${shot.id}:`, err);
                await supabase.from('shots').update({
                    status: 'failed',
                    model_config: { error: err.message }
                }).eq('id', shot.id);
                results.push({ id: shot.id, status: 'failed', error: err.message });
            }
        }

        // 3. Fan-out I2V Calls (Kling)
        if (i2vShots && i2vShots.length > 0) {
            for (const shot of i2vShots) {
                try {
                    const t2iUrl = shot.assets?.t2i_url;
                    if (!t2iUrl) throw new Error("No T2I URL found for I2V step");

                    // Call Novita Kling
                    const url = `https://api.novita.ai/v3/async/kling-v2.1-i2v-master`;
                    const res = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${novitaKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model_name: "kling_v2_1",
                            image_file: t2iUrl,
                            prompt: shot.motion_prompt || "cinematic movement, slow motion",
                            duration: "5",
                            frames_num: 80,
                            extra: {
                                webhook: { url: webhookUrl, event_type: "task.finish" }
                            }
                        }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(`Novita I2V failed: ${JSON.stringify(data)}`);

                    const taskId = data.task_id;

                    // Update DB
                    await supabase.from('shots').update({
                        status: 'i2v_processing',
                        assets: { ...shot.assets, video_task_id: taskId },
                        updated_at: new Date().toISOString()
                    }).eq('id', shot.id);

                    results.push({ id: shot.id, status: 'i2v_started', task_id: taskId });

                } catch (err: any) {
                    console.error(`Failed I2V shot ${shot.id}:`, err);
                    await supabase.from('shots').update({
                        status: 'failed',
                        model_config: { error: err.message }
                    }).eq('id', shot.id);
                    results.push({ id: shot.id, status: 'failed', error: err.message });
                }
            }
        }

        return new Response(JSON.stringify({ processed: results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
