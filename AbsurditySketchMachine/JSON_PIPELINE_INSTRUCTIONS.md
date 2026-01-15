# JSON PIPELINE MIGRATION INSTRUCTIONS

The agent has generated a SQL migration to support the new JSON-first asset pipeline (Image JSON + Video JSON).

## File Location
`supabase/migrations/20260114_json_pipeline.sql`

## How to Apply
1. Open your **Supabase Dashboard** > **SQL Editor**.
2. Copy the content of `supabase/migrations/20260114_json_pipeline.sql`.
3. Run the SQL.

## What This Does
1. **Adds JSON Columns**: `image_prompt_json`, `video_prompt_json`, `image_result` to `sketches` and `celit_jobs`.
2. **Creates Template Table**: `image_prompt_templates` to store your MetricsMule JSON structures.
