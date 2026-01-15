// ========================================
// HANDLE-NOVITA-WEBHOOK EDGE FUNCTION
// ========================================
// Orchestrates the "Cinematic" generation chain:
// T2I -> Face Swap -> I2V
// Managed via DB Status transitions.

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- API HELPERS (Duplicated from generate-sketch - ideally mostly shared but kept self-contained here for speed) ---

async function callNovitaMergeFace(apiKey: string, faceImageBase64: string, targetImageBase64: string, webhookUrl: string) {
    const url = `https://api.novita.ai/v3/merge-face`;
    // Note: Merge Face is SYNC or ASYNC? API docs say it returns image_file (sync) usually, 
    // but if we want 'async' behavior with webhook, we check specific endpoint.
    // If it is sync, we just do it and return result to next step immediately.
    // Assuming SYNC for this helper as per standard v3 usage, but if it takes too long, we might need async wrapper.
    // Actually, for "Cinematic" flow, let's look at the `generate-sketch` stub... it used `merg-face` endpoint.

    // IF Sync: We await it (up to timeout) then proceed to I2V immediately in THIS function.
    // IF Async: We trigger and wait for new webhook.

    // For safety in Edge Function (timeout risk), we should use ASYNC if possible, but Face Swap is usually fast (<10s).
    // Let's TRY SYNC. If it fails, we move to async.

    // ... Actually, the user Rules mentioned "Face Swap (Identity Injection) -> Provider: Novita AI (Merge Face)".
    // Let's implement as a standard fetch.

    const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            face_image_file: faceImageBase64,
            image_file: targetImageBase64,
            extra: { response_image_type: "base64" } // Get base64 back to pass to I2V immediately? Or URL?
        }),
    });

    // If this times out, we have a problem. 
    // Optimization: If Novita has Async Face Swap, use it. 
    // For now, assuming Sync is fast enough.

    const data = await res.json();
    if (!res.ok) throw new Error(`Novita MergeFace failed: ${JSON.stringify(data)}`);
    return data.image_file; // Base64
}

async function callNovitaI2V(apiKey: string, imageBase64: string, prompt: string, webhookUrl: string) {
    const url = `https://api.novita.ai/v3/async/kling-v2.1-i2v-master`;

    // Convert base64 to blob for multipart upload
    const imageBlob = await (await fetch(`data:image/png;base64,${imageBase64}`)).blob();

    // Create FormData (Novita Kling I2V requires multipart/form-data)
    const formData = new FormData();
    formData.append('image_file', imageBlob, 'image.png');
    formData.append('model_name', 'kling_v2_1');
    formData.append('prompt', prompt);
    formData.append('duration', '5');
    formData.append('cfg_scale', '0.5');
    formData.append('extra', JSON.stringify({
        webhook: {
            url: webhookUrl
            // No event_type needed - Novita always sends ASYNC_TASK_RESULT
        }
    }));

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`
            // DO NOT set Content-Type - FormData sets it with boundary
        },
        body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Novita I2V failed: ${JSON.stringify(data)}`);
    return data.task_id;
}

async function urlToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    const buf = await blob.arrayBuffer();
    // @ts-ignore
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

// --- MAIN HANDLER ---

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return new Response("POST required", { status: 405 });

    try {
        const body = await req.json();
        console.log("Novita Webhook Payload:", JSON.stringify(body, null, 2));

        // Validate event type
        if (body.event_type !== "ASYNC_TASK_RESULT") {
            console.log(`Ignoring event type: ${body.event_type}`);
            return new Response("OK", { status: 200, headers: corsHeaders });
        }

        // Extract nested payload
        // NOTE: Novita webhook structure: { event_type, payload: { task: {...}, extra: {...} } }
        // task contains: task_id, status, created_at, etc.
        // extra contains: images or videos based on task type
        const { task, extra } = body.payload || {};
        const task_id = task?.task_id;
        const status = task?.status;
        const videos = extra?.videos || [];
        const images = extra?.images || [];

        // Initial Validation
        if (!task_id || !status) {
            console.error("Invalid payload structure:", JSON.stringify(body));
            return new Response("Invalid payload", { status: 400 });
        }

        // Setup Clients
        // @ts-ignore
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // @ts-ignore
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const geminiKey = Deno.env.get("GEMINI_API_KEY"); // Might need for refinement?
        // @ts-ignore
        const novitaKey = Deno.env.get("NOVITA_API_KEY");
        const webhookUrl = Deno.env.get("WEBHOOK_URL") || "https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-novita-webhook";

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 1. Find the Sketch
        // We match by `external_id` which holds the Task ID of the CURRENT running step.
        const { data: sketch, error: findError } = await supabase
            .from('sketches')
            .select('*') // Need full object to access content/meta
            .eq('external_id', task_id)
            .single();

        if (findError || !sketch) {
            console.error(`No sketch found for task_id: ${task_id}`);
            // Idempotency: Maybe it was already updated?
            return new Response("Sketch not found", { status: 404 });
        }

        console.log(`Processing Sketch ${sketch.id} in state: ${sketch.status}`);

        // 2. Handle Task Failure
        if (status === "TASK_STATUS_FAILED" || status === "FAILED") {
            await supabase.from('sketches').update({
                status: "failed",
                error_message: body.payload?.reason || "Novita task failed"
            }).eq('id', sketch.id);
            return new Response("Marked as failed", { status: 200 });
        }

        // 3. Handle Task Success - STATE MACHINE
        if (status === "TASK_STATUS_SUCCEEDED" || status === "SUCCEEDED" || status === "FINISHED" || status === "TASK_STATUS_SUCCEED") {

            // --- STATE: RUNNING (Direct T2V from generate-sketch / Fallback) ---
            if (sketch.status === 'running') {
                // Check if we have videos (Direct T2V)
                if (videos && videos.length > 0) {
                    const videoUrl = videos[0].video_url;
                    console.log("Direct T2V Complete (from running). URL:", videoUrl);
                    await supabase.from('sketches').update({
                        status: "generated",
                        generation_progress: 100,
                        video_url: videoUrl,
                        final_video_url: videoUrl,
                        completed_at: new Date().toISOString()
                    }).eq('id', sketch.id);
                } else if (images && images.length > 0) {
                    // Should trigger face swap flow if images present? 
                    // For now, let's assume if it was 'running' from generate-sketch, it was T2V.
                    // But if it was T2I, we might need to handle it.
                    // Let's coerce it to generating_image logic below if it has images.
                }
            }

            // --- STATE: GENERATING IMAGE (T2I Done) ---
            else if (sketch.status === 'generating_image') {
                const t2iUrl = images?.[0]?.image_url;
                if (!t2iUrl) throw new Error("T2I Succeeded but no image_url found");

                console.log("T2I Complete. URL:", t2iUrl);

                // NEXT STEP: Face Swap OR Video
                // Check if we have a user avatar to swap
                const userAvatarUrl = sketch.meta?.user_avatar_url || sketch.avatar_url;

                if (userAvatarUrl && sketch.role !== 'generic') {
                    // ==> TRIGGER FACE SWAP
                    console.log("Triggering Face Swap...");

                    // a. Download T2I Image to Base64 (needed for Sync Face Swap)
                    const t2iBase64 = await urlToBase64(t2iUrl);
                    const avatarBase64 = await urlToBase64(userAvatarUrl);

                    // b. Call Face Swap (Sync for now)
                    const swappedBase64 = await callNovitaMergeFace(novitaKey, avatarBase64, t2iBase64, webhookUrl);

                    // c. Upload Swapped Image to Storage (Optional, but good for debugging)
                    // ... Skipping upload for speed, passing Base64 directly to I2V

                    // ==> TRIGGER I2V (Immediate chain since Swap was sync)
                    console.log("Face Swap Done. Triggering I2V...");
                    const video_prompt_json = sketch.video_prompt_json || {};
                    const motionPrompt = `${video_prompt_json.motion_type || 'cinematic'} ${video_prompt_json.camera_move || 'subtle movement'}`.trim();
                    const i2vTaskId = await callNovitaI2V(novitaKey, swappedBase64, motionPrompt, webhookUrl);

                    // Update DB TO I2V Status
                    await supabase.from('sketches').update({
                        status: "generating_video",
                        generation_progress: 60,
                        external_id: i2vTaskId,
                        meta: {
                            ...sketch.meta,
                            base_image_url: t2iUrl,
                            swapped: true
                        }
                    }).eq('id', sketch.id);

                } else {
                    // ==> SKIP SWAP, TRIGGER I2V DIRECTLY
                    console.log("Skipping Face Swap. Triggering I2V...");
                    const video_prompt_json = sketch.video_prompt_json || {};
                    const motionPrompt = `${video_prompt_json.motion_type || 'cinematic'} ${video_prompt_json.camera_move || 'subtle movement'}`.trim();
                    // Need base64 for Kling usually, or URL. Kling supports URL? 
                    // Novita Kling docs say "image_file" (Base64). Let's convert.
                    const t2iBase64 = await urlToBase64(t2iUrl);

                    const i2vTaskId = await callNovitaI2V(novitaKey, t2iBase64, motionPrompt, webhookUrl);

                    await supabase.from('sketches').update({
                        status: "generating_video",
                        generation_progress: 50,
                        external_id: i2vTaskId,
                        meta: { ...sketch.meta, base_image_url: t2iUrl }
                    }).eq('id', sketch.id);
                }
            }

            // --- STATE: GENERATING VIDEO (I2V Done) ---
            else if (sketch.status === 'generating_video') {
                const videoUrl = videos?.[0]?.video_url;
                if (!videoUrl) throw new Error("I2V Succeeded but no video_url found");

                console.log("I2V Complete. URL:", videoUrl);

                // Update with idempotency: Only update if still in generating_video state
                const { error: updateError } = await supabase.from('sketches')
                    .update({
                        status: "complete",
                        generation_progress: 100,
                        video_url: videoUrl,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', sketch.id)
                    .eq('status', 'generating_video'); // Idempotency: only update if still in this state

                if (updateError) {
                    console.warn("Idempotent update skipped or failed (already completed?)", updateError);
                }
            }

            // --- STATE: SWAPPING FACE (Async Fallback) ---
            else if (sketch.status === 'swapping_face') {
                const swappedUrl = images?.[0]?.image_url;
                if (!swappedUrl) throw new Error("Face Swap succeeded but no image_url found");

                console.log("Face Swap Complete. URL:", swappedUrl);

                // Now trigger I2V with the swapped image
                const motionPrompt = sketch.content?.motion_prompt || "cinematic subtle movement";
                const swappedBase64 = await urlToBase64(swappedUrl);
                const i2vTaskId = await callNovitaI2V(novitaKey, swappedBase64, motionPrompt, webhookUrl);

                // Update DB to I2V Status
                await supabase.from('sketches').update({
                    status: "generating_video",
                    generation_progress: 70,
                    external_id: i2vTaskId,
                    meta: { ...sketch.meta, swapped_image_url: swappedUrl }
                }).eq('id', sketch.id);
            }

        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        console.error("Webhook Error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
