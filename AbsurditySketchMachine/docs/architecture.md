# Architecture: Absurdity AI Sketch Machine v3.0

## 1. Technology Stack Selection

### Frontend - Mobile
-   **Framework:** React Native + Expo SDK 52
-   **Language:** TypeScript (Strict)
-   **UI Library:** NativeWind (Tailwind CSS) + Reanimated 3
-   **State:** Zustand + TanStack Query v5
-   **Navigation:** Expo Router v4
-   **Storage:** MMKV

### Backend
-   **Platform:** Supabase (PostgreSQL)
-   **Auth:** Supabase Auth
-   **Compute:** Supabase Edge Functions (Deno)
-   **Storage:** Supabase Storage (Assets, Videos)

### AI Services
-   **Orchestrator:** Gemini 1.5 Pro / Flash (via Edge Functions)
-   **Video:** Novita AI / Higgsfield (External APIs)
-   **Image:** Midjourney / DALL-E 3 (via API proxy)

## 2. Database Schema (Supabase)

```sql
-- Users (Extends Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  cult_name text, -- The user's "Brand"
  credits int default 10,
  created_at timestamptz default now()
);

-- Cults (Teams/Projects)
create table public.cults (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id),
  name text not null,
  manifesto text, -- Brand guidelines
  aesthetic_preset text default 'corporate_dystopia'
);

-- Sketches (The Core Entity)
create table public.sketches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  cult_id uuid references public.cults(id),
  prompt text,
  status text check (status in ('pending', 'processing', 'completed', 'failed')),
  
  -- The Viral Trinity Data
  video_url text,
  artifact_url text, -- The static meme 
  outtakes jsonb, -- Array of extra clip URLs
  
  metadata jsonb, -- Script, retention plan, timestamps
  created_at timestamptz default now()
);

-- Assets (Raw generated files)
create table public.assets (
  id uuid default gen_random_uuid() primary key,
  sketch_id uuid references public.sketches(id),
  type text check (type in ('video', 'image', 'audio')),
  storage_path text,
  provider_id text
);
```

## 3. API Architecture (Edge Functions)

### `generate-sketch`
-   **Input:** `{ prompt, preset, face_image }`
-   **Process:** 
    1.  Create `sketch` record (pending).
    2.  Call LLM to generate Script + Visual Plan.
    3.  Dispatch jobs to Video/Image generators.
    4.  Update `sketch` with `metadata`.

### `process-assets` (Webhook)
-   **Triggered by:** Video Gen Provider completion.
-   **Process:**
    1.  Download video.
    2.  Stitch Audio/Video (FFmpeg in Edge or separate worker).
    3.  Upload final to Supabase Storage.
    4.  Update `sketch` status to `completed`.

## 4. Security & Scaling
-   **RLS:** Enabled on all tables. Users can only see their own Sketches.
-   **Edge Caching:** CDN for all video assets.
-   **Queueing:** pg_mq (if needed) or simple status polling for generation jobs.
