# Novita AI Migration Guide - V2.0 "Cinematic" Pipeline

This document details the refined API architecture for the "All Out +" viral system, utilizing Novita AI's best-in-class models and webhook automation.

## 1. The V2.0 Workflow
1.  **Script Generation**: Gemini generates the concept, visual script, `[t2i_prompt]` and `[motion_prompt]`.
2.  **Base Image Generation (T2I)**:
    *   **Provider**: Novita AI (Seedream 3.0 Text to Image).
    *   **Endpoint**: `/v3/seedream-3-0-txt2img`
    *   **Output**: High-quality base frame.
3.  **Face Swap (Identity Injection)**:
    *   **Provider**: Novita AI (Merge Face).
    *   **Endpoint**: `/v3/merge-face`
    *   **Output**: Identity-integrated base frame.
4.  **Cinematic Animation (I2V)**:
    *   **Provider**: Novita AI (Kling V2.1 Master Image to Video).
    *   **Endpoint**: `/v3/async/kling-v2.1-i2v-master`
    *   **Rationale**: Chosen for superior cinematic motion over SVD.
5.  **Orchestration**:
    *   **Webhooks**: Automation via `extra.webhook`.
    *   **Polling**: Fallback mechanism via `/v3/async/task-result`.

## 2. API Specifications

### A. Text to Image (Seedream 3.0)
*   **Endpoint:** `POST https://api.novita.ai/v3/seedream-3-0-txt2img`
*   **Headers:** `Authorization: Bearer <NOVITA_API_KEY>`
*   **Body:**
```json
{
  "prompt": "cinematic portrait of [character_desc], [aesthetic_tokens], 8k",
  "model_name": "seedream_3_0",
  "width": 832,
  "height": 1216,
  "guidance_scale": 7.5,
  "image_num": 1,
  "response_image_type": "url" // or "base64" if needed
}
```

### B. Face Swap
*   **Endpoint:** `POST https://api.novita.ai/v3/merge-face`
*   **Body:**
```json
{
  "face_image_file": "BASE64_USER_SELFIE",
  "image_file": "BASE64_GENERATED_CHARACTER",
  "extra": { "response_image_type": "png" }
}
```

### C. Image to Video (Kling V2.1 Master)
*   **Endpoint:** `POST https://api.novita.ai/v3/async/kling-v2.1-i2v-master`
*   **Body:**
```json
{
  "model_name": "kling_v2_1",
  "image_file": "BASE64_SWAPPED_IMAGE", // First frame
  "prompt": "cinematic movement, [motion_prompt], 4k",
  "duration": "5", // 5s or 10s
  "cfg_scale": 0.5,
  "extra": {
    "webhook": {
      "url": "https://<SUPABASE_PROJECT>.functions.supabase.co/handle-novita-webhook",
      "event_type": "task.finish" 
    }
  }
}
```

## 3. Required Secrets
*   `NOVITA_API_KEY`: Set via Step 73.
