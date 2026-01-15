const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function testNovitaFix() {
    console.log('🔧 Testing Novita Prompt Length Fix...\n');

    const payload = {
        type: 'celit_viral',
        reality_vectors: ['WORK_VECTOR'],
        cinema_lane: false // Force Novita path
    };

    console.log('📡 Calling generate-sketch Edge Function...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-sketch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
                'apikey': ANON_KEY
            },
            body: JSON.stringify(payload)
        });

        const responseText = await res.text();
        console.log('\n📥 Response Status:', res.status);
        console.log('📥 Response Headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            console.error('❌ ERROR: Edge Function returned non-2xx status');
            console.error('Status:', res.status);
            console.error('Body:', responseText);
            return;
        }

        const data = JSON.parse(responseText);
        console.log('\n✅ SUCCESS! Edge Function Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.prompt) {
            console.log('\n📏 Prompt Length:', data.prompt.length, 'characters');
            console.log('📏 Prompt Preview:', data.prompt.slice(0, 200) + '...');

            if (data.prompt.length > 1024) {
                console.error('❌ PROMPT TOO LONG! Novita will reject this.');
            } else {
                console.log('✅ Prompt length is safe (<= 1024 chars)');
            }
        }

        // Check the job in celit_jobs
        console.log('\n🔍 Checking celit_jobs table for job:', data.job_id);
        const jobRes = await fetch(
            `${SUPABASE_URL}/rest/v1/celit_jobs?id=eq.${data.job_id}&select=*`,
            {
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`
                }
            }
        );

        const jobs = await jobRes.json();
        if (jobs && jobs.length > 0) {
            console.log('✅ Job Record Created:');
            console.log('  - Status:', jobs[0].status);
            console.log('  - External ID:', jobs[0].external_id);
            console.log('  - Provider:', jobs[0].provider_selected || 'novita (default)');
        }

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        console.error(error.stack);
    }
}

testNovitaFix();
