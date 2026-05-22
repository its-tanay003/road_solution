# ROADSoS

ROADSoS is an emergency response web platform for crash/SOS workflows, user medical profiles, emergency contacts, real-time maps, AI triage, and responder/admin control-room views.

## Production Source Of Truth

The production application is `roadsos/`, a Next.js App Router workspace using React 19, NextAuth v5, Supabase, Tailwind CSS 4, Playwright, and Vercel.

Legacy folders remain for reference:

- `frontend/`: previous Vite implementation. Not the production target.
- `backend/`: previous Express/Socket.io backend. Not the production deploy path unless explicitly revived.
- `archive/`: historical demo/hackathon material.

## Current Production Status

This repository must pass the `roadsos` verification gates before being considered production-ready:

```powershell
cd "C:/New Volume (D)/mandi/roadsos"
npm ci
npm run lint
npm run typecheck
npm run audit:prod
npm run build
npm run test:e2e
```

Do not promote a deployment if any of these fail.

## Required Environment

Copy `.env.example` to `roadsos/.env.local` for local development, then configure the same values in Vercel for Preview and Production.

Required categories:

- NextAuth secret and canonical app URL.
- Supabase URL, anon key, and service-role key.
- OAuth providers for Google and/or Apple.
- Admin operator email allowlist.
- Google Maps, AI provider keys, and emergency notification provider keys.

Never commit filled `.env`, `.env.local`, or backup env files.

## Deployment

The root `vercel.json` builds `roadsos`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build --prefix roadsos",
  "installCommand": "npm ci --prefix roadsos",
  "outputDirectory": "roadsos/.next"
}
```

The Vercel project must use the repository root as its root directory. If Vercel is configured to use `frontend/` as the project root, production will deploy the legacy Vite app instead of ROADSoS Next.js.

## Security Notes

- Credentials auth and mock OAuth fallbacks are intentionally disabled.
- Protected application and API routes are guarded by the Next.js proxy.
- Admin/control-room access requires a valid session with an email listed in `ADMIN_EMAILS`.
- Supabase RLS must be verified against the live Supabase project before launch.
- Any previously committed secrets must be rotated in their provider dashboards.

## CI

GitHub Actions runs lint, typecheck, production dependency audit, build, and Playwright browser tests for `roadsos`. CI is a release gate, not a suggestion.
