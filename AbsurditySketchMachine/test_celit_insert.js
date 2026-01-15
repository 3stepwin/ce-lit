
// using fetch

const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTEzOTYyNywiZXhwIjoyMDgwNzE1NjI3fQ.2QAUHfp7xhmAIMSX8jCbr7Vk99ijSinC3ENox2B5ASk';

// Define a minimal supabase client mock using fetch if needed, 
// BUT I will use fetch directly to simulate the issue
async function testInsert() {
    console.log("Testing celit_jobs insert...");

    // Create sketch first (constraint)
    const id = crypto.randomUUID();
    console.log("ID:", id);

    // 1. Insert Sketch
    const urlSketch = `${SUPABASE_URL}/rest/v1/sketches`;
    const resSketch = await fetch(urlSketch, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            id: id,
            user_id: crypto.randomUUID(),
            status: 'pending'
        })
    });

    if (!resSketch.ok) {
        console.error("Sketch insert failed:", await resSketch.text());
        return;
    }

    // 2. Insert Celit Job (mimicking generate-sketch)
    const urlCelit = `${SUPABASE_URL}/rest/v1/celit_jobs`;
    const payload = {
        id: id,
        status: "pending",
        screenshot_frame_text: "DEBUG TEXT",
        image_prompt_json: { subject: "test" },
        video_prompt_json: { motion: "test" },
        // selected_image_packet_id: null, // Test with null first
        // selected_video_packet_id: null,
        content: "DEBUG CONTENT",
        created_at: new Date().toISOString()
    };

    const resCelit = await fetch(urlCelit, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
    });

    if (!resCelit.ok) {
        console.error("Celit insert failed:", await resCelit.text());
    } else {
        console.log("Celit insert success:", await resCelit.json());
    }
}

testInsert();
