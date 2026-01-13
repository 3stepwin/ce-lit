# UX Specifications: Absurdity AI Sketch Machine v3.0

## 1. Screen Inventory (12-15 Screens)

### Onboarding & Auth
1.  **S001 Splash (The Awakening):** Glitch animation logo. "Initiating Sequence...".
2.  **S002 Auth (Identity Verification):** Biometric scan style login (Email/Social).
3.  **S003 Cult Initiation (Onboarding):** "Name your Cult". "Choose your Vibe". (Swipe interface).

### Core Loop
4.  **S004 The Altar (Dashboard):** 
    -   Primary CTA: "Summon Artifact" (Generate).
    -   Recent creations list (Grid).
    -   Credit balance ("Karma").
5.  **S005 The Ritual (Generation Setup):**
    -   Input: Text Prompt or "Randomize".
    -   Selectors: Aesthetic Preset (Scroll wheel), Duration (Short/Long).
    -   Action: "Manifest" button (Haptic heavy).
6.  **S006 Liminal State (Loading):** 
    -   NOT a spinner.
    -   Terminal logs scrolling.
    -   "Generating pattern interrupts...", "Injecting absurdity...".
7.  **S007 Revelation (Result View):**
    -   Auto-playing video loop.
    -   "Share-or-Die" button prominent.
    -   Swipe down for Artifact/Outtakes.
8.  **S008 Artifact View (Static):** High-res meme card view.
9.  **S009 Outtakes Vault:** Grid of rejected/extra clips.

### Management
10. **S010 The Archives (Library):** Filterable list of all past sketches.
11. **S011 Cult Settings:** Update brand voice, aesthetics.
12. **S012 Profile/Billing:** "Tithe" (Buy Credits).

## 2. Design System Tokens (Tailwind/NativeWind)

### Colors
-   **Background:** `#050505` (Void Black)
-   **Primary:** `#FF0033` (Alert Red) - *Usage: CTA, Errors, Highlights*
-   **Secondary:** `#00FF99` (Toxic Green) - *Usage: Success, Terminal Text*
-   **Accent:** `#6600FF` (Deep Purple) - *Usage: Gradients, Borders*
-   **Surface:** `#111111` (Dark Grey)

### Typography
-   **Headings:** `Druk Wide` or similar aggressive sans-serif.
-   **Body:** `Space Mono` or `Courier New` (Bureaucratic feel).

### Interaction Patterns
-   **Haptics:** Heavy usage. Every tap has weight.
-   **Transitions:** Hard cuts. Glitch effects. No smooth fades (unless "Dream" preset).
