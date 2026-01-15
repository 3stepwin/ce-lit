# Novita API Integration Fixes - Summary

## Date: January 14, 2026

## Overview

Fixed critical issues in the Novita API integration for both the **Absurdity Sketch Machine** and **Cult Engine** pipelines based on the latest Novita API documentation.

---

## Issues Fixed

### 1. ✅ Seedream 3.0 Endpoint Correction

**Problem**: Using synchronous endpoint that doesn't support webhooks
```typescript
// ❌ WRONG
POST https://api.novita.ai/v3/seedream-3-0-txt2img
```

**Solution**: Switched to async endpoint
```typescript
// ✅ CORRECT
POST https://api.novita.ai/v3/async/txt2img
```

**Files Updated**:
- `supabase/functions/process-cult-assets/index.ts`

---

### 2. ✅ Kling V2.1 I2V File Upload Format

**Problem**: Sending image as URL/base64 in JSON body
```typescript
// ❌ WRONG
body: JSON.stringify({
  image_file: imageUrl,  // Doesn't work!
  prompt: "..."
})
```

**Solution**: Using FormData with actual file upload
```typescript
// ✅ CORRECT
const formData = new FormData();
formData.append('image', imageBlob, 'frame.jpg');
formData.append('prompt', prompt);
formData.append('extra', JSON.stringify({ webhook: { url } }));
```

**Files Updated**:
- `supabase/functions/process-cult-assets/index.ts`
- `supabase/functions/handle-novita-webhook/index.ts`

---

### 3. ✅ Webhook Event Type Configuration

**Problem**: Including incorrect `event_type` in webhook config
```typescript
// ❌ WRONG
webhook: {
  url: webhookUrl,
  event_type: "task.finish"  // Not needed!
}
```

**Solution**: Removed event_type (Novita always sends `ASYNC_TASK_RESULT`)
```typescript
// ✅ CORRECT
webhook: {
  url: webhookUrl
  // No event_type needed
}
```

**Files Updated**:
- `supabase/functions/process-cult-assets/index.ts`
- `supabase/functions/handle-novita-webhook/index.ts`

---

### 4. ✅ Webhook Payload Parsing

**Problem**: Incorrect payload structure assumption
```typescript
// ❌ WRONG
const { task_id, status, images, videos } = payload;
```

**Solution**: Proper nested structure parsing
```typescript
// ✅ CORRECT
if (body.event_type !== "ASYNC_TASK_RESULT") {
  return new Response("OK", { status: 200 });
}

const { task, extra } = body.payload || {};
const task_id = task?.task_id;
const status = task?.status;
const images = extra?.images;
const videos = extra?.videos;
```

**Actual Novita Webhook Structure**:
```json
{
  "event_type": "ASYNC_TASK_RESULT",
  "payload": {
    "task": {
      "task_id": "abc123...",
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
          "video_url_ttl": 3600
        }
      ]
    }
  }
}
```

**Files Updated**:
- `supabase/functions/handle-cult-webhook/index.ts`
- `supabase/functions/handle-novita-webhook/index.ts`

---

## Files Modified

### 1. `process-cult-assets/index.ts`
- ✅ Fixed `callNovitaSeedream()` to use `/v3/async/txt2img`
- ✅ Fixed `callNovitaKlingI2V()` to use FormData file upload
- ✅ Removed incorrect `event_type` from webhook configs

### 2. `handle-cult-webhook/index.ts`
- ✅ Added `event_type` validation
- ✅ Fixed payload parsing to use `body.payload.task` and `body.payload.extra`
- ✅ Added proper error handling for failed tasks
- ✅ Added detailed logging

### 3. `handle-novita-webhook/index.ts`
- ✅ Fixed webhook payload parsing structure
- ✅ Removed incorrect `event_type` from I2V webhook config
- ✅ Improved logging with pretty-printed JSON

---

## New Documentation

Created **`NOVITA_API_GUIDE.md`** with comprehensive documentation covering:

1. Seedream 3.0 sync vs async endpoints
2. Kling V2.1 I2V file upload requirements
3. Webhook configuration best practices
4. Event structure and payload parsing
5. Complete code examples
6. Common pitfalls and solutions
7. Test mode usage
8. Retry behavior

---

## Testing Recommendations

### 1. Test Webhook Handler with Test Mode

```typescript
// In your API call
{
  "prompt": "test",
  "extra": {
    "webhook": {
      "url": "https://your-project.supabase.co/functions/v1/handle-cult-webhook",
      "test_mode": {
        "enabled": true,
        "return_task_status": "TASK_STATUS_SUCCEED"
      }
    }
  }
}
```

This will send a mock webhook immediately without generating content.

### 2. Monitor Webhook Logs

Check Supabase Edge Function logs for:
- `"Cult Webhook Received:"` - Full payload dump
- `"T2I Complete for shot X:"` - Image generation success
- `"I2V Complete for shot X:"` - Video generation success

### 3. Verify Database Updates

Check that `shots` table updates correctly:
- `status: 't2i_processing'` → `'i2v_pending'` (after image)
- `status: 'i2v_processing'` → `'i2v_completed'` (after video)
- `assets.t2i_url` populated after image
- `assets.video_url` populated after video

---

## Next Steps

### What You Can Do to Help:

1. **Deploy Updated Functions**
   ```bash
   cd "c:\Users\garfi\Dropbox\My PC (LAPTOP-HD9G8F0V)\Downloads\cultengine-lit\AbsurditySketchMachine"
   supabase functions deploy process-cult-assets
   supabase functions deploy handle-cult-webhook
   supabase functions deploy handle-novita-webhook
   ```

2. **Test with Real API Calls**
   - Trigger a Cult Engine scene generation
   - Monitor webhook logs in Supabase dashboard
   - Verify shots progress through the pipeline

3. **Test Webhook with Test Mode**
   - Call Novita API with `test_mode.enabled: true`
   - Verify webhook handler receives and processes mock events

4. **Check for Errors**
   - Review Supabase Edge Function logs
   - Look for any 404s, 400s, or parsing errors
   - Verify task_ids match between API calls and webhooks

---

## Key Takeaways

1. **Always use `/v3/async/*` endpoints** for webhook support
2. **Kling I2V requires file upload**, not JSON with image URL
3. **Don't specify `event_type`** in webhook config - Novita always sends `ASYNC_TASK_RESULT`
4. **Parse nested structure**: `body.payload.task` and `body.payload.extra`
5. **Return 200 OK immediately** from webhooks to prevent retries

---

## Reference

- **Full Documentation**: `NOVITA_API_GUIDE.md`
- **Novita API Docs**: https://docs.novita.ai/
- **Webhook Endpoints**:
  - Cult Engine: `https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-cult-webhook`
  - Sketch Machine: `https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-novita-webhook`

---

**Status**: ✅ All critical fixes applied, ready for deployment and testing
