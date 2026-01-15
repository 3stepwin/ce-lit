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

function groupByCategory(rows: any[]) {
    const grouped: Record<string, any[]> = {};
    for (const r of rows) {
        const cat = r.category || "misc";
        grouped[cat] ||= [];
        grouped[cat].push(r);
    }
    return grouped;
}

function pick(grouped: Record<string, any[]>, cat: string, n = 2) {
    return (grouped[cat] || []).slice(0, n).map(r => r.content).filter(Boolean).join(" | ");
}

function weightedPick<T>(options: { item: T, weight: number }[]): T {
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = Math.random() * totalWeight;
    for (const opt of options) {
        if (random < opt.weight) return opt.item;
        random -= opt.weight;
    }
    return options[0].item;
}

const VECTOR_MAP: Record<string, { sketch_type: string, category: string, role: string }> = {
    LIFE_VECTOR: { sketch_type: "public_apology", category: "life", role: "SUBJECT" },
    WORK_VECTOR: { sketch_type: "corporate_training", category: "work", role: "EMPLOYEE" },
    FEED_VECTOR: { sketch_type: "security_breach", category: "feed", role: "SUBJECT" },
};

const VECTOR_WEIGHTS: Record<string, number> = {
    WORK_VECTOR: 0.50,
    FEED_VECTOR: 0.30,
    LIFE_VECTOR: 0.20
};

// ...

const pickWeights = { WORK: 0.50, FEED: 0.30, LIFE: 0.20 };

function buildCelitDirective(sketch_type: string, premise: string, role: string, grouped: Record<string, any[]>, scene?: any) {
    return `
INSTITUTIONAL REALITY ARTIFACT (vertical 9:16).
TONE: Deadpan clinical credibility.
SITUATION: ${premise}
ARCHETYPE: ${sketch_type}
USER_ROLE: ${role || "SUBJECT"}

SCENE SPECIFICS:
SETTING: ${scene?.setting ?? "Clinical environment"}
CAMERA: ${scene?.camera_grammar ?? "Stable tripod, slow push"}
SOUND: ${scene?.sound_grammar ?? "HVAC hum, sterile room tone"}
SUBTITLES: ${scene?.subtitle_style ?? "Standard institutional lower-thirds"}
PROPS: ${scene?.props ?? "Official documentation, badge"}

STRUCTURAL REQUIREMENTS:
1. 0–7s: ESTABLISH TRUST. Use prestige cinema grammar (realistic lighting, neutral acting). Looking like a legitimate institutional media output.
2. ~8–12s: PATTERN INTERRUPT. A single logical violation treated as a standard procedure or policy statement.
3. FINAL THIRD: IMPLICATION. Technical language confirming the user's participation or enrollment in the system.
4. LAST 3s: VERDICT LINE + HARD CUT. No fade. The last frame is the "Artifact".

PROMPT FRAGMENTS:
${pick(grouped, "cinematic")} | ${pick(grouped, "camera")} | ${pick(grouped, "lenses")}

CONSTRAINT: Zero goofy comedy. High-stakes procedural boredom.
`.trim();
}

const HIGGS_HEADERS = (apiKeyId: string, apiKey: string) => ({
    "Content-Type": "application/json",
    "Authorization": `Key ${apiKeyId}:${apiKey}`,
    "Accept": "application/json",
    "User-Agent": "higgsfield-server-js/2.0"
});

async function pollHiggsfield(statusUrl: string, apiKeyId: string, apiKey: string, maxRetries = 40) {
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
        console.log(`Poll status [${data.status}] for ${statusUrl}`);
        if (data.status === "completed") return data;
        if (data.status === "failed") throw new Error(`Higgsfield task failed: ${JSON.stringify(data.error || data)}`);
        await new Promise(r => setTimeout(r, 5000));
    }
    throw new Error("Higgsfield polling timed out");
}

async function callHiggsfieldFullClip(apiKeyId: string, apiKey: string, imagePrompt: string, motionPrompt: string, avatarUrl?: string, novitaKey?: string) {
    // STAGE 1: TEXT TO IMAGE (SOUL)
    console.log("Higgsfield Stage 1: Generating Image (Soul)");
    const soulUrl = "https://platform.higgsfield.ai/higgsfield-ai/soul/standard";
    const soulRes = await fetch(soulUrl, {
        method: "POST",
        headers: HIGGS_HEADERS(apiKeyId, apiKey),
        body: JSON.stringify({
            prompt: imagePrompt,
            aspect_ratio: "9:16",
            resolution: "720p"
        })
    });

    if (!soulRes.ok) {
        const err = await soulRes.text();
        throw new Error(`Soul Image Gen Failed [${soulRes.status}]: ${err}`);
    }
    const soulData = await soulRes.json();
    const soulResult = await pollHiggsfield(soulData.status_url, apiKeyId, apiKey);
    let imageUrl = soulResult.images?.[0]?.url;

    if (!imageUrl) throw new Error("No image URL returned from Soul model");
    console.log("Higgsfield Stage 1 Complete. Image:", imageUrl);

    // STAGE 1.5: FACE SWAP (If Avatar provided)
    if (avatarUrl && novitaKey) {
        console.log("Stage 1.5: Injecting Identity (Novita Face Swap)");
        try {
            // Helper to get base64 for Novita Merge Face
            const toBase64 = async (u: string) => {
                const r = await fetch(u);
                const b = await r.blob();
                const arrayBuffer = await b.arrayBuffer();
                // @ts-ignore
                return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            };

            const t2iBase64 = await toBase64(imageUrl);
            const avatarBase64 = await toBase64(avatarUrl);

            const swapRes = await fetch("https://api.novita.ai/v3/merge-face", {
                method: "POST",
                headers: { "Authorization": `Bearer ${novitaKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    face_image_file: avatarBase64,
                    image_file: t2iBase64,
                    extra: { response_image_type: "base64" }
                }),
            });

            if (swapRes.ok) {
                const swapData = await swapRes.json();
                imageUrl = `data:image/png;base64,${swapData.image_file}`;
                console.log("Face swap successful.");
            } else {
                console.error("Face swap failed, continuing with original image.");
            }
        } catch (e) {
            console.error("Face swap error:", e);
        }
    }

    // STAGE 2: IMAGE TO VIDEO (DOP)
    console.log("Higgsfield Stage 2: Animating Image (Dop)");
    const dopUrl = "https://platform.higgsfield.ai/higgsfield-ai/dop/standard";
    const dopRes = await fetch(dopUrl, {
        method: "POST",
        headers: HIGGS_HEADERS(apiKeyId, apiKey),
        body: JSON.stringify({
            image_url: imageUrl,
            prompt: motionPrompt,
            duration: 5
        })
    });

    if (!dopRes.ok) {
        const err = await dopRes.text();
        throw new Error(`Dop Video Gen Failed [${dopRes.status}]: ${err}`);
    }

    const dopData = await dopRes.json();
    return await pollHiggsfield(dopData.status_url, apiKeyId, apiKey);
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json(405, { error: "Method not allowed" });

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const NOVITA_API_KEY = Deno.env.get("NOVITA_API_KEY")!;
        const HIGGSFIELD_API_KEY_ID = Deno.env.get("HIGGSFIELD_API_KEY_ID")!;
        const HIGGSFIELD_API_KEY = Deno.env.get("HIGGSFIELD_API_KEY")!;
        const HIGGS_ENABLED = Deno.env.get("HIGGS_ENABLED") === "true";
        const PUBLIC_BASE_URL = Deno.env.get("PUBLIC_BASE_URL")!;

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const body = await req.json();
        console.log("SYSCALL_LOG :: REQUEST_RECEIVED", {
            method: req.method,
            sketchId: body.sketchId,
            userId: body.userId,
            type: body.type || body.sketch_type,
            vectors: body.reality_vectors
        });
        const authHeader = req.headers.get("Authorization")!;
        const token = authHeader ? authHeader.replace("Bearer ", "") : "";

        let userId = body.userId || body.identity_id;
        if (!userId && token) {
            const { data: { user } } = await supabase.auth.getUser(token);
            userId = user?.id;
        }

        const avatarId = body.avatarId;
        let avatarUrl = "";
        if (avatarId) {
            const { data: avatar } = await supabase.from("user_avatars").select("public_url").eq("id", avatarId).single();
            if (avatar) avatarUrl = avatar.public_url;
        }

        const sketchId = body.sketchId;
        const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (sketchId && !isUuid(sketchId)) {
            return json(400, { error: "Invalid sketchId format. Must be a valid UUID for optimistic sync." });
        }

        const cinema_lane = body.cinema_lane === true;
        const vectors = Array.isArray(body.reality_vectors) ? body.reality_vectors : [];
        const type = (body.type ?? body.sketch_type ?? "fake_commercial").toString();

        // Initial defaults
        let sketch_type = (body.sketch_type ?? body.type ?? "fake_commercial").toString();
        let role = (body.role ?? "MAIN_PERFORMER").toString();
        let scene = body.scene ?? null;
        let premise = (body.premise ?? "").toString().trim();
        let vectorChosen = null;

        // --- STAGE 1: PAYLOAD NORMALIZATION & VECTOR WEIGHTING ---
        if (type === "celit_viral") {
            const rawVectors = vectors.length ? vectors : ["WORK_VECTOR"];
            // Normalize: remove _VECTOR suffix if present to check map, but keep weighted lookup flexible
            const normalizedVectors = rawVectors.map(v => v.replace("_VECTOR", ""));

            const pickWeights = { WORK: 0.50, FEED: 0.30, LIFE: 0.20 };

            const vectorToPick = weightedPick(normalizedVectors.map(v => ({
                item: v,
                weight: pickWeights[v as keyof typeof pickWeights] ?? 0.1
            })));

            vectorChosen = `${vectorToPick}_VECTOR`;
            const mapping = VECTOR_MAP[vectorChosen] || VECTOR_MAP.WORK_VECTOR;

            sketch_type = mapping.sketch_type;
            if (!body.role) role = mapping.role;
        }

        // --- STAGE 1.2: SEED BANK RESOLUTION (If premise is empty) ---
        let premise_id = null;
        let scene_id = null;

        if (!premise) {
            console.log("Empty premise, fetching from Seed Bank for category:", vectorChosen);
            const p_category = vectorChosen ? (VECTOR_MAP[vectorChosen]?.category || null) : null;
            const session_id = (userId && isUuid(userId)) ? userId : crypto.randomUUID();

            const { data: seed, error: seedError } = await supabase.rpc("get_random_seed", {
                p_category: p_category,
                p_session_id: session_id,
                p_avoid_last: 6
            });

            if (seedError || !seed || seed.length === 0) {
                console.error("Seed fetch failed:", seedError);
                // Last ditch fallback if RPC fails or returns nothing
                premise = `Mandatory ${sketch_type} artifact matching ${vectorChosen || "system"} protocol.`;
            } else {
                const s = seed[0];
                premise = s.premise;
                premise_id = s.premise_id;
                scene_id = s.scene_id;

                // Allow seed to override if not explicitly provided in body
                if (!body.role && s.role) role = s.role;
                if (!body.sketch_type && s.sketch_type) sketch_type = s.sketch_type;
                if (!scene && s.scene) scene = s.scene;

                // Mark seed as used
                await supabase.rpc("mark_seed_used", {
                    p_premise_id: premise_id,
                    p_scene_id: scene_id,
                    p_session_id: session_id
                });
            }
        }

        const categories = ["cinematic", "cinematic_10x", "camera", "lenses", "director", "variety", "video"];
        const allRows: any[] = [];

        for (const cat of categories) {
            const { data, error } = await supabase.rpc("get_random_prompts", { p_limit: 2, p_category: cat });
            if (error) return json(500, { error: `RPC get_random_prompts failed for ${cat}`, details: error.message });
            allRows.push(...(data || []));
        }

        const grouped = groupByCategory(allRows);
        const videoPrompts = allRows.filter(r => r.category === 'video').map(r => r.content).join(" | ");

        // --- STAGE 2: THE SYSTEM ARCHITECT (PROMPT PACKET SELECTION) ---
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
        const vectorContext = vectorChosen || (vectors.length ? vectors.join(", ") : "WORK_VECTOR");

        // 1. SELECT IMAGE PACKET
        let imagePacket: any;
        const { data: imgPackets } = await supabase
            .from('image_prompt_packets')
            .select('*')
            .eq('vector', vectorContext)
            .limit(10);

        if (imgPackets && imgPackets.length > 0) {
            imagePacket = imgPackets[Math.floor(Math.random() * imgPackets.length)];
        } else {
            imagePacket = { id: null, json_payload: { subject: role, action: "standing", setting: scene?.setting, camera: "security", meta_tokens: [vectorContext] } };
        }
        const imagePromptJson = imagePacket.json_payload;

        // 2. SELECT VIDEO PACKET
        let videoPacket: any;
        const { data: vidPackets } = await supabase
            .from('video_prompt_packets')
            .select('*')
            .eq('vector', vectorContext)
            .limit(10);

        if (vidPackets && vidPackets.length > 0) {
            videoPacket = vidPackets[Math.floor(Math.random() * vidPackets.length)];
        } else {
            videoPacket = { id: null, json_payload: { motion_type: "slow", camera_move: "static", subject_action: "blink", duration: 5 } };
        }
        const videoPromptJson = videoPacket.json_payload;

        // Reconstruct Text Prompts for Fallbacks - CONDENSED FOR NOVITA
        const prompt_final = `${imagePromptJson.subject}, ${imagePromptJson.action} in ${imagePromptJson.setting}. ${imagePromptJson.camera || ''} ${sketch_type} for ${vectorContext}. ${premise.slice(0, 200)}.`.trim();
        const directive = `INSTITUTIONAL ${sketch_type} for ${vectorContext}`.trim();

        const geminiPrompt = `
            You are a System Architect for CE-LIT.
            Generate metadata for this artifact (JSON only):
            SITUATION: ${premise}
            ROLE: ${role}
            VECTOR: ${vectorContext}

            OUTPUT:
            - artifact_title
            - verdict_line (The final freeze frame text)
            - caption_pack (3 viral captions)
            - deleted_line
        `.trim();

        let generated: any = {
            artifact_title: "PROCEDURAL_ARTIFACT",
            verdict_line: "YOU ARE INCLUDED.",
            deleted_line: "Escalation is not recommended.",
            caption_pack: ["Verification required.", "Participation confirmed.", "No further action needed."],
            outtakes: [{ hook: "Refund denied." }, { hook: "Exit blocked." }]
        };

        try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: geminiPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });
            const geminiData = await geminiRes.json();
            if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
                const parsed = JSON.parse(geminiData.candidates[0].content.parts[0].text);
                generated = { ...generated, ...parsed };
            }
        } catch (e) {
            console.error("Gemini failed, using defaults:", e);
        }

        let record;
        const recordId = sketchId || crypto.randomUUID();
        const sketchData: any = {
            status: "generating",
            sketch_type,
            premise,
            role,

            // NEW JSON PIPELINE FIELDS
            image_prompt_json: imagePromptJson,
            video_prompt_json: videoPromptJson,
            selected_image_packet_id: imagePacket.id,
            selected_video_packet_id: videoPacket.id,

            prompt_fragments: { rows: allRows },
            script_json: generated,
            cinema_lane,
            provider_selected: (HIGGS_ENABLED && cinema_lane) ? "higgsfield" : "novita",
            content: {
                scene,
                fragments: allRows,
                screenshot_frame_text: generated.verdict_line,
                deleted_line: generated.deleted_line,
                caption_pack: generated.caption_pack,
                outtakes: generated.outtakes, // Note: minimal fallback if gemini fails
                artifact_title: generated.artifact_title
            }
        };
        if (userId && isUuid(userId)) sketchData.user_id = userId;

        if (sketchId) {
            // Optimistic ID handling: Upsert the record so it exists for polling immediately
            const { data, error } = await supabase.from("sketches")
                .upsert({ id: sketchId, ...sketchData })
                .select("*")
                .single();
            if (error) {
                if (error.code === '23503') return json(400, { error: "Invalid User ID - Session Mismatch", details: error });
                if (error.code === '23502') return json(400, { error: "Missing Required User ID", details: error });
                return json(500, { error: "Database sync failed", details: error });
            }
            record = data;
        } else {
            const { data, error } = await supabase.from("sketches").insert(sketchData).select("*").single();
            if (error) {
                if (error.code === '23503') return json(400, { error: "Invalid User ID - Session Mismatch", details: error });
                if (error.code === '23502') return json(400, { error: "Missing Required User ID", details: error });
                return json(500, { error: "Insert failed", details: error });
            }
            record = data;
        }


        console.log(`CelitJob Sync Trace: ID=${record.id} SketchType=${sketch_type} PremiseLen=${premise?.length}`);

        // Sync celit_jobs
        const { error: jobError } = await supabase.from("celit_jobs").upsert({
            id: record.id,
            status: "pending",
            sketch_type: sketch_type || "unknown_artifact", // Fallback to prevent NOT NULL error
            premise: premise || "No premise provided",
            role: role || "SUBJECT",
            provider: record.provider_selected || null,
            screenshot_frame_text: generated.verdict_line,
            image_prompt_json: imagePromptJson,
            video_prompt_json: videoPromptJson,
            selected_image_packet_id: imagePacket?.id || null,
            selected_video_packet_id: videoPacket?.id || null,
            created_at: new Date().toISOString()
        });

        if (jobError) {
            // ... existing error handling
            console.error(`CelitJob Upsert Failed for ${record.id}:`, jobError);
            // We log but don't throw, to allow response to return (but backend state is inconsistent)
        } else {
            console.log(`CelitJob Upsert Success for ${record.id}`);
        }

        const useHiggs = HIGGS_ENABLED && record.cinema_lane === true;

        if (useHiggs) {
            // --- STAGE 3: THE CINEMA LANE (HIGGSFIELD) ---
            const HIGGS_BASE_URL = "https://platform.higgsfield.ai/higgsfield-ai";

            try {
                // 1. STAGE 1: SOUL (IMAGE)
                const soulPrompt = `${imagePromptJson.subject}, ${imagePromptJson.action} in ${imagePromptJson.setting}. ${imagePromptJson.camera}. ${imagePromptJson.style || ""}.`;
                console.log("Stage 1: Calling Higgsfield Soul...", record.id);

                const soulRes = await fetch(`${HIGGS_BASE_URL}/soul/standard`, {
                    method: "POST",
                    headers: HIGGS_HEADERS(HIGGSFIELD_API_KEY_ID, HIGGSFIELD_API_KEY),
                    body: JSON.stringify({
                        prompt: soulPrompt,
                        aspect_ratio: "9:16",
                        resolution: "720p"
                    })
                });

                if (!soulRes.ok) {
                    const errorText = await soulRes.text();
                    throw new Error(`Soul API failed: ${errorText}`);
                }

                const soulData = await soulRes.json();
                const soulResult = await pollHiggsfield(soulData.status_url, HIGGSFIELD_API_KEY_ID, HIGGSFIELD_API_KEY);
                const imageResultUrl = soulResult.images?.[0]?.url;

                if (!imageResultUrl) throw new Error("Soul failed to return image URL");

                // Update intermediate result in both tables
                const imageResult = { url: imageResultUrl, task_id: soulData.status_url };
                await Promise.all([
                    supabase.from("sketches").update({ image_result: imageResult }).eq("id", record.id),
                    supabase.from("celit_jobs").update({ image_result: imageResult }).eq("id", record.id)
                ]);

                // 2. STAGE 2: DOP (VIDEO)
                const dopPrompt = `${videoPromptJson.motion_type} ${videoPromptJson.camera_move}. ${videoPromptJson.subject_action}.`;
                console.log("Stage 2: Calling Higgsfield Dop...", record.id);

                const dopRes = await fetch(`${HIGGS_BASE_URL}/dop/standard`, {
                    method: "POST",
                    headers: HIGGS_HEADERS(HIGGSFIELD_API_KEY_ID, HIGGSFIELD_API_KEY),
                    body: JSON.stringify({
                        image_url: imageResultUrl,
                        prompt: dopPrompt,
                        duration: 5
                    })
                });

                if (!dopRes.ok) {
                    const errorText = await dopRes.text();
                    throw new Error(`Dop API failed: ${errorText}`);
                }

                const dopData = await dopRes.json();

                await supabase.from("sketches").update({
                    status: "generating_video",
                    higgs_task_id: dopData.status_url,
                    provider_selected: "higgsfield"
                }).eq("id", record.id);

                await supabase.from("celit_jobs").update({
                    status: "animating",
                    external_id: dopData.status_url
                }).eq("id", record.id);

                // Trigger async poller to complete the video generation
                const pollerUrl = `${SUPABASE_URL}/functions/v1/higgsfield-poller`;
                console.log("Triggering poller at:", pollerUrl);
                fetch(pollerUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                    },
                    body: JSON.stringify({
                        job_id: record.id,
                        status_url: dopData.status_url
                    })
                }).catch(e => console.error("Failed to trigger poller:", e));

                return json(200, { ok: true, job_id: record.id, status_url: dopData.status_url });

            } catch (e: any) {
                console.error("Higgsfield Pipeline Error:", e);
                await Promise.all([
                    supabase.from("sketches").update({ status: "failed", error_message: e.message }).eq("id", record.id),
                    supabase.from("celit_jobs").update({ status: "failed" }).eq("id", record.id)
                ]);
                return json(500, { error: "Higgsfield failure", details: e.message });
            }
        } else {
            // --- BACKBONE (NOVITA) - JSON → Image → Video Pipeline ---
            const webhookUrl = `${PUBLIC_BASE_URL}/functions/v1/handle-novita-webhook?job_id=${record.id}`;

            // STEP 1: Text-to-Image using JSON prompt structure
            const imagePrompt = `${imagePromptJson.subject || role} ${imagePromptJson.action || 'standing'} in ${imagePromptJson.setting || 'modern environment'}. ${imagePromptJson.camera || 'cinematic shot'}. ${imagePromptJson.style || 'photorealistic'}`.trim().slice(0, 800);

            // Check if Test Mode is enabled (to avoid burning credits during dev)
            const NOVITA_TEST_MODE = Deno.env.get("NOVITA_TEST_MODE") === "true";

            const t2iPayload = {
                extra: {
                    response_image_type: "jpeg",
                    webhook: {
                        url: webhookUrl,
                        ...(NOVITA_TEST_MODE && {
                            test_mode: {
                                enabled: true,
                                return_task_status: "TASK_STATUS_SUCCEED"
                            }
                        })
                    }
                },
                request: {
                    model_name: "sd_xl_base_1.0.safetensors",
                    prompt: imagePrompt,
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

            if (NOVITA_TEST_MODE) {
                console.log("⚠️ NOVITA TEST MODE ENABLED - No credits will be consumed");
            }

            console.log("Submitting to Novita T2I (Step 1/2):", record.id);
            const res = await fetch("https://api.novita.ai/v3/async/txt2img", {
                method: "POST",
                headers: { Authorization: `Bearer ${NOVITA_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify(t2iPayload),
            });

            const txt = await res.text();
            if (!res.ok) {
                await supabase.from("sketches").update({ status: "failed", error_message: txt }).eq("id", record.id);
                await supabase.from("celit_jobs").update({ status: "failed", error_message: txt }).eq("id", record.id);
                return json(500, { error: "Novita T2I submit failed", details: txt });
            }

            const out = JSON.parse(txt);

            // Store video prompt for webhook to use in I2V step
            await supabase.from("sketches").update({
                status: "generating_image",  // Webhook will transition to generating_video
                external_id: out.task_id,
                provider_selected: "novita",
                video_prompt_json: videoPromptJson  // Store for I2V step
            }).eq("id", record.id);

            return json(200, { ok: true, job_id: record.id, task_id: out.task_id, step: "t2i", prompt: imagePrompt, celit_error: jobError });
        }
    } catch (e) {
        return json(500, { error: "Unexpected error", details: String((e as any)?.message ?? e) });
    }
});
