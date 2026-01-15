// ========================================
// GENERATE-SCENE EDGE FUNCTION (CE LIT alias for generate-cult-scene)
// ========================================
// This is a thin wrapper that re‑uses the existing generate‑cult‑scene logic.
// It expects a body like { sketch_type, premise, role, style_preset? }
// and returns the same shape as the original function.

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Re‑use the core implementation from generate‑cult‑scene
async function coreGenerate(payload: any) {
    // Import the original implementation dynamically to avoid code duplication.
    const { handler } = await import('../generate-cult-scene/index.ts');
    // The original handler expects a Request object, but we can call its internal logic directly.
    // For simplicity we just forward the request body to the original function via a fake Request.
    const fakeReq = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    // @ts-ignore – the original file exports a default Deno.serve callback; we invoke it manually.
    const response: any = await (handler as any)(fakeReq);
    return response;
}

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return new Response("POST required", { status: 405 });

    try {
        const payload = await req.json();
        // Map the CE LIT fields to the original expected fields
        const mapped = {
            sketchId: undefined, // not used for new jobs
            topic: payload.premise,
            style_preset: payload.style_preset ?? "documentary",
            user_id: payload.user_id, // client should include the logged‑in user id
        };
        const resp = await coreGenerate(mapped);
        return resp;
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
