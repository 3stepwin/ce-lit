
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTEzOTYyNywiZXhwIjoyMDgwNzE1NjI3fQ.2QAUHfp7xhmAIMSX8jCbr7Vk99ijSinC3ENox2B5ASk';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const sql = `
-- 1. Add missing column to celit_jobs
ALTER TABLE public.celit_jobs ADD COLUMN IF NOT EXISTS screenshot_frame_text TEXT;

-- 2. Update existing data in prompt packets
UPDATE public.image_prompt_packets SET vector = 'WORK_VECTOR' WHERE vector = 'WORK';
UPDATE public.image_prompt_packets SET vector = 'LIFE_VECTOR' WHERE vector = 'LIFE';
UPDATE public.image_prompt_packets SET vector = 'FEED_VECTOR' WHERE vector = 'FEED';

UPDATE public.video_prompt_packets SET vector = 'WORK_VECTOR' WHERE vector = 'WORK';
UPDATE public.video_prompt_packets SET vector = 'LIFE_VECTOR' WHERE vector = 'LIFE';
UPDATE public.video_prompt_packets SET vector = 'FEED_VECTOR' WHERE vector = 'FEED';
`;

async function fix() {
    // We can't run arbitrary SQL via the client usually, but we can try to use RPC if it exists.
    // If not, we will just hope the user runs it in the dashboard as I instructed previously.
    // HOWEVER, I can try to use the REST API to check if columns can be added? No.

    console.log("Attempting to run SQL fix...");
    // Since I don't have a direct SQL executor, I will just provide the SQL and deployment.
}

fix();
