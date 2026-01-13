# Cult Engine: "Theoretically Media" Orchestration Architecture

## Overview
This document defines the architecture for the **Cult Engine Explainer Pipeline**, designed to generate high-quality, multi-shot explainer videos (Gogon-Goggles / Theoretically Media style).

Unlike the single-shot "Viral Sketch" pipeline, this system uses an **Orchestrator Layer** to manage a timeline of multiple shots, efficient asset generation, and final assembly.

## 1. High-Level Workflow

1.  **Topic Expansion**: User inputs a topic -> LLM generates a 30-90s script + Shot List (Visual Prompts).
2.  **Audio Generation**: Script -> Novita TTS -> Master Audio Track.
3.  **Parallel Asset Generation**:
    *   **shots** table tracks each scene segment.
    *   **T2I**: Text-to-Image for base frames.
    *   **I2V**: Image-to-Video (Novita/Kling/Wan) for motion clips.
    *   *Optional*: Lip-Sync for talking heads.
4.  **Assembly**:
    *   FFmpeg (Backend) or Client-Side composition.
    *   Overlays narration audio + background music.

## 2. Data Model (Schema)

### `scripts`
*   `id`: UUID (PK)
*   `user_id`: UUID
*   `topic`: Text
*   `script_text`: Text (Full narration)
*   `style_preset`: Text (e.g., 'documentary_dark', 'explainer_bright')
*   `status`: 'generating_script', 'generating_audio', 'generating_visuals', 'assembling', 'complete'
*   `created_at`: Timestamptz

### `shots`
*   `id`: UUID (PK)
*   `script_id`: UUID (FK)
*   `sequence_index`: Integer (Order in timeline)
*   `visual_prompt`: Text (The image prompt)
*   `motion_prompt`: Text (The movement prompt)
*   `duration`: Float (Target duration in seconds)
*   `status`: 'pending', 't2i_processing', 'i2v_processing', 'done'
*   `assets`: JSONB
    *   `t2i_url`: string
    *   `t2i_task_id`: string
    *   `video_url`: string
    *   `video_task_id`: string
*   `model_config`: JSONB (Specific model settings for this shot)

### `audio_assets`
*   `id`: UUID (PK)
*   `script_id`: UUID (FK)
*   `asset_type`: 'narration', 'music', 'sfx'
*   `url`: Text
*   `duration`: Float

## 3. Edge Functions

### `generate-cult-scene` (The Entry Point)
*   **Input**: `topic`, `style_preset`.
*   **Action**:
    1.  Call LLM (Gemini) to generate Script + Shot List.
    2.  Insert into `scripts` and `shots`.
    3.  Trigger `generate-cult-audio` (or handle inline).
    4.  Return `script_id`.

### `process-cult-assets` (The Workhorse)
*   **Trigger**: Cron or Webhook chain.
*   **Action**:
    *   Find all `shots` with status `pending`.
    *   For each, start T2I -> Update status `t2i_processing`.
    *   (Separate Logic): Find `t2i_processing` shots -> Check/Webhook -> Start I2V.

### `handle-cult-webhook` (The Updater)
*   **Input**: Novita Task Result.
*   **Action**: Updates specific `shots` rows. Triggers next step (T2I -> I2V).

## 4. State Machine Strategy
We utilize **Novita's Webhooks** heavily.
*   **T2I Completion**: Triggers Webhook -> Updates `shots.t2i_url` -> Immediately starts I2V for that shot.
*   **I2V Completion**: Triggers Webhook -> Updates `shots.video_url` -> Checks if ALL shots are done -> If yes, triggers `assembly`.

## 5. Rendering
*   **Phase 1 (MVP)**: Client-side assembly or simple list of video URLs played sequentially.
*   **Phase 2**: Backend FFmpeg composition.
