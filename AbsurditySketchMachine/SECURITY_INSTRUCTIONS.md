# SECURITY HARDENING INSTRUCTIONS

The agent has generated a comprehensive SQL migration file to secure your database tables with Row Level Security (RLS) and fix function search paths.

## File Location
`supabase/migrations/20260114_security_hardening.sql`

## How to Apply

### Option A: Via Supabase CLI (If working)
Run the following command in your terminal:
```bash
npx supabase db push --project-ref ebostxmvyocypwqpgzct
```

### Option B: Manual Dashboard Update (Recommended if CLI fails)
1. Open your Supabase Dashboard project `ebostxmvyocypwqpgzct`.
2. Go to the **SQL Editor**.
3. Copy the entire content of `supabase/migrations/20260114_security_hardening.sql`.
4. Paste it into the SQL Editor and click **RUN**.

## What This Does
1. **Locks High Risk Tables**: `social_connections` and token tables are now restricted.
2. **Secures User Tables**: `users`, `agent_logs`, etc. now only allow access to the data owner.
3. **Optimizes Job Tables**: `celit_jobs` is securely configured for the demo polling.
4. **Hardens Functions**: Sets fixed `search_path` to prevent privilege escalation attacks.
