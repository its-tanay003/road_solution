# ROADSoS Next.js App

This is the production ROADSoS web app.

## Quick Start

```powershell
cd "C:/New Volume (D)/mandi/roadsos"
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verification

```powershell
npm run lint
npm run typecheck
npm run audit:prod
npm run build
npm run test:e2e
```

## Auth Model

ROADSoS uses NextAuth v5 OAuth providers. Mock credentials and fallback secrets are not allowed.

Admin/control-room access requires:

- A valid authenticated session.
- The signed-in user's email listed in `ADMIN_EMAILS`.

## Database

Supabase is the system of record for profiles, emergency contacts, incidents, push subscriptions, and related operational data. RLS policies must be verified on the live project before launch.
