# Celit Cinematic Pipeline Architecture (v2.0)

## Overview
This document defines the state machine and data flow for the "Cinematic" viral video generation pipeline using Supabase Edge Functions and Novita AI.

## State Machine (Field: `status`)

1.  **`generating_script`**
    *   **Agent**: `generate-sketch` function.
    *   **Action**: Calls Gemini.
    *   **Next**: Calls Novita T2I -> Sets status `generating_image`.

2.  **`generating_image`**
    *   **Waiting Content**: Base Character Image (T2I).
    *   **Trigger**: Novita Webhook (`image_generation`).
    *   **Action**:
        *   If `user_avatar` exists -> Call Novita Face Swap -> Set status `swapping_face`.
        *   Else -> Call Novita I2V directly -> Set status `generating_video`.

3.  **`swapping_face`**
    *   **Waiting Content**: Face Swapped Image.
    *   **Trigger**: Novita Webhook (`face_swap`).
    *   **Action**: Call Novita I2V -> Set status `generating_video`.

4.  **`generating_video`**
    *   **Waiting Content**: Final Animation (I2V).
    *   **Trigger**: Novita Webhook (`video_generation`).
    *   **Action**: Save Video URL -> Set status `complete`.

5.  **`complete`**
    *   **Final State**.

## Webhook Payload Strategy
To know *which* stage we are in during the webhook callback, we can:
1.  Rely on the DB `status` of the sketch associated with the `task_id`.
2.  Pass metadata in the Novita `extra` field, but DB lookup is safer.

## Schema Updates
Ensure `sketches` table has:
*   `external_id`: Stores the *current* active Novita Task ID.
*   `meta`: JSONB to store intermediate asset URLs (e.g., `t2i_url`, `swap_url`).

## Function Responsibilities

### `generate-sketch`
*   Generates Script.
*   **Triggers T2I** (Async).
*   Updates DB: `status='generating_image'`, `external_id=<T2I_TASK_ID>`.
*   Returns 200 OK.

### `handle-novita-webhook`
*   Finds sketch by `external_id`.
*   **Switch based on Sketch Status**:
    *   **Case `generating_image`**:
        *   Save T2I URL to `meta.base_image_url`.
        *   **Trigger Face Swap**.
        *   Update DB: `status='swapping_face'`, `external_id=<SWAP_TASK_ID>`.
    *   **Case `swapping_face`**:
        *   Save Swap URL to `meta.swapped_image_url`.
        *   **Trigger I2V**.
        *   Update DB: `status='generating_video'`, `external_id=<I2V_TASK_ID>`.
    *   **Case `generating_video`**:
        *   Save Video URL to `video_url`.
        *   Update DB: `status='complete'`.
