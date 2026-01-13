# Architecture: CELIT Viral System v2.0

## 1. System Flow
1. **User Request**: `ascend.tsx` sends role & face to `generate-sketch` Edge Function.
2. **Orchestration**: Edge Function selects Aesthetic Preset and Weighted Pattern Interrupt.
3. **Script Generation**: Gemini AI generates full v2.0 JSON (Trinity + Retention Plan).
4. **Visual Generation**: (Future) Veo3 / Higgsfield generates video based on prompt.
5. **Asset Storage**: Supabase holds the `content` JSON, video URLs, and metadata.
6. **Delivery**: `viral-result.tsx` consumes the complex JSON to drive the UI.

## 2. API Schema (Edge Function Output)
```json
{
  "title": "ENROLLMENT",
  "runtime_target_sec": 48,
  "hook_line": "...",
  "topper_line": "...",
  "pattern_interrupt": { "type": "...", "timestamp_sec": 8.4, "execution": "..." },
  "retention_plan": [ { "t": 0.5, "event": "..." }, ... ],
  "scenes": [ ... ],
  "screenshot_frame_text": "...",
  "deleted_line": "...",
  "caption_pack": [ ... ],
  "outtakes": [ ... ],
  "veo3_prompt": "...",
  "thumbnail_prompt": "...",
  "audio_design": { ... },
  "aesthetic_preset": "..."
}
```

## 3. State Management
`zustand` handles the generation progress and result caching.
`useSketch` hook coordinates the multi-stage status polling.
