# Novita AI API Integration Guide

## Overview

This document provides the **definitive reference** for integrating Novita AI's APIs into the Absurdity AI Sketch Machine project, specifically covering:

1. **Seedream 3.0** (Text-to-Image) with async webhooks
2. **Kling V2.1 I2V** (Image-to-Video) with file upload requirements
3. **Webhook configuration and handling**

---

## 1. Seedream 3.0 Text-to-Image

### Synchronous Endpoint (NOT RECOMMENDED for Edge Functions)

```
POST https://api.novita.ai/v3/seedream-3-0-txt2img
```

- Returns results **immediately** in response body
- Can timeout in Edge Functions (max 60s)
- Response format: `"url"` or `"b64_json"`

### ✅ Asynchronous Endpoint (RECOMMENDED)

```
POST https://api.novita.ai/v3/async/txt2img
```

**Request Body:**

```json
{
  "model_name": "seedream_3_0",
  "prompt": "A cinematic scene of a quiet girl in a cyberpunk city",
  "negative_prompt": "blurry, low quality",
  "width": 720,
  "height": 1280,
  "image_num": 1,
  "guidance_scale": 7.5,
  "steps": 20,
  "seed": -1,
  "extra": {
    "response_image_type": "jpeg",
    "webhook": {
      "url": "https://your-supabase-project.supabase.co/functions/v1/handle-novita-webhook"
    }
  }
}
```

**Response:**

```json
{
  "task_id": "abc123-def456-ghi789"
}
```

**What Happens Next:**
- Novita processes the image generation asynchronously
- When complete, Novita POSTs to your webhook URL with event type `ASYNC_TASK_RESULT`

---

## 2. Kling V2.1 Image-to-Video

### ⚠️ CRITICAL: File Upload Required

Novita's Kling V2.1 I2V endpoint **requires a file upload**, NOT a URL or base64 string in JSON.

### Endpoint

```
POST https://api.novita.ai/v3/async/kling-v2.1-i2v-master
```

### Request Format: `multipart/form-data`

**You CANNOT send JSON with `image_url` or `image_file` as a string.**

Instead, you must:

1. Download the image from URL (if you have a URL)
2. Convert to binary blob
3. Upload as `multipart/form-data` with file field

### Example Implementation (Deno/TypeScript)

```typescript
async function callKlingI2V(
  apiKey: string,
  imageUrl: string,
  prompt: string,
  webhookUrl: string
): Promise<string> {
  // 1. Download image
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  
  // 2. Create FormData
  const formData = new FormData();
  formData.append('image', imageBlob, 'frame.jpg');
  formData.append('prompt', prompt);
  formData.append('negative_prompt', 'blurry, distorted');
  formData.append('duration', '5'); // 5 or 10 seconds
  formData.append('cfg_scale', '0.5');
  
  // 3. Add webhook config as JSON string in extra field
  formData.append('extra', JSON.stringify({
    webhook: {
      url: webhookUrl
    }
  }));
  
  // 4. Send request
  const response = await fetch('https://api.novita.ai/v3/async/kling-v2.1-i2v-master', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
      // DO NOT set Content-Type - FormData sets it automatically with boundary
    },
    body: formData
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Kling I2V failed: ${JSON.stringify(data)}`);
  }
  
  return data.task_id;
}
```

### Image Requirements

- **Formats**: `.jpg`, `.jpeg`, `.png`
- **Size**: ≤ 10MB
- **Resolution**: ≥ 300×300 pixels
- **Recommended**: 720×1280 (9:16 portrait) or 1280×720 (16:9 landscape)

---

## 3. Webhook Configuration

### Adding Webhooks to ANY Async Endpoint

All Novita `/v3/async/*` endpoints support webhooks via the `extra.webhook` object:

```json
{
  "extra": {
    "webhook": {
      "url": "https://your-domain.com/novita-webhook"
    }
  }
}
```

### Available Async Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/v3/async/txt2img` | Text → Image (Seedream, SDXL, etc.) |
| `/v3/async/img2img` | Image → Image |
| `/v3/async/img2video` | Image → Video (generic) |
| `/v3/async/txt2video` | Text → Video |
| `/v3/async/kling-v2.1-i2v-master` | Kling V2.1 I2V (file upload) |
| `/v3/async/txt2speech` | Text → Speech |

---

## 4. Webhook Event Structure

### Event Type

All webhook events have:

```json
{
  "event_type": "ASYNC_TASK_RESULT"
}
```

### Payload Structure

```json
{
  "event_type": "ASYNC_TASK_RESULT",
  "payload": {
    "task": {
      "task_id": "abc123-def456",
      "status": "TASK_STATUS_SUCCEED",
      "created_at": 1234567890,
      "finished_at": 1234567899
    },
    "extra": {
      "images": [
        {
          "image_url": "https://cdn.novita.ai/...",
          "image_type": "jpeg",
          "image_url_ttl": 3600
        }
      ],
      "videos": [
        {
          "video_url": "https://cdn.novita.ai/...",
          "video_type": "mp4",
          "video_url_ttl": 3600,
          "duration": 5.0
        }
      ]
    }
  }
}
```

### Status Values

- `TASK_STATUS_SUCCEED` - Task completed successfully
- `TASK_STATUS_FAILED` - Task failed
- `TASK_STATUS_PROCESSING` - Still processing (rare in webhook)

### Output Fields

**For Image Generation:**
- `payload.extra.images[]` - Array of generated images
- Each image has: `image_url`, `image_type`, `image_url_ttl`

**For Video Generation:**
- `payload.extra.videos[]` - Array of generated videos
- Each video has: `video_url`, `video_type`, `video_url_ttl`, `duration`

---

## 5. Webhook Handler Implementation

### Edge Function Example

```typescript
// handle-novita-webhook/index.ts

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  if (req.method !== "POST") {
    return new Response("POST required", { status: 405 });
  }
  
  try {
    const body = await req.json();
    
    // 1. Validate event type
    if (body.event_type !== "ASYNC_TASK_RESULT") {
      console.warn("Unknown event type:", body.event_type);
      return new Response("OK", { status: 200 }); // Acknowledge but ignore
    }
    
    // 2. Extract task info
    const { task, extra } = body.payload;
    const taskId = task.task_id;
    const status = task.status;
    
    // 3. Find the sketch by external_id (task_id)
    const { data: sketch } = await supabase
      .from('sketches')
      .select('*')
      .eq('external_id', taskId)
      .single();
    
    if (!sketch) {
      console.error(`No sketch found for task_id: ${taskId}`);
      return new Response("Not found", { status: 404 });
    }
    
    // 4. Handle success
    if (status === "TASK_STATUS_SUCCEED") {
      
      // Image result
      if (extra.images && extra.images.length > 0) {
        const imageUrl = extra.images[0].image_url;
        
        // Update sketch with image, trigger next step
        await supabase.from('sketches').update({
          status: 'image_complete',
          meta: { ...sketch.meta, image_url: imageUrl }
        }).eq('id', sketch.id);
      }
      
      // Video result
      if (extra.videos && extra.videos.length > 0) {
        const videoUrl = extra.videos[0].video_url;
        
        // Mark as complete
        await supabase.from('sketches').update({
          status: 'complete',
          video_url: videoUrl,
          completed_at: new Date().toISOString()
        }).eq('id', sketch.id);
      }
    }
    
    // 5. Handle failure
    if (status === "TASK_STATUS_FAILED") {
      await supabase.from('sketches').update({
        status: 'failed',
        error_message: task.reason || 'Novita task failed'
      }).eq('id', sketch.id);
    }
    
    // 6. Return 2xx immediately (Novita retries on non-2xx)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err) {
    console.error("Webhook error:", err);
    
    // Still return 200 to prevent retries on parsing errors
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

---

## 6. Test Mode for Webhooks

You can test your webhook handler without generating real content:

```json
{
  "prompt": "test",
  "extra": {
    "webhook": {
      "url": "https://your-domain.com/webhook",
      "test_mode": {
        "enabled": true,
        "return_task_status": "TASK_STATUS_SUCCEED"
      }
    }
  }
}
```

Novita will immediately send a mock `ASYNC_TASK_RESULT` event to your webhook.

---

## 7. Retry Behavior

- **Timeout**: 5 seconds per webhook call
- **Retries**: Up to 5 attempts if non-2xx response or timeout
- **Best Practice**: Return `200 OK` immediately, offload heavy work to background jobs

---

## 8. Complete Pipeline Example

### Seedream T2I → Kling I2V Chain

```typescript
// Step 1: Generate image with Seedream
async function generateImage(prompt: string, webhookUrl: string) {
  const response = await fetch('https://api.novita.ai/v3/async/txt2img', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOVITA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model_name: 'seedream_3_0',
      prompt: prompt,
      width: 720,
      height: 1280,
      extra: {
        response_image_type: 'jpeg',
        webhook: { url: webhookUrl }
      }
    })
  });
  
  const data = await response.json();
  return data.task_id;
}

// Step 2: Webhook receives image, triggers video
async function handleWebhook(body: any) {
  if (body.event_type !== 'ASYNC_TASK_RESULT') return;
  
  const { task, extra } = body.payload;
  
  if (task.status === 'TASK_STATUS_SUCCEED' && extra.images) {
    const imageUrl = extra.images[0].image_url;
    
    // Download image for Kling upload
    const imageBlob = await fetch(imageUrl).then(r => r.blob());
    
    // Create video with Kling
    const formData = new FormData();
    formData.append('image', imageBlob, 'frame.jpg');
    formData.append('prompt', 'cinematic camera movement');
    formData.append('duration', '5');
    formData.append('extra', JSON.stringify({
      webhook: { url: webhookUrl }
    }));
    
    const videoResponse = await fetch(
      'https://api.novita.ai/v3/async/kling-v2.1-i2v-master',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${NOVITA_API_KEY}` },
        body: formData
      }
    );
    
    const videoData = await videoResponse.json();
    console.log('Video task started:', videoData.task_id);
  }
  
  if (task.status === 'TASK_STATUS_SUCCEED' && extra.videos) {
    const videoUrl = extra.videos[0].video_url;
    console.log('Video complete:', videoUrl);
  }
}
```

---

## 9. Common Pitfalls

### ❌ Wrong: Using sync endpoint with webhook

```json
// This will NOT trigger webhooks
POST https://api.novita.ai/v3/seedream-3-0-txt2img
```

### ✅ Correct: Using async endpoint

```json
POST https://api.novita.ai/v3/async/txt2img
```

---

### ❌ Wrong: Sending image URL in JSON for Kling

```json
{
  "image_file": "https://example.com/image.jpg",  // DOES NOT WORK
  "prompt": "..."
}
```

### ✅ Correct: Uploading file with FormData

```typescript
const formData = new FormData();
formData.append('image', imageBlob, 'frame.jpg');
```

---

### ❌ Wrong: Using incorrect event_type

```json
{
  "extra": {
    "webhook": {
      "url": "...",
      "event_type": "task.finish"  // WRONG
    }
  }
}
```

### ✅ Correct: No event_type in request (Novita sends ASYNC_TASK_RESULT)

```json
{
  "extra": {
    "webhook": {
      "url": "..."
    }
  }
}
```

---

### ❌ Wrong: Not checking event_type in webhook handler

```typescript
const { task_id, status } = payload;  // Assumes structure
```

### ✅ Correct: Validate event_type first

```typescript
if (body.event_type !== 'ASYNC_TASK_RESULT') {
  return new Response('OK', { status: 200 });
}
const { task, extra } = body.payload;
```

---

## 10. Quick Reference

| Task | Endpoint | Method | Input Format |
|------|----------|--------|--------------|
| Seedream T2I (async) | `/v3/async/txt2img` | POST JSON | `{ prompt, extra.webhook }` |
| Kling I2V (async) | `/v3/async/kling-v2.1-i2v-master` | POST FormData | File upload + fields |
| Webhook event | Your endpoint | POST JSON | `{ event_type, payload }` |

### Webhook Payload Access Paths

```typescript
const eventType = body.event_type;                    // "ASYNC_TASK_RESULT"
const taskId = body.payload.task.task_id;             // "abc123..."
const status = body.payload.task.status;              // "TASK_STATUS_SUCCEED"
const imageUrl = body.payload.extra.images[0].image_url;
const videoUrl = body.payload.extra.videos[0].video_url;
```

---

## 11. Environment Variables Required

```bash
NOVITA_API_KEY=your_novita_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Summary

1. **Always use `/v3/async/*` endpoints** for webhook support
2. **Kling I2V requires file upload** (FormData), not JSON with URL
3. **Webhook event_type is always `ASYNC_TASK_RESULT`** (don't specify in request)
4. **Return 200 OK immediately** from webhook handler to prevent retries
5. **Test with `test_mode`** before going live

---

**Last Updated**: January 14, 2026  
**Project**: Absurdity AI Sketch Machine  
**Author**: Antigravity AI Assistant
