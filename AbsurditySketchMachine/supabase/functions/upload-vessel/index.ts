// ========================================
// UPLOAD-VESSEL EDGE FUNCTION (CE LIT – store user selfie)
// ========================================
// Expects a multipart/form-data request with a file field named "selfie".
// The function stores the file in Supabase Storage bucket "vessels" and returns
// the public URL and a generated vessel_id that can be attached to a script.

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper to parse multipart (simple version – works in Deno runtime)
async function parseForm(req: Request) {
    const contentType = req.headers.get('content-type') || '';
    const boundaryMatch = contentType.match(/boundary=(.*)$/);
    if (!boundaryMatch) throw new Error('Missing multipart boundary');
    const boundary = '--' + boundaryMatch[1];
    const raw = new Uint8Array(await req.arrayBuffer());
    const decoder = new TextDecoder();
    const parts = decoder.decode(raw).split(boundary).filter(p => p && p.trim() !== '--');
    const files: Record<string, Uint8Array> = {};
    for (const part of parts) {
        const [header, body] = part.split('\r\n\r\n');
        const disposition = header.match(/name="([^\"]+)"; filename="([^\"]+)"/);
        if (disposition) {
            const name = disposition[1];
            const filename = disposition[2];
            const content = body.replace(/\r\n$/, '');
            files[name] = new TextEncoder().encode(content);
        }
    }
    return files;
}

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return new Response("POST required", { status: 405 });

    try {
        const files = await parseForm(req);
        const selfie = files['selfie'];
        if (!selfie) throw new Error('selfie file missing');

        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        // @ts-ignore
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, serviceKey);

        const vesselId = crypto.randomUUID();
        const filePath = `${vesselId}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('vessels')
            .upload(filePath, selfie, { contentType: 'image/jpeg', upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
            .from('vessels')
            .getPublicUrl(filePath);

        // Optionally store a reference row (you may have a vessels table)
        await supabase.from('vessels').insert({ id: vesselId, url: publicUrl?.publicUrl }).catch(() => { });

        return new Response(JSON.stringify({ ok: true, vessel_id: vesselId, url: publicUrl?.publicUrl }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
