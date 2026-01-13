# Deployment Guide: Novita AI Integration

To finalize the integration of Novita AI for the "All Out +" viral system, please run the following commands in your terminal.

## 1. Set the Novita API Key
This securely stores the key for the Edge Functions to use.

```bash
npx supabase secrets set NOVITA_API_KEY=sk_Yj_ZjHWkqfCCMS0vBSfHZE0g8BZaWOyPjBaA1KH_3II --project-ref ebostxmvyocypwqpgzct
npx supabase secrets set GEMINI_API_KEY=AIzaSyBMCaDZYotvmldxIw71U-fwuzOuvXospEI --project-ref ebostxmvyocypwqpgzct
```

## 2. Deploy the Updated Edge Functions
This pushes the new code (with Image-to-Video and Face Swap logic) to the cloud.

```bash
npx supabase functions deploy generate-sketch --project-ref ebostxmvyocypwqpgzct --no-verify-jwt
```

## 3. Verify
After deployment, you can test the `generate-sketch` function from the App or using the Supabase Dashboard.

> **Note**: If `npx supabase` asks you to log in, run `npx supabase login` first and follow the browser instructions.
