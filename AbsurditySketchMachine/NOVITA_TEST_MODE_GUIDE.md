# 🧪 NOVITA TEST MODE GUIDE

**Purpose:** Test the complete Novita pipeline without consuming credits

---

## 🎯 What is Test Mode?

Novita's Test Mode allows you to:
- ✅ Test webhook integration without spending credits
- ✅ Simulate successful and failed tasks
- ✅ Validate your entire pipeline (DB writes, routing, error handling)
- ✅ Iterate on your code safely

---

## 🔧 How to Enable Test Mode

### Option 1: Environment Variable (Recommended)

Set this environment variable in your Supabase Edge Function:

```bash
NOVITA_TEST_MODE=true
```

When enabled, all Novita API calls will use Test Mode automatically.

### Option 2: Direct API Call

Add `test_mode` to your webhook configuration:

```json
{
  "extra": {
    "webhook": {
      "url": "https://your-domain.com/novita-webhook",
      "test_mode": {
        "enabled": true,
        "return_task_status": "TASK_STATUS_SUCCEED"
      }
    }
  }
}
```

---

## 📝 Test Mode Behavior

### What Happens:
1. Novita **does NOT run the actual model**
2. Novita **does NOT consume credits**
3. Novita **immediately sends** a mock `ASYNC_TASK_RESULT` to your webhook
4. The webhook payload matches the real structure (images/videos arrays, task status, etc.)

### What You Can Test:
- ✅ Webhook routing and authentication
- ✅ Database writes (sketches, celit_jobs)
- ✅ JSON pipeline orchestration
- ✅ Error handling and retries
- ✅ Status transitions (generating_image → generating_video → complete)

---

## 🚀 Deployment Steps

### 1. Deploy with Test Mode Enabled

```bash
# Set the environment variable
npx supabase secrets set NOVITA_TEST_MODE=true

# Deploy the function
npx supabase functions deploy generate-sketch
```

### 2. Test the Pipeline

```bash
# Run the test script
node test_novita_connection.js
```

Expected behavior:
- ✅ Function returns `200 OK` with `task_id`
- ✅ Webhook receives mock `ASYNC_TASK_RESULT` event
- ✅ Database records are created/updated
- ❌ **No credits consumed**

### 3. When Ready for Production

```bash
# Disable Test Mode
npx supabase secrets set NOVITA_TEST_MODE=false

# Or remove the variable entirely
npx supabase secrets unset NOVITA_TEST_MODE
```

---

## 🧪 Testing Different Scenarios

### Test Success Path

```json
{
  "test_mode": {
    "enabled": true,
    "return_task_status": "TASK_STATUS_SUCCEED"
  }
}
```

Simulates a successful generation with mock image/video URLs.

### Test Failure Path

```json
{
  "test_mode": {
    "enabled": true,
    "return_task_status": "TASK_STATUS_FAILED"
  }
}
```

Simulates a failed task to test error handling.

---

## ⚠️ Important Notes

### Webhook Requirement
- Your webhook endpoint **must be publicly accessible** via HTTPS
- Novita will attempt to POST to the webhook URL immediately in Test Mode
- If the webhook is unreachable, you'll get a `500` error (but still no credits consumed)

### Local Testing Limitation
- You **cannot test webhooks locally** without a public URL
- Use a tunneling service (ngrok, Cloudflare Tunnel) or deploy to Supabase first

### Production Checklist
Before disabling Test Mode:
- [ ] Verify webhook is receiving and processing events correctly
- [ ] Confirm database writes are working
- [ ] Test error handling paths
- [ ] Ensure you have sufficient Novita credits
- [ ] Set up monitoring/alerting for production

---

## 📊 Current Configuration

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NOVITA_TEST_MODE` | `true` (dev) / `false` (prod) | Enable/disable Test Mode |
| `NOVITA_API_KEY` | `sk-...` | Your Novita API key |
| `PUBLIC_BASE_URL` | `https://...supabase.co` | Your webhook base URL |

### Webhook URL Format

```
https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-novita-webhook?job_id={job_id}
```

---

## 🔍 Troubleshooting

### Error: "fail to send async task result to webhook"

**Cause:** Novita cannot reach your webhook URL

**Solutions:**
1. Ensure webhook function is deployed: `npx supabase functions deploy handle-novita-webhook`
2. Verify the URL is publicly accessible
3. Check CORS headers in your webhook handler
4. Test webhook directly: `curl -X POST https://your-webhook-url`

### Error: "INVALID_REQUEST_BODY"

**Cause:** Incorrect payload structure

**Solution:** Ensure you're using the nested `extra` and `request` structure (see examples above)

### No Webhook Events Received

**Cause:** Webhook handler not processing events correctly

**Solution:** Check webhook logs in Supabase Dashboard → Edge Functions → Logs

---

## 💡 Best Practices

1. **Always use Test Mode during development**
   - Only disable when you need real generation
   - Re-enable after testing

2. **Monitor your credit usage**
   - Check Novita dashboard regularly
   - Set up alerts for low balance

3. **Use referral credits**
   - Novita offers up to $500 in referral credits
   - Share your referral link to earn more

4. **Implement proper error handling**
   - Test both success and failure paths
   - Log all webhook events for debugging

---

## 📚 Related Documentation

- [Novita Webhook Documentation](https://novita.ai/docs/api-reference/model-apis-webhook)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [handle-novita-webhook Implementation](./supabase/functions/handle-novita-webhook/index.ts)

---

**Last Updated:** 2026-01-15T02:30:00Z  
**Status:** ✅ Test Mode Implemented and Ready
