# 🔍 Supabase Usage Audit Report

**Generated:** 2026-01-15  
**Project:** Absurdity AI Sketch Machine

---

## Executive Summary

This audit identifies **which Supabase resources are actively being used** vs. **what exists but may be unused or deprecated**.

### Key Findings

✅ **Active Resources:** 8 tables, 14 edge functions, 4 RPC functions  
⚠️ **Empty/Unused Tables:** 6 tables with null/0 rows  
🔍 **Code-DB Mismatch:** References to tables that may not exist in current schema

---

## 📊 Database Tables Status

### ✅ ACTIVELY USED (Have Data + Code References)

| Table | Rows | Used In Code | Status |
|-------|------|--------------|--------|
| **sketches** | 92 | ✅ Frontend + 4 functions | **PRIMARY - Critical** |
| **celit_jobs** | 35 | ✅ Frontend + 3 functions | **PRIMARY - Critical** |
| **prompt_library** | 787 | ✅ 1 function | **ACTIVE - Well populated** |
| **scripts** | 4 | ✅ 2 functions | **ACTIVE - Cult Engine** |
| **shots** | 21 | ✅ 3 functions | **ACTIVE - Cult Engine** |

**Verdict:** These 5 tables are your **production workhorses** 🚀

---

### ⚠️ EMPTY BUT DEFINED (Exist but have 0 rows)

| Table | Rows | Referenced By | Purpose |
|-------|------|---------------|---------|
| **viral_seed_bank** | null | ❌ Not in code | Legacy seed storage? |
| **scene_templates** | null | ❌ Not in code | Legacy scene data? |
| **seed_usage** | null | ❌ Not in code | Seed tracking? |
| **character_vessels** | null | ❌ Not in code | Character portraits? |
| **user_vessels** | null | ❌ Not in code | User avatars? |
| **image_packets** | null | ❌ Not in code | Prompt packets? |
| **video_packets** | null | ❌ Not in code | Prompt packets? |

**Verdict:** These tables are **DEFINED but NOT USED** 🤔

---

### 🔍 CODE-REFERENCED BUT MAY NOT EXIST

These tables are **referenced in your code** but may not exist in the current schema:

| Table | Used In |
|-------|---------|
| **celit_premises** | `get-seed` function |
| **celit_scene_bank** | `get-seed` function |
| **celit_seed_runs** | `get-seed` function |
| **image_prompt_packets** | `generate-sketch` function |
| **video_prompt_packets** | `generate-sketch` function |
| **profiles** | `lib/supabase.ts` (auth) |
| **user_avatars** | Frontend + `generate-sketch` |
| **sketch_videos** | `lib/supabase.ts` |
| **vessels** | `upload-vessel` function |

**Verdict:** These need investigation - likely **schema migration mismatch** ⚠️

---

## ⚡ Edge Functions Analysis

### 🔑 Production Functions (Use API Keys/Secrets)

| Function | Size | Purpose | Status |
|----------|------|---------|--------|
| **generate-sketch** | 28.3 KB | Main video generation orchestrator | ✅ **CRITICAL** |
| **handle-novita-webhook** | 14.0 KB | Novita webhook processor | ✅ **ACTIVE** |
| **generate-cult-scene** | 7.8 KB | Cult Engine scene generator | ✅ **ACTIVE** |
| **process-cult-assets** | 5.9 KB | Cult asset processor | ✅ **ACTIVE** |
| **handle-cult-webhook** | 5.2 KB | Cult webhook handler | ✅ **ACTIVE** |
| **create-face-model** | 4.9 KB | Face model creation | ⚠️ **Verify usage** |
| **get-seed** | 4.7 KB | Seed retrieval | ⚠️ **Check table refs** |
| **higgsfield-poller** | 4.5 KB | Higgsfield job polling | ✅ **ACTIVE** |
| **exec-sql** | 4.0 KB | Emergency SQL execution | ⚠️ **Admin tool** |
| **upload-vessel** | 3.3 KB | Vessel upload handler | ⚠️ **Check usage** |
| **generate-cult-audio** | 3.1 KB | Audio generation | ✅ **ACTIVE** |
| **novita-webhook** | 2.6 KB | Novita webhook (alt?) | ⚠️ **Duplicate?** |

### 📦 Simple Functions (No secrets)

| Function | Size | Purpose | Status |
|----------|------|---------|--------|
| **generate-scene** | 2.3 KB | Scene generation | ⚠️ **Verify vs generate-cult-scene** |
| **process-assets** | 1.6 KB | Asset processor | ⚠️ **Verify vs process-cult-assets** |

**Verdict:** You have **2 potential duplicate functions** that need investigation 🤔

---

## 🔧 RPC Functions (Stored Procedures)

| Function | Called By | Purpose |
|----------|-----------|---------|
| **get_random_seed** | `generate-sketch` | Pull random seed from viral_seed_bank |
| **get_random_prompts** | `generate-sketch` | Pull image/video prompts |
| **mark_seed_used** | `generate-sketch` | Mark seed as used |
| **apply_sql** | `exec-sql` function | Execute raw SQL (admin) |

**Verdict:** These RPC functions are **actively called** ✅

---

## 💾 Storage Buckets

**Found:** 0 buckets

**Verdict:** You're **NOT using Supabase Storage** 🤔  
- Are you storing images/videos elsewhere?
- Using external URLs only?
- Could optimize costs by using Supabase Storage?

---

## 🚨 Issues & Recommendations

### Critical Issues

1. **❌ Schema-Code Mismatch**
   - Functions reference tables that may not exist (`celit_premises`, `celit_scene_bank`, etc.)
   - This could cause runtime errors
   - **Action:** Run a migration audit to align schema

2. **❌ Empty Tables Taking Space**
   - 7 tables exist but have no data
   - Either populate them or remove them
   - **Action:** Decide on keep vs. delete

3. **❌ Potential Duplicate Functions**
   - `novita-webhook` vs `handle-novita-webhook`
   - `generate-scene` vs `generate-cult-scene`
   - `process-assets` vs `process-cult-assets`
   - **Action:** Consolidate or rename for clarity

### Optimization Opportunities

4. **🔍 No Storage Buckets**
   - You're likely using external URLs for all media
   - Could save API costs by using Supabase Storage
   - **Action:** Consider migrating to storage buckets

5. **🔍 Unused Vessel System**
   - `character_vessels`, `user_vessels`, `vessels` tables empty
   - `upload-vessel` function exists but may not be used
   - **Action:** Either activate or remove

6. **🔍 Seed Bank System Incomplete**
   - `viral_seed_bank` is empty (should have seeds)
   - `seed_usage` is empty (should track usage)
   - But `get_random_seed` tries to query them
   - **Action:** Populate or refactor to use different tables

---

## ✅ What's Working Well

1. **Core Pipeline:** `sketches` + `celit_jobs` are well-populated and actively used
2. **Prompt System:** 787 prompts in `prompt_library` is healthy
3. **Cult Engine:** `scripts` and `shots` are operational
4. **Main Function:** `generate-sketch` is the clear orchestrator

---

## 📋 Recommended Actions

### Immediate (This Week)

- [ ] **Fix `get-seed` function** - Update table references or populate seed_bank
- [ ] **Populate or remove** `viral_seed_bank`, `scene_templates`, `seed_usage`
- [ ] **Consolidate webhook handlers** - One Novita webhook, not two
- [ ] **Create storage buckets** - For sketches, vessels, and cult assets

### Short-term (This Sprint)

- [ ] **Schema alignment audit** - Ensure all code-referenced tables exist
- [ ] **Activate vessel system** - Or remove if not planned
- [ ] **Document table purposes** - Create schema documentation
- [ ] **Add storage for generated media** - Reduce external dependencies

### Long-term (Next Month)

- [ ] **Archive unused tables** - Move deprecated tables to archive schema
- [ ] **Optimize RPC functions** - Add indexes for faster queries
- [ ] **Set up table triggers** - Auto-populate timestamps, validate data
- [ ] **Add table-level observability** - Track usage patterns

---

## 🎯 Bottom Line

**Is everything being used?** 

**NO** - You have:
- ✅ **5 core tables** that are crushing it
- ⚠️ **7 tables** that are empty/unused
- 🔍 **9 tables** referenced in code but may not exist
- 🔧 **2-3 duplicate functions** to consolidate

**Recommendation:** Clean up the schema to match reality. You have a **working core** (sketches, celit_jobs, prompts) but need to either **complete or remove** the incomplete systems (vessels, seed_bank).

---

**Next Steps:**
1. Review this report
2. Decide: Keep or Delete for each empty table
3. Run migration to align schema with code
4. Update functions to use correct table names
5. Re-run audit to confirm 100% alignment

---

*Audit generated by `audit_supabase_usage.js`*
