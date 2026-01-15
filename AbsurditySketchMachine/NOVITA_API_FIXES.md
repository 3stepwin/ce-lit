# Novita API Integration Fixes

## Critical Issues Identified

### 1. ❌ Incorrect Webhook Event Type
**Current:** Using `"task.finish"` 
**Correct:** Should be `"ASYNC_TASK_RESULT"`

**Locations to Fix:**
- `supabase/functions/handle-novita-webhook/index.ts` (line 72)
- `supabase/functions/generate-cult-audio/index.ts` (line 35)
- `supabase/functions/generate-sketch/index.ts` (webhook payload)

### 2. ❌ Wrong Seedream Endpoint
**Current:** Using sync endpoint `v3/seedream-3-0-txt2img`
**Correct:** Should use async endpoint `v3/async/txt2img`

**Impact:** Sync calls will timeout in Edge Functions (10s limit)

### 3. ❌ Kling I2V Image Format Issue
**Current:** Code assumes URL/base64 in JSON body
**Correct:** Novita Kling I2V requires **multipart/form-data** file upload

**Location:** `supabase/functions/handle-novita-webhook/index.ts` (line 55-80)

### 4. ❌ Webhook Payload Parsing
**Current:** Not checking for `event_type === "ASYNC_TASK_RESULT"`
**Correct:** Must validate event type and proper payload structure

**Location:** `supabase/functions/handle-novita-webhook/index.ts` (line 98-105)

---

## Fix Implementation Plan

### Phase 1: Update Webhook Event Types (5 min)
```typescript
// OLD
extra: {
    webhook: {
        url: webhookUrl,
        event_type: "task.finish"  // ❌ WRONG
    }
}

// NEW
extra: {
    webhook: {
        url: webhookUrl,
        event_type: "ASYNC_TASK_RESULT"  // ✅ CORRECT
    }
}
```

### Phase 2: Fix Webhook Payload Validation (5 min)
```typescript
// Add at start of webhook handler
const { event_type, task_id, task } = payload;

if (event_type !== "ASYNC_TASK_RESULT") {
    console.log(`Ignoring event type: ${event_type}`);
    return new Response("OK", { status: 200 });
}

const { status, videos, images } = task || {};
```

### Phase 3: Convert Kling I2V to Multipart Upload (15 min)
```typescript
async function callNovitaI2VMultipart(
    apiKey: string, 
    imageBase64: string, 
    prompt: string, 
    webhookUrl: string
) {
    const url = `https://api.novita.ai/v3/async/kling-v2.1-i2v-master`;
    
    // Convert base64 to blob
    const imageBlob = await (await fetch(`data:image/png;base64,${imageBase64}`)).blob();
    
    // Create FormData
    const formData = new FormData();
    formData.append('image_file', imageBlob, 'image.png');
    formData.append('model_name', 'kling_v2_1');
    formData.append('prompt', prompt);
    formData.append('duration', '5');
    formData.append('cfg_scale', '0.5');
    formData.append('extra', JSON.stringify({
        webhook: {
            url: webhookUrl,
            event_type: "ASYNC_TASK_RESULT"
        }
    }));
    
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`
            // DO NOT set Content-Type - FormData sets it automatically with boundary
        },
        body: formData
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(`Novita I2V failed: ${JSON.stringify(data)}`);
    return data.task_id;
}
```

### Phase 4: Update Seedream to Async (Optional - if used)
```typescript
// If using Seedream for T2I, switch to async endpoint
const url = `https://api.novita.ai/v3/async/txt2img`;
```

---

## Testing Checklist

- [ ] Deploy updated `handle-novita-webhook` function
- [ ] Deploy updated `generate-cult-audio` function  
- [ ] Deploy updated `generate-sketch` function (if using Novita T2I)
- [ ] Test T2V flow: Verify webhook receives `ASYNC_TASK_RESULT`
- [ ] Test I2V flow: Verify multipart upload works
- [ ] Test TTS flow: Verify audio generation completes
- [ ] Monitor webhook logs for proper event type handling

---

## Deployment Commands

```bash
# Deploy all affected functions
npx supabase functions deploy handle-novita-webhook generate-cult-audio generate-sketch --project-ref ebostxmvyocypwqpgzct
```

---

## Expected Webhook Payload Structure

```json
{
  "event_type": "ASYNC_TASK_RESULT",
  "task_id": "abc-123-def",
  "task": {
    "status": "TASK_STATUS_SUCCEED",
    "videos": [
      {
        "video_url": "https://...",
        "video_url_ttl": 3600
      }
    ],
    "images": [
      {
        "image_url": "https://...",
        "image_url_ttl": 3600
      }
    ]
  }
}
```
