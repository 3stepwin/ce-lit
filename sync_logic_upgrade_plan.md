# Sync Logic Upgrade Plan

## Goal

The goal of this project is to modify the sync logic in the `airtable-sync` folder to match the new Supabase database structure in the `cultengine-lit` project. This will ensure that when data is synced from the Airtable to the Supabase database, it is transformed to match the new, more sophisticated structure we've designed.

## New Supabase Database Structure

The new Supabase database structure includes the following components:

*   **Tables:**
    *   `prompt_portal_cinematic`: Stores cinematic prompts.
    *   `prompt_generators_pg_variety`: Stores a variety of different prompt generators.
    *   `image_prompt_templates`: Stores templates for image prompts.
    *   `image_prompt_packets`: Stores packets of information for generating image prompts.
    *   `video_prompt_packets`: Stores packets of information for generating video prompts.
*   **Views:**
    *   `prompt_library`: A unified view that combines prompts from `prompt_portal_cinematic`, `prompt_generators_pg_variety`, and several other tables.
*   **Functions:**
    *   `get_random_prompts(p_limit, p_category)`: A PostgreSQL function that returns a random selection of prompts from the `prompt_library` view.
    *   `generate-idea`: A Supabase Edge Function that automatically generates new ideas for sketches and scenes.
    *   `build-prompt-package`: A Supabase Edge Function that constructs a complete prompt package from an idea.
    *   `generate-sketch`: A Supabase Edge Function that generates a "viral trailer."
    *   `generate-cult-scene`: A Supabase Edge Function that generates a documentary-style scene.

## Plan

Our plan is to:

1.  **Analyze the existing sync logic.** We will read the existing sync script to understand how it works.
2.  **Map the Airtable data to the new Supabase structure.** We will create a mapping between the Airtable fields and the fields in the new Supabase tables.
3.  **Modify the sync logic to transform the data.** We will modify the sync logic to transform the data from the Airtable into the new Supabase structure.
4.  **Test the new sync logic.** We will test the new sync logic to make sure that it's working correctly.

## Necessary Information

To complete this task, I will need the following information:

1.  **The content of the main sync script.** Please provide the content of the main script that is responsible for syncing the data from the Airtable to the Supabase database.
2.  **A sample of the data from the Airtable.** Please provide a sample of the data from the Airtable, either as a CSV export, a JSON export, or a screenshot.

Once I have this information, I will be able to proceed with modifying the sync logic.
