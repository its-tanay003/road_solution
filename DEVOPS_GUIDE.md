# ROADSoS DevOps & Environment Configuration Guide

This document outlines the Supabase environment configuration, local development setups, the automatic architectural resilience system, and the deployment procedures on Vercel.

---

## 🔑 Supabase Environment Credentials

To enable complete user authentication and database access in ROADSoS, the frontend requires the following two public environment variables:

| Variable Name | Description | Example / Required Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | The secure project API endpoint URL | `https://njfvhhlkthqrlesmwlwv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous public publishable API Key | `sb_publishable_SXOi_ihNjq1mvfRPVD5wMg_e3uwtPuD` |

---

## 🛡️ Secure Runtime & Fallback Proxy Architecture

To prevent severe production failures (like a blank "white screen of death") when environment variables are missing, ROADSoS uses an **Architectural Resilience Shield**. 

### 1. Graceful Mock Fallback
Inside [`roadsos/lib/supabase/client.ts`](file:///c:/New%20Volume%20%28D%29/mandi/roadsos/lib/supabase/client.ts), client initialization is protected. If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set:
- The system intercepts the missing credentials.
- It prints a `[ROADSoS] CRITICAL` console warning.
- It returns a **Safe Mock Client Proxy** (a deep proxy object) which matches the expected Supabase API contract (`auth`, `from`, `storage`, `channel`, etc.).
- This mock client handles any nested database queries and authentication lifecycle triggers gracefully (e.g. returning blank result arrays and resolving promises safely) rather than throwing fatal runtime errors.

### 2. Isolated Root Error Boundary
If any unexpected client initialization failure passes the initial proxy protection, [`roadsos/app/error.tsx`](file:///c:/New%20Volume%20%28D%29/mandi/roadsos/app/error.tsx) intercepts the exception. It suspends the failing component tree and displays a high-fidelity **Nexus Shield DevOps Portal** instead of a blank screen, allowing users to:
1. View the exact isolated trace message.
2. Read a step-by-step setup guide to fix the issue.
3. Reload the application directly from the UI.
4. Copy a comprehensive diagnostics report to the clipboard.

---

## 💻 Local Development Setup

For local testing and verification, populate environment keys in the `roadsos` directory:

1. Create or verify a `.env.local` file inside the `roadsos/` directory:
   ```bash
   # Path: roadsos/.env.local
   NEXT_PUBLIC_SUPABASE_URL=https://njfvhhlkthqrlesmwlwv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SXOi_ihNjq1mvfRPVD5wMg_e3uwtPuD
   ```
2. Restart your local development server:
   ```bash
   cd roadsos
   npm run dev
   ```

---

## 🚀 Vercel Production Deployment

To configure credentials on Vercel:

1. Go to your **Vercel Dashboard** and select your project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add the following environment variables:
   * **Key**: `NEXT_PUBLIC_SUPABASE_URL` | **Value**: `<Your Supabase Project URL>`
   * **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Value**: `<Your Supabase Anon API Key>`
4. Choose the environments to apply these keys to (**Production**, **Preview**, **Development**).
5. Trigger a redeployment from your deployments tab to rebuild the static assets with the fresh environment configurations.
