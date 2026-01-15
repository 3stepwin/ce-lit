import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json(405, { error: "Method not allowed" });

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const NOVITA_API_KEY = Deno.env.get("NOVITA_API_KEY")!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 1. Generate an idea
        const ideaResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-idea`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!ideaResponse.ok) {
            throw new Error("Failed to generate an idea.");
        }

        const idea = await ideaResponse.json();

        // 2. Build the prompt package
        const promptPackageResponse = await fetch(`${SUPABASE_URL}/functions/v1/build-prompt-package`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(idea)
        });

        if (!promptPackageResponse.ok) {
            throw new Error("Failed to build the prompt package.");
        }

        const promptPackage = await promptPackageResponse.json();

        const { image_prompt, video_prompt, meta_tokens } = promptPackage;

        const body = await req.json();
        const sketchId = body.sketchId || crypto.randomUUID();

        // 3. Save the sketch to the database
        const { data: record, error: sketchError } = await supabase.from("sketches").upsert({
            id: sketchId,
            status: "generating_image",
            sketch_type: idea.sketch_type,
            premise: idea.topic,
            role: "MAIN_PERFORMER",
            image_prompt_json: image_prompt,
            video_prompt_json: video_prompt,
            provider_selected: "novita",
            content: {
                meta_tokens: meta_tokens
            }
        }).select("*").single();

        if (sketchError) {
            throw sketchError;
        }

        // 4. Generate the image
        const webhookUrl = `${Deno.env.get("PUBLIC_BASE_URL")}/functions/v1/handle-novita-webhook?job_id=${record.id}`;
        const imagePromptText = `${image_prompt.subject || 'person'} ${image_prompt.action || 'standing'} in ${image_prompt.setting || 'a room'}. ${image_prompt.camera || 'cinematic shot'}. ${image_prompt.style || 'photorealistic'}`.trim().slice(0, 800);

        const t2iPayload = {
            extra: {
                response_image_type: "jpeg",
                webhook: {
                    url: webhookUrl,
                }
            },
            request: {
                model_name: "sd_xl_base_1.0.safetensors",
                prompt: imagePromptText,
                negative_prompt: "blurry, low quality, distorted, cartoon, anime",
                width: 720,
                height: 1280,
                image_num: 1,
                steps: 20,
                seed: -1,
                clip_skip: 1,
                sampler_name: "Euler a",
                guidance_scale: 7.5
            }
        };

        const res = await fetch("https://api.novita.ai/v3/async/txt2img", {
            method: "POST",
            headers: { Authorization: `Bearer ${NOVITA_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify(t2iPayload),
        });

        const txt = await res.text();
        if (!res.ok) {
            await supabase.from("sketches").update({ status: "failed", error_message: txt }).eq("id", record.id);
            return json(500, { error: "Novita T2I submit failed", details: txt });
        }

        const out = JSON.parse(txt);

        await supabase.from("sketches").update({
            external_id: out.task_id,
        }).eq("id", record.id);

        return json(200, { ok: true, job_id: record.id, task_id: out.task_id, step: "t2i", prompt: imagePromptText });

    } catch (e) {
        return json(500, { error: "Unexpected error", details: String((e as any)?.message ?? e) });
    }
});
