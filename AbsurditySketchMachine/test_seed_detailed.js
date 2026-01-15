// Test get-seed with error logging
require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const url = `${SUPABASE_URL}/functions/v1/get-seed`;
const urlObj = new URL(url);

const payload = JSON.stringify({
    category: 'WORK_VECTOR',
    session_id: '123e4567-e89b-12d3-a456-426614174000'
});

console.log('🧪 Testing get-seed...\n');
console.log('Payload:', payload, '\n');

const options = {
    method: 'POST',
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.write(payload);
req.end();
