import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function ack() {
    return new Response("ok", { status: 200, headers: corsHeaders });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return ack();
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const job_id = new URL(req.url).searchParams.get("job_id");
    const payload = await req.json().catch(() => null);

    (async () => {
        try {
            if (!job_id || !payload) return;
            if (payload.event_type !== "ASYNC_TASK_RESULT") return;

            const status = payload?.payload?.task?.status;

            if (status === "TASK_STATUS_SUCCEED") {
                const videos = payload?.payload?.videos ?? [];
                const video_url = videos?.[0]?.video_url ?? null;

                // Update celit_jobs (legacy)
                await supabase
                    .from("celit_jobs")
                    .update({ status: "succeed", result_video_url: video_url, raw_payload: payload })
                    .eq("id", job_id);

                // Update sketches (frontend primary)
                await supabase
                    .from("sketches")
                    .update({
                        status: "complete",
                        video_url: video_url,
                        generation_progress: 100,
                        completed_at: new Date().toISOString()
                    })
                    .eq("id", job_id);
            } else {
                await supabase
                    .from("celit_jobs")
                    .update({ status: "failed", raw_payload: payload })
                    .eq("id", job_id);

                await supabase
                    .from("sketches")
                    .update({
                        status: "failed",
                        error_message: "Novita generation failed"
                    })
                    .eq("id", job_id);
            }
        } catch {
            // ignore for MVP demo
        }
    })();

    return ack();
});
