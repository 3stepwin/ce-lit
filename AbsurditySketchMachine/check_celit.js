
const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function checkCelitJobs() {
    try {
        console.log("Checking 'celit_jobs' and 'image_prompt_packets'...");

        const resJobs = await fetch(`${SUPABASE_URL}/rest/v1/celit_jobs?limit=1`, {
            headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
        });
        console.log("celit_jobs status:", resJobs.status);

        const resPackets = await fetch(`${SUPABASE_URL}/rest/v1/image_prompt_packets?limit=1`, {
            headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
        });
        console.log("image_prompt_packets status:", resPackets.status);

        if (resPackets.status === 200) {
            const data = await resPackets.json();
            console.log("Sample Packet:", data);
        }

    } catch (e) {
        console.error(e);
    }
}
checkCelitJobs();
