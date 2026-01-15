const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSketches() {
    const url = `${SUPABASE_URL}/rest/v1/sketches?select=id,status,celit_error,created_at&order=created_at.desc&limit=10`;

    const response = await fetch(url, {
        headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

checkSketches().catch(console.error);
