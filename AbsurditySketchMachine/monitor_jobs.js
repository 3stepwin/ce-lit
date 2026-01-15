
const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function monitor() {
    try {
        console.log("📡 HIGGSFIELD JOBS MONITOR\n");
        const res = await fetch(`${SUPABASE_URL}/rest/v1/celit_jobs?select=*&order=created_at.desc&limit=10`, {
            headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
        });
        const data = await res.json();

        if (!data || data.length === 0) {
            console.log('No jobs found.');
            return;
        }

        console.log(`Found ${data.length} recent jobs:\n`);
        data.forEach((job, i) => {
            console.log(`${i + 1}. Job: ${job.id.substring(0, 8)}...`);
            console.log(`   Status: ${job.status}`);
            console.log(`   External ID: ${job.external_id ? job.external_id.substring(0, 50) + '...' : 'N/A'}`);
            console.log(`   Video URL: ${job.result_video_url ? '✅ Ready' : '⏳ Pending'}`);
            console.log(`   Created: ${new Date(job.created_at).toLocaleString()}`);
            if (job.error_message) console.log(`   ❌ Error: ${job.error_message}`);
            console.log('');
        });

        const pending = data.find(j => j.status === 'pending' || j.status === 'animating');
        if (pending) {
            console.log('🔄 Latest pending job:', pending.id);
            if (pending.external_id) {
                console.log('   Higgsfield Status URL:', pending.external_id);
            }
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}
monitor();
