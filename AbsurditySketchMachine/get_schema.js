// Get actual schema from Supabase
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

async function getSchema() {
    console.log('📋 FETCHING ACTUAL SCHEMA FROM SUPABASE\n');
    console.log('=' + '='.repeat(70) + '\n');

    // Query the information schema
    const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `
    });

    if (error) {
        console.error('Error fetching schema:', error);
        console.log('\nTrying alternative method...\n');

        // Try getting just table names
        const { data: tables } = await supabase.rpc('exec_sql', {
            sql_query: `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
        });

        console.log('📊 TABLES IN DATABASE:\n');
        if (tables) {
            for (const t of tables) {
                console.log(`  - ${t.tablename}`);
            }
        }

        // Get functions
        const { data: functions } = await supabase.rpc('exec_sql', {
            sql_query: `
        SELECT routine_name, routine_type
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
        ORDER BY routine_name;
      `
        });

        console.log('\n\n🔧 FUNCTIONS IN DATABASE:\n');
        if (functions) {
            for (const f of functions) {
                console.log(`  - ${f.routine_name}`);
            }
        }

        return;
    }

    // Group by table
    const tableMap = new Map();
    for (const col of data) {
        if (!tableMap.has(col.table_name)) {
            tableMap.set(col.table_name, []);
        }
        tableMap.get(col.table_name).push({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            default: col.column_default
        });
    }

    console.log('📊 COMPLETE DATABASE SCHEMA\n');

    for (const [tableName, columns] of tableMap) {
        console.log(`\n## ${tableName}`);
        console.log('=' + '='.repeat(50));
        for (const col of columns) {
            const nullable = col.nullable ? 'NULL' : 'NOT NULL';
            const def = col.default ? ` DEFAULT ${col.default}` : '';
            console.log(`  ${col.name.padEnd(30)} ${col.type.padEnd(20)} ${nullable}${def}`);
        }
    }
}

getSchema().catch(console.error);
