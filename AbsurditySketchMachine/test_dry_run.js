const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testDryRun() {
    console.log('🧪 TESTING DRY RUN MODE...');

    const sketchId = crypto.randomUUID();
    const payload = {
        sketchId: sketchId,
        type: 'celit_viral',
        reality_vectors: ['FEED_VECTOR'],
        dry_run: true,
        dry_run_mode: 'success'
    };

    console.log('1. Submitting Dry Run request...');
    const functionUrl = `${process.env.SUPABASE_URL}/functions/v1/generate-sketch`;

    // In local node environment, we need to call the edge function via fetch
    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Submission failed:', error);
        return;
    }

    const data = await response.json();
    console.log('Submission success:', data);

    const jobId = data.job_id;
    console.log(`2. Polling celit_jobs for ID: ${jobId}...`);

    for (let i = 0; i < 10; i++) {
        const { data: job, error } = await client.from('celit_jobs').select('*').eq('id', jobId).single();
        if (error) {
            console.error('Poll error:', error);
        } else {
            console.log(`[Attempt ${i + 1}] Status: ${job.status} | Video: ${job.result_video_url || 'N/A'}`);
            if (job.status === 'succeed') {
                console.log('✅ DRY RUN VERIFIED: Job reached succeed status.');
                console.log('Verdict:', job.screenshot_frame_text);
                return;
            }
        }
        await new Promise(r => setTimeout(r, 500));
    }

    console.error('❌ DRY RUN TIMED OUT: Job did not reach succeed status.');
}

testDryRun();
