# HOW CE LIT GENERATES VIDEOS (END-TO-END)

## One‑sentence version (say this first):

> **CE LIT assembles cinematic instructions from a structured prompt library, generates a grounded base film using a video model, then applies controlled disruption and artifact extraction to produce a shareable official‑feeling clip.**

---

## STEP 1 — CE LIT DOES NOT “WRITE A PROMPT”

This is the key distinction.

CE LIT **does not free‑text prompt** a video model like everyone else.

Instead, it **assembles a generation directive** from:

- your stored cinematic fragments (Supabase)
- institutional language patterns
- camera and lighting grammar
- a single user premise

Think of it like **procedural filmmaking**, not prompting.

---

## STEP 2 — PROMPT ASSEMBLY (FROM SUPABASE)

When the user clicks **Proceed**, CE LIT:

1. Calls your existing RPC (`get_random_prompts`).
2. Pulls fragments from multiple tables:
   * cinematic tone
   * camera behavior
   * director references
   * institutional / compliance language
   * dark / editorial / surreal phrasing

No single table dominates. The **collision** creates the tone.

These fragments are stitched into **one authoritative instruction**, not a long chatty prompt.

> This is why outputs don’t feel repetitive or “AI flavored.”

---

## STEP 3 — REALITY‑FIRST VIDEO GENERATION

That directive is sent to the video model (Novita now, Higgs as dual/fallback).

**Critical rule:**

> The model is instructed to generate a **normal, believable world first**.

So the video:

- has real camera motion
- realistic lighting
- neutral acting
- professional pacing

For the first ~5–7 seconds, it looks like a **legitimate trailer, ad, or broadcast**.

This is deliberate — trust must be established.

---

## STEP 4 — CONTROLLED MEANING BREAK (NOT VISUAL CHAOS)

CE LIT then introduces **one violation** — and only one.

Not visual nonsense. Not surreal movement.

The break happens through:

- language
- subtitles
- policy statements
- institutional implications

Example:

> “Enrollment is automatic.”
> “Opt‑out was available prior to viewing.”
> “This has already been processed.”

The world stays stable. Only the **logic** breaks.

That’s why it hits harder.

---

## STEP 5 — HARD CUT ENDING (NO RESOLUTION)

The video ends:

- abruptly
- mid‑thought or immediately after the implication
- no outro
- no explanation

This forces:

- replays
- confusion
- discussion
- sharing

---

## STEP 6 — ARTIFACT EXTRACTION (THE SHARE ENGINE)

After generation, CE LIT:

1. Identifies the most “official” moment:
   * a line
   * a frame
   * a status change
2. Freezes or formats it into an **artifact**:
   * notice
   * receipt
   * confirmation
   * approval
3. Presents it separately from the video

This artifact:

- feels undeniable
- screenshots cleanly
- spreads faster than the video itself

This is **intentional**.

---

## STEP 7 — OPTIONAL LIKENESS LAYER

If the user uploaded an image:

- Face swap is applied **after** the base video exists
- Motion and lighting are preserved
- No distortion, no exaggeration

This keeps realism intact and avoids uncanny valley.

---

## WHAT MAKES THIS DIFFERENT (IMPORTANT)

Most AI video apps:

- generate spectacle
- show off the model
- feel obviously artificial

CE LIT:

- hides the model
- prioritizes credibility
- treats generation like a **systemic process**

That’s why the result feels:

> official, unsettling, share‑worthy

---

## THE INVESTOR‑READY SUMMARY

If you need a **10‑second answer**, use this:

> “We don’t prompt videos. We assemble institutional cinematic instructions from a structured prompt library, generate a realistic base film, then introduce a single controlled narrative violation and extract an official artifact for sharing.”

That line alone separates CE LIT from 99% of AI tools.

---

*If you want next steps – a one‑slide diagram, a 30‑second script, or technical pseudo‑code – just say the word.*
