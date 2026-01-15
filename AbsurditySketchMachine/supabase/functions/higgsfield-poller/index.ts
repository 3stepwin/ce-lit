import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HIGGS_HEADERS = (apiKeyId: string, apiKey: string) => ({
    "Content-Type": "application/json",
    "Authorization": `Key ${apiKeyId}:${apiKey}`,
    "Accept": "application/json",
    "User-Agent": "higgsfield-server-js/2.0"
});

async function pollHiggsfield(statusUrl: string, apiKeyId: string, apiKey: string, maxRetries = 60) {
    for (let i = 0; i < maxRetries; i++) {
        const res = await fetch(statusUrl, {
            headers: HIGGS_HEADERS(apiKeyId, apiKey)
        });
        if (!res.ok) {
            console.error(`Polling failed [${res.status}]`);
            await new Promise(r => setTimeout(r, 5000));
            continue;
        }
        const data = await res.json();
        console.log(`Poll ${i + 1}/${maxRetries}: status [${data.status}]`);

        if (data.status === "completed") return data;
        if (data.status === "failed") throw new Error(`Higgsfield task failed: ${JSON.stringify(data.error || data)}`);

        await new Promise(r => setTimeout(r, 5000)); // Poll every 5 seconds
    }
    throw new Error("Higgsfield polling timed out after 5 minutes");
}

Deno.serve(async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const HIGGSFIELD_API_KEY_ID = Deno.env.get("HIGGSFIELD_API_KEY_ID")!;
        const HIGGSFIELD_API_KEY = Deno.env.get("HIGGSFIELD_API_KEY")!;

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const body = await req.json();
        const { job_id, status_url } = body;

        if (!job_id || !status_url) {
            return new Response(JSON.stringify({ error: "Missing job_id or status_url" }), { status: 400 });
        }

        console.log(`Starting Higgsfield polling for job ${job_id}`);
        console.log(`Status URL: ${status_url}`);

        // Poll until completion
        const result = await pollHiggsfield(status_url, HIGGSFIELD_API_KEY_ID, HIGGSFIELD_API_KEY);

        const videoUrl = result.videos?.[0]?.url;

        if (!videoUrl) {
            throw new Error("No video URL returned from Higgsfield Dop");
        }

        console.log(`Video generation complete for ${job_id}: ${videoUrl}`);

        // Update both tables
        await Promise.all([
            supabase.from("sketches").update({
                status: "complete",
                video_url: videoUrl,
                completed_at: new Date().toISOString()
            }).eq("id", job_id),

            supabase.from("celit_jobs").update({
                status: "succeed",
                result_video_url: videoUrl,
                completed_at: new Date().toISOString()
            }).eq("id", job_id)
        ]);

        console.log(`Database updated successfully for ${job_id}`);

        return new Response(JSON.stringify({
            success: true,
            job_id,
            video_url: videoUrl
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Higgsfield poller error:", error);

        // Try to mark job as failed in database
        try {
            const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
            const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            const body = await req.json();
            if (body.job_id) {
                await Promise.all([
                    supabase.from("sketches").update({
                        status: "failed",
                        error_message: error.message
                    }).eq("id", body.job_id),

                    supabase.from("celit_jobs").update({
                        status: "failed",
                        error_message: error.message
                    }).eq("id", body.job_id)
                ]);
            }
        } catch (dbError) {
            console.error("Failed to update database with error:", dbError);
        }

        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
