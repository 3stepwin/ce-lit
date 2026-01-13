// ========================================
// GENERATE-SKETCH EDGE FUNCTION - CELIT VIRAL SYSTEM
// ========================================
// LOCKED v2.0 - Novita AI I2V + Face Swap Workflow

// @ts-ignore
import { buildCelitPrompt, CelitRole, AestheticPreset, PatternInterruptType } from "./celit-prompt.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, data: unknown) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

function requireEnv(name: string): string {
    // @ts-ignore
    const v = Deno.env.get(name);
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
}

// --- API HELPERS ---

async function callGeminiJSON(model: string, apiKey: string, prompt: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
            },
        }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Gemini failed (${res.status}): ${text}`);
    const data = JSON.parse(text);
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error(`Gemini response missing JSON text`);
    return JSON.parse(raw);
}

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
            negative_prompt: "nsfw, ugly, deformed, text, watermark",
            width: 832,
            height: 1216,
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

async function callNovitaMergeFace(apiKey: string, faceImageBase64: string, targetImageBase64: string) {
    const url = `https://api.novita.ai/v3/merge-face`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            face_image_file: faceImageBase64,
            image_file: targetImageBase64,
            extra: { response_image_type: "png" }
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Novita MergeFace failed: ${JSON.stringify(data)}`);

    // Returns { image_file: "base64..." } or URL? Checks needed.
    return data.image_file;
}

async function callNovitaI2V(apiKey: string, imageUrl: string, prompt: string, seed?: number) {
    const url = `https://api.novita.ai/v3/async/wan-2.2-i2v`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            input: {
                prompt: prompt,
                img_url: imageUrl,
                negative_prompt: "blurry, distorted, low quality, static, mutations"
            },
            parameters: {
                resolution: "832*1216",
                duration: 5,
                prompt_extend: true,
                seed: seed || Math.floor(Math.random() * 100000)
            }
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Novita I2V failed: ${JSON.stringify(data)}`);
    return data.task_id;
}

// --- UTILS ---

async function urlToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    const buf = await blob.arrayBuffer();
    // @ts-ignore
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function uploadBase64ToStorage(supabase: any, bucket: string, path: string, base64: string, contentType: string) {
    // @ts-ignore
    const bin = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const { data, error } = await supabase.storage.from(bucket).upload(path, bin, {
        contentType, upsert: true
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
}

// --- MAIN ---

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabaseUrl = requireEnv("SUPABASE_URL");
        const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
        const geminiKey = requireEnv("GEMINI_API_KEY");
        // @ts-ignore
        const novitaKey = Deno.env.get("NOVITA_API_KEY"); // Might be missing initially

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const body = (await req.json());
        const { role = "news_anchor", user_id, dumbness_level = 7 } = body;

        // 1. Setup Logic (Interrupts, Aesthetic)
        const roleAestheticMap: Record<string, AestheticPreset> = {
            high_priest: 'prestige_clean',
            innocent_victim: 'analog_rot',
            news_anchor: 'prestige_clean',
            hr_representative: 'corporate_dystopia',
            customer_support: 'corporate_dystopia',
        };
        const aesthetic_preset = roleAestheticMap[role] || 'prestige_clean';
        const interrupt_type = (['news_anchor', 'customer_support'].includes(role) && Math.random() > 0.6)
            ? 'subtitle_betrayal'
            : 'visual_betrayal';

        // 2. Insert Initial Sketch Record
        const { data: sketch, error: insertError } = await supabase
            .from('sketches')
            .insert({
                user_id,
                role,
                sketch_type: "celit_viral_v2",
                status: "generating_script",
                generation_progress: 10,
                dumbness_level
            })
            .select()
            .single();

        if (insertError) throw insertError;
        const sketchId = sketch.id;

        // 3. Generate Script (Gemini)
        const prompt = buildCelitPrompt({ role, aesthetic_preset, pattern_interrupt: interrupt_type });
        const generated = await callGeminiJSON("gemini-1.5-flash", geminiKey, prompt);

        await supabase.from('sketches').update({
            content: { ...generated, aesthetic_preset, pattern_interrupt_type: interrupt_type },
            status: "generating_image",
            generation_progress: 30
        }).eq('id', sketchId);

        // 4. Handle Visuals (Novita Flow)
        let finalVideoTaskId = null;
        let mockVideoUrl = null;

        if (novitaKey) {
            // A. Get User Avatar (Placeholder for now, logic handled in Webhook Stage 2)
            const userAvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000";

            // B. Generate Base Character Image (T2I)
            // We START the chain here. The T2I Webhook will trigger Stage 2 (Face Swap or I2V).
            const webhookUrl = "https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-novita-webhook";

            // Generate the visual prompt
            const visualPrompt = `cinematic portrait, ${generated.t2i_prompt || generated.visual_description}, ${aesthetic_preset} aesthetic, 8k, sharp focus`;

            finalVideoTaskId = await callNovitaT2I(novitaKey, visualPrompt, webhookUrl);
            console.log("Started Novita T2I Chain:", finalVideoTaskId);

        } else {
            console.log("Missing NOVITA_API_KEY - Skipping video gen");
            mockVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
        }

        // 5. Final Update
        await supabase.from('sketches').update({
            status: finalVideoTaskId ? "generating_image" : "complete", // Start of chain
            generation_progress: finalVideoTaskId ? 15 : 100,
            external_id: finalVideoTaskId,
            video_url: mockVideoUrl,
            meta: {
                novita_t2i_task_id: finalVideoTaskId,
                started_at: new Date().toISOString()
            }
        }).eq('id', sketchId);

        return jsonResponse(200, { ok: true, sketchId, generated, currentTaskId: finalVideoTaskId, status: "generating_image" });

    } catch (err: any) {
        console.error("CELIT Error:", err.message);
        return jsonResponse(500, { error: err.message });
    }
});
