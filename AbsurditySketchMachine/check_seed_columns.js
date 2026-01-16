import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('Checking columns for seed bank tables...');

    const tables = ['celit_premises', 'viral_seed_bank', 'celit_scene_bank', 'scene_templates'];

    for (const table of tables) {
        try {
            // Trying to get one row to see columns
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`Error on ${table}:`, error.message);
                continue;
            }

            if (data && data.length > 0) {
                console.log(`\nTable: ${table}`);
                console.log('Columns:', Object.keys(data[0]));
            } else {
                console.log(`\nTable: ${table} (Empty)`);
                // Try to get columns from information_schema if possible
                // But since we saw previously that exec_sql is restricted, 
                // we might just have to try an insert and see if it fails?
                // No, let's look at the migrations again.
            }
        } catch (e) {
            console.log(`Exception on ${table}:`, e.message);
        }
    }
}

checkSchema();
