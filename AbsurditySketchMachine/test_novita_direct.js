// Direct test of Novita API to verify the correct payload format
const https = require('https');
require('dotenv').config();

const NOVITA_API_KEY = process.env.NOVITA_API_KEY;

const payload = JSON.stringify({
    extra: {
        response_image_type: "jpeg",
        webhook: {
            url: "https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-novita-webhook",
            test_mode: {
                enabled: true,
                return_task_status: "TASK_STATUS_SUCCEED"
            }
        }
    },
    request: {
        prompt: "A professional corporate training scene, photorealistic",
        model_name: "sd_xl_base_1.0.safetensors",
        negative_prompt: "blurry, low quality, distorted",
        width: 720,
        height: 1280,
        image_num: 1,
        steps: 20,
        seed: -1,
        clip_skip: 1,
        sampler_name: "Euler a",
        guidance_scale: 7.5
    }
});

console.log("⚠️ TEST MODE ENABLED - No credits will be consumed");
console.log("Testing Novita API directly...");
console.log("Payload:", payload);

const options = {
    hostname: 'api.novita.ai',
    path: '/v3/async/txt2img',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${NOVITA_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('\nStatus:', res.statusCode);
        console.log('Response:', data);

        if (res.statusCode === 200) {
            console.log('\n✅ SUCCESS! Novita API is working correctly.');
            const result = JSON.parse(data);
            console.log('Task ID:', result.task_id);
        } else {
            console.log('\n❌ ERROR: Novita API returned an error.');
        }
    });
});

req.on('error', (err) => {
    console.error('Request Error:', err.message);
});

req.write(payload);
req.end();
