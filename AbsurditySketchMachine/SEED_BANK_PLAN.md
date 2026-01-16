# 🏗️ Seed Bank Expansion Plan

**Date:** 2026-01-15  
**Project:** Absurdity AI Sketch Machine

---

## 📋 Overview

We are building a robust, multi-tier Seed Bank system that provides the "creative spark" for all video generations. This system ensures high-quality, absurd, and professional results without requiring manual user input for every field.

---

## 📊 Database Architecture

We are maintaining two parallel systems as requested:

### 1. 🟢 Active Production Bank (celit_*)
Directly used by the current `generate-sketch` and `get-seed` functions.
- `celit_premises`: Primary source of story ideas.
- `celit_scene_bank`: Primary source of visual/audio setting data.
- `celit_seed_runs`: Tracking for anti-repeat.

### 2. 🏛️ Reference & Expansion Bank (viral_*)
Reserved for reference, archival, and large-scale library expansion.
- `viral_seed_bank`: Large-scale library of curated seeds.
- `scene_templates`: Unified templates for visual consistency.
- `seed_usage`: Global usage analytics.

---

## 🚀 Phase 1: Immediate Population

We will populate the reference tables with the first batch of "Master Seeds" to provide a baseline for the system.

### Category Focus:
- **WORK_VECTOR:** Institutional dread, corporate satire, bureaucracy.
- **LIFE_VECTOR:** Post-consumerism, liminal spaces, existential calm.
- **FEED_VECTOR:** Algorithm worship, viral absurdity, social media noise.

---

## 🛠️ Implementation Steps

### Step 1: Align Schema
Ensure `viral_seed_bank` and `scene_templates` match the requirements of the latest RPC functions.

### Step 2: Bulk Import
Import the following into `viral_seed_bank`:
- Snl-style corporate sketches.
- Severance-style office horror.
- Deadpool-style meta-commentary.

### Step 3: Scene Standardization
Define 20+ "Master Scenes" in `scene_templates` covering:
- Sterile office (fluorescent).
- Abandoned mall (liminal).
- High-stakes news room (broadcast).
- Medical triage (diagnostic).

---

## ✅ Success Metrics

1. **Diversity:** At least 50+ unique premises per vector.
2. **Quality:** 100% adherence to the "Absurdity" tone (Deadpan clinical credibility).
3. **Robustness:** zero duplicate seeds served to the same user in 24 hours.

---

**Next Step:** Execute the "Seed Bank Migration" SQL script to populate the reference tables.
