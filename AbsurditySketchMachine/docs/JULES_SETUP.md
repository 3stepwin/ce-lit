# Jules Integration Setup

This guide allows Antigravity to orchestrate **Jules** for background coding tasks.

## 1. Install Jules

### Step A: GitHub App
1. Go to the [Jules Website](https://jules.ai) (or your provided internal link).
2. Install the **Jules GitHub App** on your account/organization.
3. Grant access to this repository: `AbsurditySketchMachine`.

### Step B: CLI Installation
Since Antigravity runs locally, it needs the CLI to talk to Jules.
```bash
# Example (Adjust generic command to actual provider if known)
npm install -g jules-cli
# OR
brew install jules
```

### Step C: Authenticate
Run this in your terminal to link your local environment to your Jules account:
```bash
jules login
```

## 2. Configure Local Project

### Initialize Jules Source
Tell Jules this folder is the source of truth.
```bash
jules init
```
*Follow the prompts to link to your GitHub repository.*

## 3. Enable Antigravity Bridge

You have successfully added the **Jules Bridge Skill** to Antigravity's memory! 
Location: `.agent/skills/jules_bridge/SKILL.md`
Status: **Ready** (Once CLI is installed)

## 4. Test the Connection

Once installed, run this command to verify:
```bash
jules status
```

## 5. How to Delegate Tasks

You can now ask Antigravity:
> "Have Jules write unit tests for the utils folder."
> "Ask Jules to fix the lint errors in app/index.tsx."

Antigravity will use the `jules` CLI to dispatch these agents while you continue working on the core logic.
