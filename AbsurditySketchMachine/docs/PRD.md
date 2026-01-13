# PRD: Absurdity AI Sketch Machine v3.0

## 1. Executive Summary
The Absurdity AI Sketch Machine (v3.0) is a "Cult Engine" mobile application that democratizes viral content creation. By combining "Institutional Absurdity" with rigid "Retention Density" formulas, it allows users to generate high-production-value, meme-ready video sketches in under 60 seconds. Unlike generic AI video tools, it focuses on specific, polarizing aesthetic presets (e.g., "Analog Rot", "Corporate Dystopia") that drive engagement through confusion and delight.

## 2. Problem Statement
**Target User:** "The Shitposter" and "The Brand Cultist".
**Pain Point:** Creating high-retention, uniquely styled short-form video requires mastery of editing software (Premiere/CapCut), deep meme literacy, and hours of work per post.
**Solution:** A "one-tap" generator that handles scripting, visual generation, audio design, and editing, wrapping it all in a "compliant" bureaucratic interface.

## 3. Solution Overview
**Product Name:** Absurdity AI Sketch Machine
**Core Capability:** Generates the "Viral Trinity" (Video, Static Artifact, Outtakes) from a single prompt or "Vibe Check".

### Key Features (MVP)
1.  **The Ritual (Generation):** Single-tap generation using "Aesthetic Presets" (e.g., VHS, Y2K, Cyber).
2.  **Retention Density Engine:** AI automatically inserts pattern interrupts every 2-3 seconds.
3.  **Viral Trinity Output:** Delivers a main sketch, a "Proof Artifact" (meme card), and 2-3 "Outtakes" for low-effort posting.
4.  **Cult Management:** Users can define their "Cult" (Brand Voice) which persists across generations.
5.  **Share-or-Die:** UI designed to make sharing the path of least resistance.

## 4. User Personas

### Persona 1: Seth the Shitposter
-   **Role:** Gen Z Content Creator (TikTok/Reels).
-   **Pain:** Needs 3-5 posts/day to grow. Burnout is high.
-   **Value:** Uses Absurdity to generate filler content that looks high-effort.
-   **Quote:** "I just need something weird to keep the algorithm fed."

### Persona 2: Brand Manager Brenda (The Cult Leader)
-   **Role:** Marketing Manager for an edgy D2C brand.
-   **Pain:** Corporate assets are too boring. Needs to sound "native" to the internet.
-   **Value:** Uses "Corporate Dystopia" preset to make ironic ads.

## 5. Functional Requirements
-   **Auth:** Supabase Auth (Email, Apple, Google).
-   **Input:** Text Prompt, Image Upload (Face Swap), or Random "Vibe".
-   **Processing:** Background job handling (Edge Functions) with push notification on completion.
-   **Editor:** "Glitch Editor" - simple timeline tweaks (swap clip, regenerate caption).
-   **Export:** Direct share to TikTok/Instagram API (or save to device).

## 6. Non-Functional Requirements
-   **Performance:** App launch < 2s. Generation start < 500ms.
-   **Reliability:** 99% success rate on video generation (handling timeout retries).
-   **Security:** RLS on all user data.

## 7. Success Metrics
-   **Viral Coefficient:** > 1.1 (Users referring users).
-   **Retention:** 40% D30 retention.
-   **Generation Volume:** Avg 5 generations per DAU.
