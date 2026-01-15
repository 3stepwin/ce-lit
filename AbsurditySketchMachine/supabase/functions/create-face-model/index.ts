// ========================================
// CREATE-FACE-MODEL EDGE FUNCTION
// ========================================
// Creates a reusable face model from user selfies for face-swapping

type InputBody = {
    user_id: string;
    avatar_urls: string[];
};

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, data: unknown) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });
}

function requireEnv(name: string): string {
    const v = Deno.env.get(name);
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
}

// ========================================
// UPDATE PROFILE FACE MODEL STATUS
// ========================================
async function updateProfileFaceModel(
    supabaseUrl: string,
    serviceRoleKey: string,
    userId: string,
    faceModelId: string,
    status: "pending" | "processing" | "ready" | "failed",
) {
    const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify({
            face_model_id: faceModelId,
            face_model_status: status,
            updated_at: new Date().toISOString(),
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update profile failed: ${text}`);
    }
}

// ========================================
// MAIN HANDLER
// ========================================
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse(405, {
            error: "method_not_allowed",
            message: "Use POST for face model creation.",
        });
    }

    try {
        const supabaseUrl = requireEnv("SUPABASE_URL");
        const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

        // Face-swap API config (Replicate, Higgsfield, etc.)
        const faceSwapApiKey = Deno.env.get("FACE_SWAP_API_KEY") ?? "";
        const faceSwapApiUrl = Deno.env.get("FACE_SWAP_API_URL") ?? "";

        const body = (await req.json()) as InputBody;

        if (!body.user_id || !body.avatar_urls?.length) {
            return jsonResponse(400, {
                error: "bad_request",
                message: "user_id and avatar_urls are required.",
            });
        }

        const { user_id, avatar_urls } = body;

        // Update status to processing
        await updateProfileFaceModel(
            supabaseUrl,
            serviceRoleKey,
            user_id,
            "", // No model ID yet
            "processing",
        );

        // Generate a unique face model ID
        const faceModelId = `face_${user_id}_${Date.now()}`;

        // TODO: In production, call actual face-swap API here
        // Example with Replicate's consistent-character or similar:
        //
        // const response = await fetch(faceSwapApiUrl, {
        //   method: "POST",
        //   headers: {
        //     "Authorization": `Token ${faceSwapApiKey}`,
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     version: "...",
        //     input: {
        //       images: avatar_urls,
        //       // ... other params
        //     },
        //   }),
        // });
        //
        // const result = await response.json();
        // const faceModelId = result.id;

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update status to ready
        await updateProfileFaceModel(
            supabaseUrl,
            serviceRoleKey,
            user_id,
            faceModelId,
            "ready",
        );

        return jsonResponse(200, {
            success: true,
            faceModelId,
            message: "Face model created successfully. You're ready to star in sketches!",
        });

    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Face model creation error:", msg);

        return jsonResponse(500, {
            error: "face_model_failed",
            message: "Your face broke the algorithm. That's actually impressive.",
            detail: msg,
        });
    }
});
