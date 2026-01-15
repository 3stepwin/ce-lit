// ========================================
// PROCESS-ASSETS EDGE FUNCTION (CE LIT alias for process-cult-assets)
// ========================================
// Thin wrapper that forwards to the existing process‑cult‑assets implementation.
// No body is required – the function simply scans for pending shots and
// launches the Novita T2I jobs.

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Dynamically import the original handler
async function coreProcess() {
    const { handler } = await import('../process-cult-assets/index.ts');
    // The original file exports a default Deno.serve callback; we invoke it manually.
    const fakeReq = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    // @ts-ignore
    const response: any = await (handler as any)(fakeReq);
    return response;
}

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return new Response("POST required", { status: 405 });

    try {
        const resp = await coreProcess();
        return resp;
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
