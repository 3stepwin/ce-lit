
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
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const body = await req.json().catch(() => ({}));
        const category = body.category ? String(body.category) : null;
        const session_id = body.session_id ? String(body.session_id) : null;

        // 1. Get recent usage to avoid repeats
        let avoidIds: string[] = [];
        if (session_id) {
            const { data: recent } = await supabase
                .from("celit_seed_runs")
                .select("premise_id")
                .eq("session_id", session_id)
                .order("created_at", { ascending: false })
                .limit(8);
            if (recent) avoidIds = recent.map((r: any) => r.premise_id).filter(Boolean);
        }

        // 2. Fetch Premises
        let query = supabase.from("celit_premises").select("*").eq("active", true);
        if (category && category !== 'random') {
            // If category is provided, try to match. If random, fetch all.
            // Note: 'random' string might be passed, so treat it as 'no filter'
            query = query.eq("category", category);
        }

        const { data: allPremises, error: pError } = await query;
        if (pError) throw new Error(`Premise fetch failed: ${pError.message}`);

        // Filter and Weighting
        let candidates = (allPremises || []).filter((p: any) => !avoidIds.includes(p.id));
        if (candidates.length === 0 && allPremises?.length) candidates = allPremises; // Fallback if all used

        if (!candidates || candidates.length === 0) {
            return json(404, { error: "No active premises found" });
        }

        // Weighted Random Pick
        // Simple implementation: Flatten based on weight (or just pick random high weight)
        // For simplicity/speed: Pick random
        const premise = candidates[Math.floor(Math.random() * candidates.length)];

        // 3. Fetch Scene (Random)
        const { data: scenes, error: sError } = await supabase
            .from("celit_scene_bank")
            .select("*")
            .eq("active", true);

        if (sError) throw new Error(`Scene fetch failed: ${sError.message}`);
        const sceneData = scenes && scenes.length > 0
            ? scenes[Math.floor(Math.random() * scenes.length)]
            : null;

        if (!sceneData) return json(404, { error: "No scenes found" });

        // 4. Mark Used (Fire and forget, or await)
        if (premise.id && sceneData.id) {
            await supabase.from("celit_seed_runs").insert({
                session_id: session_id,
                premise_id: premise.id,
                scene_id: sceneData.id
            });
            // Update timestamps (optional, skipping for speed/simplicity as triggers handle updated_at, 
            // but last_used_at needs explicit update. Doing it here implies 2 more calls.
            // Let's rely on seed_runs for history filtering mainly.)
            await supabase.from("celit_premises").update({ last_used_at: new Date() }).eq("id", premise.id);
        }

        const seed = {
            premise_id: premise.id,
            scene_id: sceneData.id,
            category: premise.category,
            sketch_type: premise.sketch_type,
            role: premise.role_hint || 'MAIN_PERFORMER',
            premise: premise.premise,
            scene: {
                scene_archetype: sceneData.scene_archetype,
                setting: sceneData.setting,
                camera_grammar: sceneData.camera_grammar,
                sound_grammar: sceneData.sound_grammar,
                subtitle_style: sceneData.subtitle_style,
                props: sceneData.props
            }
        };

        return json(200, { ok: true, seed });

    } catch (e) {
        return json(500, { error: "Unexpected error", details: String((e as any)?.message ?? e) });
    }
});
