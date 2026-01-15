const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function monitor() {
    console.log('📡 Monitoring Higgsfield Jobs (cinema_lane=true)...\n');

    const { data, error } = await supabase
        .from('celit_jobs')
        .select('*')
        .eq('cinema_lane', true)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No Higgsfield jobs found.');
        return;
    }

    console.log(`Found ${data.length} Higgsfield jobs:\n`);

    data.forEach((job, i) => {
        console.log(`${i + 1}. Job ID: ${job.id}`);
        console.log(`   Status: ${job.status}`);
        console.log(`   External ID: ${job.external_id || 'N/A'}`);
        console.log(`   Video URL: ${job.result_video_url ? '✅ Ready' : '❌ Pending'}`);
        console.log(`   Created: ${new Date(job.created_at).toLocaleString()}`);
        console.log(`   Error: ${job.error_message || 'None'}`);
        console.log('');
    });

    // Check latest pending job
    const pending = data.find(j => j.status === 'pending' || j.status === 'animating');
    if (pending) {
        console.log('🔄 Latest pending job:', pending.id);
        console.log('   You can manually check Higgsfield status at:');
        console.log('   https://higgsfield.ai/dashboard');
    }
}

monitor().catch(console.error);
