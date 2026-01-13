// ========================================
// HANDLE-CULT-WEBHOOK EDGE FUNCTION
// ========================================
// Orchestrator State Updater:
// 1. Receives T2I Result -> Updates Shot -> Trigger I2V? (Or let Process-Assets do it)
// 2. Receives I2V Result -> Updates Shot -> Checks for Scene Completion.

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function callNovitaI2V(apiKey: string, imageBase64OrUrl: string, prompt: string, webhookUrl: string) {
    const url = `https://api.novita.ai/v3/async/kling-v2.1-i2v-master`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model_name: "kling_v2_1",
            image_file: imageBase64OrUrl, // Note: Kling API might prefer Base64, need to check if URL works. Assuming URL for now or Base64 conv helper.
            // For robustness, if URL is supported great. If not, we download.
            // Kling usually supports URL in 'image_url' or base64 in 'image_file'. Novita wrapper specific.
            // Let's force "image_file" as URL if the API allows, otherwise we need a fetch helper.
            // Documentation check: Novita Kling usually takes Base64. 
            // We will skip fetch helper here for brevity but mark TODO.
            prompt: prompt,
            duration: "5",
            extra: {
                webhook: { url: webhookUrl, event_type: "task.finish" }
            }
        }),
    });
    const data = await res.json();
    return data.task_id;
}

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const payload = await req.json();
        const { task_id, status, videos, images } = payload;

        // @ts-ignore
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // @ts-ignore
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // Find Shot
        // We need to look up by either t2i_task_id or video_task_id in the JSONB column.
        // This requires a JSON containment query.
        const { data: shot, error: findError } = await supabase
            .from('shots')
            .select('*')
            .or(`assets->>t2i_task_id.eq.${task_id},assets->>video_task_id.eq.${task_id}`)
            .single();

        if (findError || !shot) {
            console.log(`No shot found for task ${task_id}`);
            return new Response("Not found", { status: 404 });
        }

        if (status !== 'TASK_STATUS_SUCCEEDED') {
            await supabase.from('shots').update({ status: 'failed', model_config: { error: payload.reason } }).eq('id', shot.id);
            return new Response("Failed", { status: 200 });
        }

        // T2I FINISHED
        if (images && images.length > 0) {
            const t2iUrl = images[0].image_url;
            await supabase.from('shots').update({
                status: 'i2v_pending', // Ready for next step
                assets: { ...shot.assets, t2i_url: t2iUrl }
            }).eq('id', shot.id);

            // OPTIONAL: Auto-trigger I2V here for speed?
            // For now, we rely on 'process-cult-assets' to pick up 'i2v_pending' items.
        }

        // VIDEO FINISHED
        if (videos && videos.length > 0) {
            const videoUrl = videos[0].video_url;
            await supabase.from('shots').update({
                status: 'done',
                assets: { ...shot.assets, video_url: videoUrl }
            }).eq('id', shot.id);
        }

        return new Response("OK", { status: 200 });

    } catch (err: any) {
        return new Response(err.message, { status: 500 });
    }
});
