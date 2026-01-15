// ========================================
// HANDLE-CULT-WEBHOOK EDGE FUNCTION
// ========================================
// Handles callbacks from Novita (Seedream/Kling)
// Updates Shot status:
// - T2I Finish -> Updates shot.assets.t2i_url -> Sets status 'i2v_pending'
// - I2V Finish -> Updates shot.assets.video_url -> Sets status 'i2v_completed'

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const body = await req.json();
        console.log("Cult Webhook Received:", JSON.stringify(body, null, 2));

        // Novita ASYNC_TASK_RESULT structure:
        // {
        //   event_type: "ASYNC_TASK_RESULT",
        //   payload: {
        //     task: { task_id, status, ... },
        //     extra: { images: [...], videos: [...] }
        //   }
        // }

        // 1. Validate event type
        if (body.event_type !== "ASYNC_TASK_RESULT") {
            console.warn("Unknown event type:", body.event_type);
            return new Response("OK", { status: 200, headers: corsHeaders });
        }

        const { task, extra } = body.payload || {};
        const taskId = task?.task_id;
        const taskStatus = task?.status;

        if (!taskId) {
            console.error("Missing task_id in payload");
            return new Response("Missing task_id", { status: 400 });
        }

        // Setup Supabase
        // @ts-ignore
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // @ts-ignore
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // Find the shot associated with this external_id
        const { data: shot, error: findError } = await supabase
            .from('shots')
            .select('*')
            .eq('external_id', taskId)
            .single();

        if (findError || !shot) {
            console.error(`Shot not found for task ${taskId}`);
            return new Response("Shot not found", { status: 404, headers: corsHeaders });
        }

        // Handle task failure
        if (taskStatus === "TASK_STATUS_FAILED") {
            await supabase.from('shots').update({
                status: 'failed',
                error_message: task.reason || 'Novita task failed',
                updated_at: new Date().toISOString()
            }).eq('id', shot.id);

            return new Response(JSON.stringify({ ok: true, status: 'failed' }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Handle task success
        if (taskStatus !== "TASK_STATUS_SUCCEED") {
            console.warn("Unknown task status:", taskStatus);
            return new Response("OK", { status: 200, headers: corsHeaders });
        }

        // T2I Finish (images in extra.images)
        if (shot.status === 't2i_processing' && extra?.images && extra.images.length > 0) {
            const imageUrl = extra.images[0].image_url;
            console.log(`T2I Complete for shot ${shot.id}:`, imageUrl);

            // Update shot to be ready for video gen
            await supabase.from('shots').update({
                status: 'i2v_pending',
                assets: { ...shot.assets, t2i_url: imageUrl },
                updated_at: new Date().toISOString()
            }).eq('id', shot.id);

            // Trigger next step immediately (optional, or wait for Cron)
            await fetch(`${supabaseUrl}/functions/v1/process-cult-assets`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${serviceRoleKey}` }
            });
        }
        // I2V Finish (videos in extra.videos)
        else if (shot.status === 'i2v_processing' && extra?.videos && extra.videos.length > 0) {
            const videoUrl = extra.videos[0].video_url_nowatermark || extra.videos[0].video_url;
            console.log(`I2V Complete for shot ${shot.id}:`, videoUrl);

            // Update shot to complete
            await supabase.from('shots').update({
                status: 'i2v_completed',
                assets: { ...shot.assets, video_url: videoUrl },
                updated_at: new Date().toISOString()
            }).eq('id', shot.id);

            // Check if all shots for this sketch are done
            // If so, trigger stitcher or mark sketch complete...
            // (Simplification: just mark shot complete)
        }

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        console.error("Webhook Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
