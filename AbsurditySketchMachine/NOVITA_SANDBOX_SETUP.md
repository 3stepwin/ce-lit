# Novita AI Agent Sandbox Setup

The Novita AI Agent Sandbox has been successfully integrated into the project.

## Installation
The dependency `novita-sandbox` has been added to `package.json` using `pnpm`.

## Configuration
The sandbox requires a Novita AI API Key. You can pass it directly to the `Sandbox.create()` method or set it as an environment variable `NOVITA_API_KEY`.

Current API Key used in verification: `sk_Yj_...3II` (Found in `login variables`)

## Usage Example (TypeScript/JavaScript)

```typescript
import { Sandbox } from 'novita-sandbox/code-interpreter';

async function runSandbox() {
  const sandbox = await Sandbox.create({
    apiKey: process.env.NOVITA_API_KEY
  });

  // Run dynamic code (e.g., Python)
  const execution = await sandbox.runCode('print("Hello from Sandbox")');
  console.log(execution.logs.stdout);

  // Stop the sandbox when done
  await sandbox.kill();
}
```

## E2B Compatibility
If you prefer using the E2B SDK, set the following environment variables:
- `E2B_DOMAIN=sandbox.novita.ai`
- `E2B_API_KEY=your_novita_api_key`

## Verification
A test script `test_novita_sandbox.js` is available in the root directory to verify the connection. Run it with:
```bash
node test_novita_sandbox.js
```
