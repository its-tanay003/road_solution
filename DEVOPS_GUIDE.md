# ROADSoS DevOps & Operations Guide

This guide serves as a brief dashboard for local commands and hosting parameters. For the complete, high-fidelity setup instructions, database schema seeding, OAuth consoles, Vercel edge pipelines, and Playwright verification metrics, please refer directly to:

👉 **[Volume 7: DevOps and Deployment Manual](file:///c:/New%20Volume%20(D)/mandi/docs/7_DEVOPS_AND_DEPLOYMENT_GUIDE.md)**

---

## 🚀 Core Local Commands

Run these checks within the `roadsos/` folder before launching or compiling:

```powershell
cd "C:/New Volume (D)/mandi/roadsos"

# 1. Clean dependencies installation
npm ci

# 2. Dynamic lint check
npm run lint

# 3. TypeScript type validation
npm run typecheck

# 4. Production vulnerability audit
npm run audit:prod

# 5. Native Next.js bundle build
npm run build

# 6. E2E Browser Playwright simulation
npm run test:e2e
```

Do not promote any preview deployment to production if any verification gates fail.

---

## 🔑 Key Operational Secrets

Ensure the following configuration tokens are mapped in your local `.env.local` or Vercel edge dashboard:

- `AUTH_SECRET` / `NEXTAUTH_SECRET` — Session authentication encryption.
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Client database connection.
- `SUPABASE_SERVICE_ROLE_KEY` — Bypasses Row Level Security (RLS) policies for administrative profile creation.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` — OAuth single sign-on parameters.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — Dispatches SOS SMS/WhatsApp alerts.
- `ADMIN_EMAILS` — Access permission allowlist for the dispatcher control room dashboard.
- `GEMINI_API_KEY` — Conversational first aid assistant prompts.

---

## 🛠️ Production Build Target
- **Platform:** Vercel Hosting
- **Root Directory:** Repository Root (`./`)
- **Compile Settings:**
  - Build Command: `npm run build --prefix roadsos`
  - Install Command: `npm ci --prefix roadsos`
  - Output Directory: `roadsos/.next`
