# Pipeline Code Error Report

**Generated:** January 14, 2026

## Summary
Found **5 critical errors** and **3 warnings** in the pipeline edge functions that will cause runtime failures.

---

## 🔴 CRITICAL ERRORS

### 1. **Undefined Variable: `payload` in Error Handler**
- **File:** `AbsurditySketchMachine/supabase/functions/handle-novita-webhook/index.ts`
- **Line:** 167
- **Severity:** CRITICAL (Runtime Error)
- **Issue:**
  ```typescript
  error_message: payload.reason || "Novita task failed"  // ❌ payload is undefined
  ```
- **Root Cause:** Variable name mismatch. The body is `body`, not `payload`
- **Fix:**
  ```typescript
  error_message: body.payload?.reason || "Novita task failed"
  ```

### 2. **Unreachable Code in State Machine**
- **File:** `AbsurditySketchMachine/supabase/functions/handle-novita-webhook/index.ts`
- **Lines:** ~193 and ~209
- **Severity:** CRITICAL (Logic Error)
- **Issue:**
  ```typescript
  if (sketch.status === 'generating_image') {
      // ... code block A
  }
  if (sketch.status === 'generating_image') {  // ❌ This will never execute
      // ... code block B (unreachable if first block matches)
  }
  else if (sketch.status === 'generating_video') {
      // ... code block C
  }
  ```
- **Root Cause:** Missing `else` on the second condition. Both blocks check the same condition, so block B is unreachable if block A executes.
- **Fix:** Change second condition to `else if`:
  ```typescript
  else if (sketch.status === 'generating_image') {
      // ... different logic
  }
  ```

### 3. **Incorrect Webhook Payload Structure**
- **File:** `AbsurditySketchMachine/supabase/functions/handle-novita-webhook/index.ts`
- **Lines:** 138-140
- **Severity:** CRITICAL (JSON Parse Error)
- **Issue:**
  ```typescript
  const { task, extra } = body.payload || {};  // ❌ May not match actual Novita structure
  ```
- **Root Cause:** Novita webhook structure may not include nested `payload`. Needs to match actual API response.
- **Expected:** Verify against Novita's official webhook documentation
- **Current Code Assumes:** `body.payload.task` and `body.payload.extra`
- **Action:** Compare with actual Novita webhook examples from their API docs

### 4. **Missing Status Transitions**
- **File:** `AbsurditySketchMachine/supabase/functions/handle-novita-webhook/index.ts`
- **Lines:** 210+
- **Severity:** CRITICAL (State Machine Gap)
- **Issue:** No handler for `swapping_face` status, but state machine mentions it's possible:
  ```typescript
  // --- STATE: SWAPPING FACE (Async Fallback) ---
  // If we move to Async Face Swap later, handle it here + duplicate I2V trigger logic.
  // (Currently just a comment, no implementation)
  ```
- **Impact:** If a sketch enters `swapping_face` status, the webhook won't update it further
- **Fix:** Implement the swapping_face state handler or remove from state machine

### 5. **Fire-and-Forget Async Operations Without Retry**
- **File:** `AbsurditySketchMachine/supabase/functions/generate-sketch/index.ts`
- **Multiple Locations**
- **Severity:** HIGH (Data Loss Risk)
- **Issue:** Triggering edge functions with no error tracking:
  ```typescript
  fetch(processorUrl, { method: 'POST', ... })
      .then(r => r.json())
      .catch(err => console.error(...))  // Only logs, doesn't retry
  ```
- **Impact:** If webhook fails, pipeline hangs indefinitely
- **Fix:** Implement retry logic or store job in queue table

---

## ⚠️ WARNINGS

### W1: Hardcoded Webhook URL
- **File:** `AbsurditySketchMachine/supabase/functions/handle-novita-webhook/index.ts`
- **Line:** 152
- **Issue:**
  ```typescript
  const webhookUrl = "https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-novita-webhook";
  ```
- **Problem:** Hardcoded URL will break if infrastructure changes
- **Fix:** Use environment variable:
  ```typescript
  const webhookUrl = Deno.env.get("WEBHOOK_URL") || "https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/handle-novita-webhook";
  ```

### W2: Placeholder Avatar URL
- **File:** `AbsurditySketchMachine/supabase/functions/handle-novita-webhook/index.ts`
- **Line:** 178
- **Issue:**
  ```typescript
  const userAvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000"; // Placeholder
  ```
- **Problem:** Using placeholder instead of actual user avatar
- **Fix:** Fetch from database or request metadata:
  ```typescript
  const userAvatarUrl = sketch.meta?.user_avatar_url || sketch.avatar_url;
  if (!userAvatarUrl) { /* skip face swap */ }
  ```

### W3: No Idempotency Key for Webhook
- **File:** `AbsurditySketchMachine/supabase/functions/handle-novita-webhook/index.ts`
- **Issue:** Multiple webhook calls for same task_id could trigger duplicate updates
- **Fix:** Add `UPDATE` with check or use database transaction:
  ```typescript
  const { data } = await supabase
      .from('sketches')
      .update({ status: "complete", ... })
      .eq('id', sketch.id)
      .eq('status', 'generating_video')  // Only update if still in this state
  ```

---

## 📊 Validation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Type Safety | ✅ PASS | No TypeScript errors in compilation |
| Runtime Variables | ❌ FAIL | Undefined `payload` variable |
| State Machine | ⚠️ WARNING | Unreachable conditions, missing states |
| Error Handling | ⚠️ WARNING | No retry logic on async operations |
| Webhook Integration | ⚠️ NEEDS VERIFICATION | JSON structure needs validation |

---

## 🔧 Recommended Fixes (Priority Order)

1. **FIX ERROR #1:** Replace `payload.reason` with `body.payload?.reason`
2. **FIX ERROR #2:** Add `else if` to state machine conditions
3. **FIX ERROR #3:** Verify Novita webhook structure against API docs
4. **FIX ERROR #4:** Implement `swapping_face` state handler or document why it's not needed
5. **FIX ERROR #5:** Add retry queue or job tracking table
6. **FIX WARNING #2:** Use database user avatar instead of placeholder

---

## Testing Recommendations

- [ ] Test webhook with actual Novita payload (get sample from Novita docs)
- [ ] Verify JSON structure matches real webhook calls
- [ ] Test state transitions (running → generating_image → generating_video → complete)
- [ ] Test failure paths with mock errors
- [ ] Test idempotency (send same webhook twice)

