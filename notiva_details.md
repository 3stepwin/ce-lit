# Novita AI API Integration Info

## API Key
`sk_Yj_ZjHWkqfCCMS0vBSfHZE0g8BZaWOyPjBaA1KH_3II` (Found in login variables)

## Endpoints

### 1. Video Merge Face
**URL:** `POST https://api.novitai.com/v3/video/merge-face`
**Description:** Merges a face image into a target video.
**Key Params:**
- `video_assets_id`: ID of the uploaded target video.
- `face_image_base64`: Base64 of the face image to swap in.
- `enable_restore`: Improves face detail (optional).

### 2. Text-to-Image
**URL:** `POST https://api.novitai.com/v3/text-to-image`
**Description:** Generates an image from a text prompt.
**Models available:** Stable Diffusion, etc.

### 3. Task Results
**URL:** `GET https://api.novitai.com/v3/task-result?task_id={task_id}`
**Description:** Poll for the status and output URLs of asynchronous tasks.

## Implementation
The integration code is located at: `AbsurditySketchMachine/lib/novita.ts`
