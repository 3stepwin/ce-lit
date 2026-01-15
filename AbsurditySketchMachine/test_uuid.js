
const https = require('https');

const url = 'https://ebostxmvyocypwqpgzct.supabase.co/rest/v1/rpc/get_id_type';
// I'll try to use a simple SELECT via REST instead since I don't know if get_id_type RPC exists
const selectUrl = 'https://ebostxmvyocypwqpgzct.supabase.co/rest/v1/?select=table_name&table_name=eq.sketches';
// Wait, REST API doesn't easily show data types of columns.

// I'll just try to upsert a valid UUID to confirm my theory.
const testUrl = 'https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/generate-sketch';
const validUuid = '123e4567-e89b-12d3-a456-426614174000';
const payload = JSON.stringify({
    userId: 'test_user_' + Date.now(),
    sketchId: validUuid,
    type: 'celit_viral',
    reality_vectors: ['WORK_VECTOR'],
    cinema_lane: true,
    role: 'MAIN_PERFORMER',
    premise: 'Testing UUID connectivity.'
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI'
    }
};

const req = https.request(testUrl, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});
req.write(payload);
req.end();
