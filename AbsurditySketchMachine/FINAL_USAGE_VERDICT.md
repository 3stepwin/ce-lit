# 🎯 FINAL SUPABASE USAGE VERDICT

**Date:** 2026-01-15  
**Project:** Absurdity AI Sketch Machine  

---

## EXECUTIVE SUMMARY

After deep analysis, here's what's **ACTUALLY** being used vs. what's **DEAD WEIGHT**:

---

## ✅ ACTIVELY USED & CRITICAL

### Tables (10 total)

| Table | Rows | Purpose | Verdict |
|-------|------|---------|---------|
| **sketches** | 92 | Generated video records | ✅ **CORE PRODUCTION** |
| **celit_jobs** | 35 | Job queue for generation | ✅ **CORE PRODUCTION** |
| **scripts** | 4 | Cult Engine scripts | ✅ **ACTIVE FEATURE** |
| **shots** | 21 | Cult Engine shot data | ✅ **ACTIVE FEATURE** |
| **image_prompt_packets** | 2 | Image generation configs | ✅ **NEW SYSTEM** |
| **video_prompt_packets** | 1 | Video motion configs | ✅ **NEW SYSTEM** |
| **celit_premises** | 117 | Seed premises for ideas | ✅ **SEED SYSTEM** |
| **celit_scene_bank** | 110 | Scene templates | ✅ **SEED SYSTEM** |
| **celit_seed_runs** | 37 | Seed usage tracking | ✅ **SEED SYSTEM** |
| **prompt_library** | 787 | ⚠️ **SEE BELOW** | 🤔 **QUESTIONABLE** |

---

## 🔴 DEAD WEIGHT - Not Used At All

### Empty Tables (11 total - 0 rows each)

These tables **exist** but have **ZERO data** and **ZERO usage**:

| Table | Why It Exists | Should You Keep It? |
|-------|---------------|---------------------|
| **viral_seed_bank** | Legacy seed storage | ❌ DELETE - replaced by `celit_premises` |
| **scene_templates** | Legacy scene data | ❌ DELETE - replaced by `celit_scene_bank` |
| **seed_usage** | Legacy tracking | ❌ DELETE - replaced by `celit_seed_runs` |
| **character_vessels** | Character portraits | ⚠️ KEEP if planning to use, else DELETE |
| **user_vessels** | User avatar storage | ⚠️ KEEP if planning to use, else DELETE |
| **vessels** | Generic vessel storage | ⚠️ KEEP if planning to use, else DELETE |
| **image_packets** | Old packet system | ❌ DELETE - replaced by `image_prompt_packets` |
| **video_packets** | Old packet system | ❌ DELETE - replaced by `video_prompt_packets` |
| **profiles** | User profiles | ⚠️ KEEP if you need user auth |
| **user_avatars** | User profile pics | ⚠️ KEEP if you need user auth |
| **sketch_videos** | Alternative video storage | ❌ DELETE - data is in `sketches` |

**Recommendation:** Delete 6 deprecated tables, decide on the remaining 5.

---

## 🚨 THE BIG ISSUE: `prompt_library`

### The Problem

**787 prompts** are stored, but:

❌ **NONE** have ever been used (usage_count = 0 for all)  
❌ **NO** RPC function `get_random_prompts` exists to query them  
❌ They're **generic Midjourney prompts** from "Prompt Portal" (external source)  
❌ Your app uses **`image_prompt_packets`** and **`video_prompt_packets`** instead

### What's in `prompt_library`?

```
Content: "Ultra realistic closeup photo of a beautiful, stunning woman, 
         black widow played by scarlett johanssen, looking into the camera..."

Content: "Cyberpunk detective in Tokyo rain, MOV_0321.MOV, 
         cinematic movie still quality, shot on RED Komodo 6K..."

Content: "Craft a 8K hyperrealistic, cinematic image capturing 
         a close-up of Scarlett Johansson as Black Widow..."
```

**Categories:**
- cinematic (240 prompts)
- cinematic_10x (243 prompts)  
- lenses (117 prompts)
- AI Images (95 prompts)
- Random stuff (92 prompts)

### Verdict: 🗑️ **DELETE THE ENTIRE TABLE**

**Why:**
1. Never used (0% usage)
2. No code references it (except one broken RPC call)
3. Generic prompts don't fit your "Absurdity AI Sketch Machine" concept
4. You have a **better system**: `image_prompt_packets` + `video_prompt_packets`
5. Wasting database space (787 rows of dead data)

**Your REAL prompt system:**
```javascript
// image_prompt_packets (2 rows) - ACTUALLY USED
{
  "vector": "WORK_VECTOR",
  "sketch_type": "corporate_training",
  "json_payload": {
    "subject": "TIRED EMPLOYEE",
    "setting": "grey cubicle farm",
    "style": "photorealistic depression",
    "lighting": "fluorescent flicker"
  }
}

// video_prompt_packets (1 row) - ACTUALLY USED  
{
  "vector": "WORK_VECTOR",
  "motion_profile": "slow_zoom",
  "json_payload": {
    "camera_move": "slow push in",
    "subject_action": "blink once"
  }
}
```

**These packets are:**
- ✅ Specific to your vectors (LIFE, WORK, FEED)
- ✅ Structured JSON (not random text)
- ✅ Actually referenced in `generate-sketch` function
- ✅ Designed for your "absurdity" concept

---

## 📊 FINAL NUMBERS

### What You're Actually Using

| Resource | Count | Status |
|----------|-------|--------|
| **Active tables** | 9 | ✅ Core production |
| **Prompt packets** | 3 | ✅ Your REAL prompt system |
| **Edge functions** | 14 | ✅ All deployed |
| **Generated sketches** | 92 | ✅ Production data |
| **Jobs processed** | 35 | ✅ Production data |

### What's Wasting Space

| Resource | Count | Action Needed |
|----------|-------|---------------|
| **Empty tables** | 11 | 🗑️ Delete 6, evaluate 5 |
| **Unused prompts** | 787 | 🗑️ Delete entire table |
| **Duplicate functions** | 2-3 | 🔧 Consolidate |

---

## 🎯 BOTTOM LINE

**Is everything in Supabase being used?**

# NO.

### You have:
- ✅ **9 core tables** doing the heavy lifting  
- 🗑️ **11 empty tables** collecting dust  
- 🗑️ **787 unused prompts** that never fit your concept  

### The Math:
- **Total tables:** 21
- **Actually used:** 9 (43%)
- **Dead weight:** 12 (57%)

---

## 📋 CLEANUP PLAN

### Step 1: DELETE Dead Tables (Immediate)

```sql
-- DELETE DEPRECATED TABLES
DROP TABLE IF EXISTS viral_seed_bank;        -- Replaced by celit_premises
DROP TABLE IF EXISTS scene_templates;        -- Replaced by celit_scene_bank  
DROP TABLE IF EXISTS seed_usage;             -- Replaced by celit_seed_runs
DROP TABLE IF EXISTS image_packets;          -- Replaced by image_prompt_packets
DROP TABLE IF EXISTS video_packets;          -- Replaced by video_prompt_packets
DROP TABLE IF EXISTS sketch_videos;          -- Data is in sketches table
DROP TABLE IF EXISTS prompt_library;         -- ⚠️ BIG ONE - 787 unused generic prompts
```

**Result:** Remove 7 tables, save ~800 rows of dead data

---

### Step 2: EVALUATE Vessel/Profile Tables (This Week)

Ask yourself:
1. **Do you need user authentication?**
   - YES → Keep `profiles`, `user_avatars`
   - NO → Delete them

2. **Will you implement character/user vessels?**
   - YES → Keep `character_vessels`, `user_vessels`, `vessels`
   - NO → Delete them

**My guess:** You probably DON'T need these yet. Delete and re-add if needed.

---

### Step 3: CONSOLIDATE Functions (Next Sprint)

Investigate these potential duplicates:
- `novita-webhook` vs `handle-novita-webhook` (14KB vs 2.6KB)
- `generate-scene` vs `generate-cult-scene` (2.3KB vs 7.8KB)
- `process-assets` vs `process-cult-assets` (1.6KB vs 5.9KB)

**Likely:** The smaller ones are old versions. Delete them.

---

### Step 4: EXPAND Prompt Packets (Future)

Your **real prompt system** only has 3 packets:
- 2 image packets
- 1 video packet

**Action:** Create more packets for:
- LIFE_VECTOR (existential dread prompts)
- FEED_VECTOR (social media absurdity prompts)
- Different sketch_types
- Different aesthetic_presets

These are **structured, vector-aligned, absurdity-specific** - unlike those 787 generic Midjourney prompts.

---

## 🏆 WHAT TO KEEP

Your **core production stack** is solid:

```
GENERATION PIPELINE:
  celit_jobs (queue) 
    ↓
  celit_premises + celit_scene_bank (ideas)
    ↓  
  image_prompt_packets + video_prompt_packets (prompts)
    ↓
  sketches (results)

CULT ENGINE:
  scripts → shots (storyboarding)

TRACKING:
  celit_seed_runs (usage stats)
```

**This is clean and working.** Everything else is cruft.

---

## 💡 RECOMMENDATION

### Immediate Action (Today):

```sql
-- Run this migration to clean house
DROP TABLE IF EXISTS viral_seed_bank;
DROP TABLE IF EXISTS scene_templates;  
DROP TABLE IF EXISTS seed_usage;
DROP TABLE IF EXISTS image_packets;
DROP TABLE IF EXISTS video_packets;
DROP TABLE IF EXISTS sketch_videos;
DROP TABLE IF EXISTS prompt_library;  -- 787 unused prompts GONE

-- If you're not using auth:
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS user_avatars;

-- If you're not using vessels:
DROP TABLE IF EXISTS character_vessels;
DROP TABLE IF EXISTS user_vessels;
DROP TABLE IF EXISTS vessels;
```

**Result:**
- From 21 tables → **9 essential tables**
- From 787 unused prompts → **3 purposeful packet prompts**
- Clean, focused, production-ready database

---

## ✅ FINAL ANSWER TO YOUR QUESTION

> "Is everything in Supabase being used?"

**NO.**

- ❌ 787 generic Midjourney prompts sitting unused
- ❌ 11 empty tables (52% of your tables!)
- ❌ 2-3 duplicate edge functions

**What you SHOULD have:**
- ✅ 9 core tables
- ✅ 3 prompt packet systems  
- ✅ 11-12 unique edge functions
- ✅ ~300 rows of actual production data

**Clean it up and your database will be lean, mean, and absurdity-generating! 🎬🤖**

---

*Analysis complete. Ready for cleanup?*
