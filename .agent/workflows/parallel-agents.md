---
description: Parallel Agents Workflow
---

# Parallel Agents Execution

1.  **Orchestrator Logic**:
    *   The user wants multiple specialized agents working in tandem.
    *   In the context of EMDADF Phase 6 (Development), this means:
        *   **Agent 1 (Frontend):** Focus on  "React Native" example only follow user designated stack if none use best option  UI/UX (`app/`).
        *   **Agent 2 (Backend):** Focus on Edge Functions & Novita API (`supabase/functions/`).
        *   **Agent 3 (QA):** Verify results.

2.  **Implementation Strategy**:
    *   Since I am a single interface, I will SIMULATE parallel execution by grouping related tool calls.
    *   I will explicitly prefix my actions with the "Agent Identity" performing them.
    *   Example: [DEV_AMELIA] Modifying UI... [ARCHITECT_WINSTON] checking schema...

3.  **Active Parallel Tracks**:
    *   **Track A:** Finalize `process-cult-assets` for Kling I2V (Backend).
    *   **Track B:** Polish `cult-status.tsx` for real-time updates (Frontend).
    *   **Track C:** Deploy & Verify (DevOps).

4.  **Execution**:
    *   Check `novita-key` availability.
    *   Check `supabase-secrets`.
    *   Deploy functions.