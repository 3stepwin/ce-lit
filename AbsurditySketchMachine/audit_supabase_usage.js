// Supabase Usage Audit Script
// Checks which tables, functions, and resources are actually being used

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 SUPABASE USAGE AUDIT\n');
console.log('=' + '='.repeat(70));

// 1. Check all tables in the database
async function auditTables() {
    console.log('\n📊 DATABASE TABLES AUDIT\n');

    const { data: tables, error } = await supabase
        .rpc('exec_sql', {
            sql_query: `
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
        });

    if (error) {
        // Fallback: try to query known tables
        const knownTables = [
            'sketches', 'celit_jobs', 'viral_seed_bank', 'scene_templates',
            'prompt_library', 'seed_usage', 'scripts', 'shots',
            'character_vessels', 'user_vessels', 'image_packets', 'video_packets'
        ];

        console.log('⚠️  Cannot query schema, checking known tables...\n');

        for (const table of knownTables) {
            try {
                const { count, error: countError } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });

                if (!countError) {
                    console.log(`✅ ${table.padEnd(25)} - ${count} rows`);
                }
            } catch (e) {
                console.log(`❌ ${table.padEnd(25)} - Does not exist or no access`);
            }
        }
    } else {
        for (const table of tables) {
            try {
                const { count } = await supabase
                    .from(table.table_name)
                    .select('*', { count: 'exact', head: true });

                console.log(`${table.table_name.padEnd(25)} - ${count} rows, ${table.column_count} columns`);
            } catch (e) {
                console.log(`${table.table_name.padEnd(25)} - Error querying`);
            }
        }
    }
}

// 2. Scan codebase for table usage
async function scanCodebaseForTables() {
    console.log('\n\n📁 CODEBASE TABLE USAGE\n');

    const tables = new Map();
    const searchDirs = ['app', 'lib', 'components', 'supabase/functions'];

    function scanDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
                scanDirectory(fullPath);
            } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js'))) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf-8');

                    // Look for .from('table_name') or .from("table_name")
                    const fromMatches = content.matchAll(/\.from\(['"]([a-z_]+)['"]\)/g);
                    for (const match of fromMatches) {
                        const tableName = match[1];
                        if (!tables.has(tableName)) {
                            tables.set(tableName, []);
                        }
                        tables.get(tableName).push(fullPath.replace(__dirname, '.'));
                    }

                    // Look for rpc('function_name')
                    const rpcMatches = content.matchAll(/\.rpc\(['"]([a-z_]+)['"]/g);
                    for (const match of rpcMatches) {
                        const funcName = match[1];
                        const key = `RPC: ${funcName}`;
                        if (!tables.has(key)) {
                            tables.set(key, []);
                        }
                        tables.get(key).push(fullPath.replace(__dirname, '.'));
                    }
                } catch (e) {
                    // Skip files that can't be read
                }
            }
        }
    }

    for (const dir of searchDirs) {
        scanDirectory(path.join(__dirname, dir));
    }

    // Sort and display
    const sorted = Array.from(tables.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    for (const [resource, files] of sorted) {
        console.log(`\n${resource}`);
        const uniqueFiles = [...new Set(files)];
        uniqueFiles.forEach(f => console.log(`  - ${f}`));
    }
}

// 3. Check Edge Functions
async function auditEdgeFunctions() {
    console.log('\n\n⚡ EDGE FUNCTIONS AUDIT\n');

    const functionsDir = path.join(__dirname, 'supabase', 'functions');

    if (!fs.existsSync(functionsDir)) {
        console.log('❌ No functions directory found');
        return;
    }

    const functions = fs.readdirSync(functionsDir, { withFileTypes: true })
        .filter(f => f.isDirectory())
        .map(f => f.name);

    console.log(`Found ${functions.length} edge functions:\n`);

    for (const func of functions) {
        const indexPath = path.join(functionsDir, func, 'index.ts');
        let size = 0;
        let hasEnvVars = false;

        if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf-8');
            size = content.length;
            hasEnvVars = content.includes('Deno.env.get');
        }

        const envVarIndicator = hasEnvVars ? '🔑' : '  ';
        console.log(`${envVarIndicator} ${func.padEnd(30)} - ${(size / 1024).toFixed(1)} KB`);
    }
}

// 4. Check Storage Buckets
async function auditStorage() {
    console.log('\n\n💾 STORAGE BUCKETS AUDIT\n');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.log('❌ Cannot access storage:', error.message);
        return;
    }

    console.log(`Found ${buckets.length} storage buckets:\n`);

    for (const bucket of buckets) {
        const { data: files } = await supabase.storage.from(bucket.name).list('', { limit: 1000 });
        const fileCount = files ? files.length : 0;

        console.log(`${bucket.name.padEnd(25)} - ${fileCount} files, ${bucket.public ? 'PUBLIC' : 'PRIVATE'}`);
    }
}

// Run all audits
async function runAudit() {
    await auditTables();
    await scanCodebaseForTables();
    await auditEdgeFunctions();
    await auditStorage();

    console.log('\n' + '='.repeat(72));
    console.log('✅ Audit complete!\n');
}

runAudit().catch(console.error);
