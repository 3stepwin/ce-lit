# Epics & Stories: Absurdity AI Sketch Machine v3.0

## EPIC-1: Foundation & Anatomy (Infrastructure)
*The skeletal structure of the application.*

- **STORY-1.1:** Initialize Expo SDK 52 project with NativeWind and TypeScript.
- **STORY-1.2:** Configure Supabase Auth (Email, Apple, Google) with persistent session.
- **STORY-1.3:** Set up Expo Router v4 with Stack and Tabs navigation structure.
- **STORY-1.4:** Implement centralized Theme Provider (NativeWind config for logic/colors).
- **STORY-1.5:** Create "Splash Screen" (S001) with glitch loop animation resource.
- **STORY-1.6:** Verify Supabase Client connection and Environment Variables scheme.
- **STORY-1.7:** Integrate Sentry for error monitoring.
- **STORY-1.8:** Set up CI/CD pipeline (EAS Build configuration).

## EPIC-2: The Ritual (Input & Onboarding)
*The user's first steps into the cult.*

- **STORY-2.1:** Implement S002 Login Screen with "Biometric Scan" visual style.
- **STORY-2.2:** Build S003 "Cult Initiation" Onboarding flow (Swiper).
- **STORY-2.3:** Create "Cult Name" generation logic (UI + randomizer).
- **STORY-2.4:** Build S005 "The Ritual" (Create Screen) layout.
- **STORY-2.5:** Implement "Aesthetic Preset" Selector (Wheel/Carousel component).
- **STORY-2.6:** Implement "Text Prompt" input with character limits and validation.
- **STORY-2.7:** Implement "Face Upload" component (ImagePicker + Compression).
- **STORY-2.8:** Add Haptic feedback to all "Ritual" interactions.

## EPIC-3: The Engine (Backend Intelligence)
*The brain generating the absurdity.*

- **STORY-3.1:** Create `sketches` and `cults` tables in Supabase with RLS policies.
- **STORY-3.2:** Deploy `generate-sketch` Edge Function skeleton.
- **STORY-3.3:** Integrate Gemini 1.5 Pro API for Script Generation in Edge Function.
- **STORY-3.4:** Implement "Retention Density" logic (inserting pattern interrupts in script).
- **STORY-3.5:** Integrate Novita AI / Higgsfield API for Video Generation.
- **STORY-3.6:** Integrate Image Gen API for "Artifact" creation.
- **STORY-3.7:** Implement `process-assets` webhook for async asset handling.
- **STORY-3.8:** Create "Polling Hook" (useSketchStatus) for frontend real-time updates.

## EPIC-4: The Revelation (Viewing & Sharing)
*The payoff.*

- **STORY-4.1:** Build S007 "Revelation" (Result Screen) chassis.
- **STORY-4.2:** Implement seamless Loop Video Player (expo-av/video).
- **STORY-4.3:** Build "Artifact View" (S008) - Static meme card renderer.
- **STORY-4.4:** Implement "Share-or-Die" custom Share Sheet overlay.
- **STORY-4.5:** Implement "Download to Camera Roll" with watermark logic.
- **STORY-4.6:** Build "Outtakes Vault" (S009) grid layout.
- **STORY-4.7:** Implement "Deleted Line" tap-to-copy interaction.
- **STORY-4.8:** Pre-load "Share Text" based on generated hashtags.

## EPIC-5: Cult Management (User Profile)
- **STORY-5.1:** Build S004 "The Altar" (Dashboard) Home Feed.
- **STORY-5.2:** Create "Recent Sketches" grid component.
- **STORY-5.3:** Build S010 "Archives" List View with filters.
- **STORY-5.4:** Implement "Cult Settings" (S011) form (Update Name/Vibe).
- **STORY-5.5:** Build S012 "Profile" screen with Credit Balance.
- **STORY-5.6:** Implement "Delete Account" (Self-Destruct) flow.

## EPIC-6: Viral Mechanics & Gamification
- **STORY-6.1:** Add "Refer-a-Cultist" deep link generation.
- **STORY-6.2:** Implement "Credits" ledger logging in database.
- **STORY-6.3:** Create "Notification Permission" prompt flow for "Finished" alerts.
- **STORY-6.4:** Implement "Streak" logic (Daily login mechanics).

## EPIC-7: Compliance & Polish
- **STORY-7.1:** Implement Content Moderation block (keyword filter) in Edge Function.
- **STORY-7.2:** Add "AI Generated" watermark overlay handled by backend.
- **STORY-7.3:** Optimize Asset Caching (React Query + mmkv).
- **STORY-7.4:** Final Tone Polish: Review all copy for "Bureaucratic Absurdity".
