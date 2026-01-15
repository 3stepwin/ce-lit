
const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function fetchLatestRun() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/celit_jobs?select=id,status,selected_image_packet_id,selected_video_packet_id,image_prompt_json,video_prompt_json&limit=1&order=created_at.desc`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Accept': 'application/json'
            }
        });

        const jobs = await response.json();

        if (!jobs || jobs.length === 0) {
            console.log("No jobs found.");
            return;
        }

        const job = jobs[0];
        console.log("--- LATEST RUN PROOF ---");
        console.log("Job ID:", job.id);
        console.log("Status:", job.status);
        console.log("Selected Image Packet ID:", job.selected_image_packet_id);
        console.log("Selected Video Packet ID:", job.selected_video_packet_id);

        if (job.selected_image_packet_id) {
            const imgRes = await fetch(`${SUPABASE_URL}/rest/v1/image_prompt_packets?id=eq.${job.selected_image_packet_id}`, {
                headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
            });
            const imgPackets = await imgRes.json();
            if (imgPackets && imgPackets.length > 0) {
                console.log("\n--- MATCHING IMAGE PACKET ---");
                console.log("Packet ID:", imgPackets[0].id);
                console.log("Vector:", imgPackets[0].vector);
                console.log("JSON Match:", JSON.stringify(job.image_prompt_json) === JSON.stringify(imgPackets[0].json_payload) ? "✅ PERFECT MATCH" : "❌ MISMATCH");
            } else {
                console.log("\n❌ Image packet row not found (ID exists in job but not in table??)");
            }
        } else {
            console.log("\n⚠️ No Image Packet ID (Fallback Used)");
        }

        if (job.selected_video_packet_id) {
            const vidRes = await fetch(`${SUPABASE_URL}/rest/v1/video_prompt_packets?id=eq.${job.selected_video_packet_id}`, {
                headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
            });
            const vidPackets = await vidRes.json();
            if (vidPackets && vidPackets.length > 0) {
                console.log("\n--- MATCHING VIDEO PACKET ---");
                console.log("Packet ID:", vidPackets[0].id);
                console.log("Motion:", vidPackets[0].motion_profile);
                console.log("JSON Match:", JSON.stringify(job.video_prompt_json) === JSON.stringify(vidPackets[0].json_payload) ? "✅ PERFECT MATCH" : "❌ MISMATCH");
            } else {
                console.log("\n❌ Video packet row not found.");
            }
        } else {
            console.log("\n⚠️ No Video Packet ID (Fallback Used)");
        }

    } catch (error) {
        console.error("Error fetching run proof:", error);
    }
}

fetchLatestRun();
