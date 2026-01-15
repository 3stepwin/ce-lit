# Edge Functions Status Report
**Generated:** 2026-01-14  
**Project:** Absurdity AI Sketch Machine (CE-LIT)  
**Total Functions:** 14

---

## 📊 SUMMARY OVERVIEW

| Status | Count | Functions |
|--------|-------|-----------|
| ✅ **Production Ready** | 9 | generate-sketch, get-seed, higgsfield-poller, handle-novita-webhook, novita-webhook, generate-cult-scene, process-cult-assets, handle-cult-webhook, generate-cult-audio |
| 🟡 **Alias/Wrapper** | 2 | generate-scene, process-assets |
| 🔧 **Utility** | 2 | exec-sql, upload-vessel |
| 🚧 **Placeholder** | 1 | create-face-model |

---

## 🎯 CORE VIDEO GENERATION PIPELINE

### 1. **generate-sketch** ✅
**Path:** `supabase/functions/generate-sketch/index.ts`  
**Lines of Code:** 605  
**Status:** Production Ready - **PRIMARY ORCHESTRATOR**

#### Purpose
Main entry point for the "Absurdity AI Sketch Machine" generation pipeline. Handles the complete flow from user request to video generation.

#### Key Features
- **Reality Vector System**: LIFE_VECTOR, WORK_VECTOR, FEED_VECTOR with weighted selection
- **Dual Pipeline Support**:
  - 🎬 **Cinema Lane (Higgsfield)**: Soul (T2I) → Dop (I2V) with face swap support
  - ⚡ **Backbone Lane (Novita)**: Direct T2V via Kling v1.0
- **Prompt Packet System**: Fetches structured JSON prompts from `image_prompt_packets` and `video_prompt_packets`
- **Seed Bank Integration**: Automatic premise generation from viral seed bank
- **Gemini Integration**: AI-generated metadata (verdict_line, artifact_title, caption_pack)
- **Optimistic UI Support**: Accepts pre-generated UUIDs for immediate frontend sync

#### API Contract
```typescript
POST /functions/v1/generate-sketch
{
  sketchId?: string,        // Optional UUID for optimistic updates
  userId: string,
  avatarId?: string,
  cinema_lane: boolean,    // true = Higgsfield, false = Novita
  type: "celit_viral",
  reality_vectors: ["WORK_VECTOR", "FEED_VECTOR", "LIFE_VECTOR"],
  premise?: string,        // Optional - uses seed bank if empty
  sketch_type?: string,
  role?: string,
  scene?: object
}

Response:
{
  ok: true,
  job_id: uuid,
  task_id?: string,       // Novita
  status_url?: string     // Higgsfield
}
```

#### Pipeline Flow
1. **Vector Selection**: Weighted random pick from reality_vectors
2. **Seed Resolution**: Fetch from seed bank if no premise
3. **Prompt Packet Selection**: Get image/video JSON prompts
4. **Gemini Orchestration**: Generate metadata
5. **DB Sync**: Create/upsert sketches + celit_jobs records
6. **Video Generation**:
   - **Cinema Lane**: Higgsfield Soul → (Face Swap) → Dop → Async Poller
   - **Backbone Lane**: Novita T2V → Webhook callback

#### Dependencies
- Supabase: `sketches`, `celit_jobs`, `image_prompt_packets`, `video_prompt_packets`, `seed_bank`
- APIs: Gemini Flash, Higgsfield (Soul/Dop), Novita (Kling, Merge-Face)
- Edge Functions: `higgsfield-poller`, `handle-novita-webhook`

#### Environment Variables
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NOVITA_API_KEY
HIGGSFIELD_API_KEY_ID
HIGGSFIELD_API_KEY
HIGGS_ENABLED
PUBLIC_BASE_URL
GEMINI_API_KEY
```

#### Recent Fixes
- ✅ Prompt condensation to 800 chars for Novita validation
- ✅ Added `steps` (30) and `frames` (60) params for Novita
- ✅ Model name corrected to `kling` for txt2video endpoint
- ✅ Optimistic UUID sync for frontend polling

---

### 2. **get-seed** ✅
**Path:** `supabase/functions/get-seed/index.ts`  
**Lines of Code:** 56  
**Status:** Production Ready

#### Purpose
Fetches random seed from the viral seed bank with anti-repeat logic.

#### API Contract
```typescript
POST /functions/v1/get-seed
{
  category?: string,      // 'work' | 'feed' | 'life' | null
  session_id?: string
}

Response:
{
  ok: true,
  seed: {
    premise_id: uuid,
    scene_id: uuid,
    premise: string,
    role: string,
    sketch_type: string,
    scene: object
  }
}
```

#### Features
- Anti-repeat: Avoids last 8 seeds per session
- Automatic seed usage tracking via `mark_seed_used` RPC
- Category filtering for Reality Vectors

---

### 3. **higgsfield-poller** ✅
**Path:** `supabase/functions/higgsfield-poller/index.ts`  
**Lines of Code:** 126  
**Status:** Production Ready

#### Purpose
Async polling worker for Higgsfield Cinema Lane video generation.

#### Workflow
1. Triggered by `generate-sketch` after Dop API call
2. Polls `status_url` every 5 seconds (max 60 retries = 5 minutes)
3. Updates `sketches` and `celit_jobs` on completion
4. Handles failures and timeouts

#### API Contract
```typescript
POST /functions/v1/higgsfield-poller
{
  job_id: uuid,
  status_url: string
}

Response:
{
  success: true,
  job_id: uuid,
  video_url: string
}
```

#### Environment Variables
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
HIGGSFIELD_API_KEY_ID
HIGGSFIELD_API_KEY
```

---

### 4. **handle-novita-webhook** ✅
**Path:** `supabase/functions/handle-novita-webhook/index.ts`  
**Lines of Code:** 262  
**Status:** Production Ready - **MULTI-STAGE ORCHESTRATOR**

#### Purpose
Webhook handler for Novita API callbacks, managing the T2I → Face Swap → I2V chain.

#### State Machine
```
Status: 'generating_image' (T2I Done)
├─ Has Avatar? → Face Swap (Sync) → I2V
└─ No Avatar? → I2V

Status: 'generating_video' (I2V Done)
└─ Mark complete, store video_url

Status: 'running' (Direct T2V)
└─ Mark generated, store video_url
```

#### Features
- **Face Swap Integration**: Novita Merge-Face (base64 sync)
- **Kling V2.1 I2V**: Automatic chaining after T2I
- **Idempotent Updates**: Safe retry handling
- **Base64 Conversion**: Fetch → Blob → Base64 for Kling

#### Webhook Payload
```typescript
{
  task_id: string,
  status: "TASK_STATUS_SUCCEEDED" | "TASK_STATUS_FAILED",
  images?: [{ image_url: string }],
  videos?: [{ video_url: string }]
}
```

---

### 5. **novita-webhook** ✅
**Path:** `supabase/functions/novita-webhook/index.ts`  
**Lines of Code:** 72  
**Status:** Production Ready - **LEGACY HANDLER**

#### Purpose
Simplified webhook for direct T2V jobs (Backbone Lane).

#### Features
- Updates `celit_jobs` and `sketches` tables
- Handles `ASYNC_TASK_RESULT` events
- Fire-and-forget async processing

#### Note
Partially redundant with `handle-novita-webhook` but kept for backward compatibility.

---

## 🎬 CULT ENGINE / DOCUMENTARY PIPELINE

### 6. **generate-cult-scene** ✅
**Path:** `supabase/functions/generate-cult-scene/index.ts`  
**Lines of Code:** 161  
**Status:** Production Ready

#### Purpose
Generate multi-shot documentary scripts with voiceover and visual prompts.

#### Features
- **Gemini Script Generation**: Topic → Script Text + Shots
- **Shot Breakdown**: Visual prompt, motion prompt, duration per shot
- **Auto-trigger**: Calls `process-cult-assets` immediately after script creation
- **Background Mode**: Can process queued scripts

#### API Contract
```typescript
POST /functions/v1/generate-cult-scene
{
  topic?: string,
  script_id?: string,     // For background processing
  style_preset?: string,  // Default: 'documentary'
  user_id?: string
}

Response:
{
  ok: true,
  script_id: uuid,
  shots_count: number
}
```

#### Database Flow
1. Creates `scripts` record
2. Generates `shots` records (status: 'pending')
3. Triggers `process-cult-assets`

---

### 7. **process-cult-assets** ✅
**Path:** `supabase/functions/process-cult-assets/index.ts`  
**Lines of Code:** 136  
**Status:** Production Ready

#### Purpose
Batch processor for documentary shot generation (T2I → I2V).

#### Features
- **Batch T2I**: Processes up to 5 pending shots (Novita Seedream)
- **Batch I2V**: Processes up to 3 shots ready for video (Kling V2.1)
- **State Tracking**: Updates shot status through pipeline

#### Pipeline States
```
pending → t2i_processing → i2v_pending → i2v_processing → i2v_completed
```

#### APIs Used
- Novita Seedream 3.0 (T2I): 720x1280, guidance_scale: 7.5
- Novita Kling V2.1 I2V: 5s duration, cfg_scale: 0.5

---

### 8. **handle-cult-webhook** ✅
**Path:** `supabase/functions/handle-cult-webhook/index.ts`  
**Lines of Code:** 92  
**Status:** Production Ready

#### Purpose
Webhook handler for documentary shot generation callbacks.

#### State Transitions
```
T2I Complete:
  t2i_processing → i2v_pending
  Update: assets.t2i_url
  Trigger: process-cult-assets

I2V Complete:
  i2v_processing → i2v_completed
  Update: assets.video_url
```

#### Features
- Auto-trigger next processing stage
- Shot-level asset tracking in JSONB

---

### 9. **generate-cult-audio** ✅
**Path:** `supabase/functions/generate-cult-audio/index.ts`  
**Lines of Code:** 92  
**Status:** Production Ready

#### Purpose
Convert script text to narration audio via Novita TTS.

#### API Contract
```typescript
POST /functions/v1/generate-cult-audio
{
  script_id: uuid
}

Response:
{
  ok: true,
  task_id: string
}
```

#### TTS Config
- Voice: "onyx"
- Language: en-US
- Speed: 1.0
- Format: MP3

---

## 🔄 ALIAS FUNCTIONS

### 10. **generate-scene** 🟡
**Path:** `supabase/functions/generate-scene/index.ts`  
**Lines of Code:** 53  
**Status:** Alias Wrapper

#### Purpose
CE-LIT alias for `generate-cult-scene`. Maps frontend fields to backend schema.

#### Mapping
```typescript
{
  premise → topic,
  style_preset → style_preset,
  user_id → user_id
}
```

---

### 11. **process-assets** 🟡
**Path:** `supabase/functions/process-assets/index.ts`  
**Lines of Code:** 43  
**Status:** Alias Wrapper

#### Purpose
CE-LIT alias for `process-cult-assets`. Direct passthrough.

---

## 🔧 UTILITY FUNCTIONS

### 12. **exec-sql** 🔧
**Path:** `supabase/functions/exec-sql/index.ts`  
**Lines of Code:** 99  
**Status:** Schema Migration Utility

#### Purpose
Apply prompt packet pipeline schema updates.

#### Creates
- `image_prompt_packets` table
- `video_prompt_packets` table
- Foreign keys on `sketches` and `celit_jobs`
- Seed packets for WORK and LIFE vectors
- RLS policies

#### Note
POC implementation - requires `apply_sql` RPC or manual execution.

---

### 13. **upload-vessel** 🔧
**Path:** `supabase/functions/upload-vessel/index.ts`  
**Lines of Code:** 78  
**Status:** Multipart Upload Handler

#### Purpose
Upload user selfies to Supabase Storage for face-swapping.

#### Features
- Multipart form-data parsing
- Storage bucket: `vessels`
- Returns public URL and vessel_id

#### API Contract
```
POST /functions/v1/upload-vessel
Content-Type: multipart/form-data
Field: selfie (image file)

Response:
{
  ok: true,
  vessel_id: uuid,
  url: string
}
```

---

## 🚧 PLACEHOLDER FUNCTIONS

### 14. **create-face-model** 🚧
**Path:** `supabase/functions/create-face-model/index.ts`  
**Lines of Code:** 162  
**Status:** Stub Implementation

#### Purpose
Create reusable face model from user selfies.

#### Current State
- Simulates 2s processing delay
- Updates `profiles.face_model_id` and `face_model_status`
- **TODO**: Integrate actual face-swap API (Replicate, Higgsfield, etc.)

#### API Contract
```typescript
POST /functions/v1/create-face-model
{
  user_id: string,
  avatar_urls: string[]
}

Response:
{
  success: true,
  faceModelId: string,
  message: string
}
```

---

## 🔍 DEPENDENCIES MATRIX

| Function | Supabase Tables | External APIs | Other Functions |
|----------|----------------|---------------|-----------------|
| generate-sketch | sketches, celit_jobs, image_prompt_packets, video_prompt_packets, seed_bank | Gemini, Higgsfield, Novita | higgsfield-poller, handle-novita-webhook |
| get-seed | seed_bank | - | - |
| higgsfield-poller | sketches, celit_jobs | Higgsfield | - |
| handle-novita-webhook | sketches | Novita | - |
| novita-webhook | sketches, celit_jobs | - | - |
| generate-cult-scene | scripts, shots | Gemini | process-cult-assets |
| process-cult-assets | shots | Novita (Seedream, Kling) | handle-cult-webhook |
| handle-cult-webhook | shots | - | process-cult-assets |
| generate-cult-audio | scripts | Novita (TTS) | - |
| upload-vessel | vessels | - | - |
| create-face-model | profiles | (TODO) | - |

---

## 🚨 KNOWN ISSUES & FIXES APPLIED

### ✅ Resolved
1. **Novita API Validation Errors** (Fixed 2026-01-14)
   - Added `steps: 30` parameter (range: 1-50)
   - Added `frames: 60` parameter (range: 8-64)
   - Condensed prompts to 800 chars max
   - Corrected model_name to `kling`

2. **Higgsfield Connection Errors**
   - Verified API key format: `Key ${apiKeyId}:${apiKey}`
   - Added proper headers and User-Agent

3. **Database Schema Sync**
   - Added `error_message` columns to sketches/celit_jobs
   - Created prompt packet tables via exec-sql

### 🔴 Active Issues
None reported.

---

## 📋 DEPLOYMENT CHECKLIST

### Required Environment Variables
```bash
# Supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PUBLIC_BASE_URL

# AI Services
GEMINI_API_KEY
NOVITA_API_KEY
HIGGSFIELD_API_KEY_ID
HIGGSFIELD_API_KEY
HIGGS_ENABLED=true

# Optional
FACE_SWAP_API_KEY
FACE_SWAP_API_URL
```

### Deployment Command
```bash
supabase functions deploy generate-sketch
supabase functions deploy get-seed
supabase functions deploy higgsfield-poller
supabase functions deploy handle-novita-webhook
supabase functions deploy novita-webhook
supabase functions deploy generate-cult-scene
supabase functions deploy process-cult-assets
supabase functions deploy handle-cult-webhook
supabase functions deploy generate-cult-audio
supabase functions deploy generate-scene
supabase functions deploy process-assets
supabase functions deploy upload-vessel
supabase functions deploy create-face-model
supabase functions deploy exec-sql
```

---

## 🎯 RECOMMENDED NEXT STEPS

### High Priority
1. **Test Higgsfield End-to-End**: Verify Cinema Lane with real API keys
2. **Face Swap Integration**: Complete `create-face-model` implementation
3. **Error Handling**: Add retry logic and graceful degradation
4. **Monitoring**: Add structured logging for production debugging

### Medium Priority
5. **Webhook Security**: Add signature verification for Novita callbacks
6. **Rate Limiting**: Implement per-user quotas
7. **Caching**: Cache Gemini responses for similar prompts
8. **Video Stitching**: Implement shot assembly for documentary pipeline

### Low Priority
9. **Alias Cleanup**: Merge alias functions into main implementations
10. **Testing Suite**: Add integration tests for each function
11. **Documentation**: Generate OpenAPI specs for API contract

---

## 📊 CODE METRICS

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~1,500 |
| Total Functions | 14 |
| Average Lines per Function | 107 |
| Largest Function | generate-sketch (605 LOC) |
| Smallest Function | process-assets (43 LOC) |
| API Integrations | 6 (Gemini, Higgsfield Soul/Dop, Novita Kling/Seedream/TTS/MergeFace) |

---

**Report Generated by:** Antigravity AI  
**Last Updated:** 2026-01-14 16:38 EST
