# ROADSoS DevOps Guide

## Deployment Target

Deploy `roadsos/` as the only production web app. The root `vercel.json` is configured for this target.

The Vercel project root directory must be the repository root. A Vercel project root of `frontend/` will deploy the legacy Vite app and is incorrect for production.

## Local Verification

```powershell
cd "C:/New Volume (D)/mandi/roadsos"
npm ci
npm run lint
npm run typecheck
npm run audit:prod
npm run build
npm run test:e2e
```

## Environment Variables

Use `.env.example` as the template. Filled secrets belong only in `roadsos/.env.local`, Vercel environment variables, or the relevant provider dashboard.

Required groups:

- `AUTH_SECRET` / `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Supabase URL, anon key, service-role key
- `ADMIN_EMAILS`
- Google/Apple OAuth credentials
- Google Maps key
- AI provider keys
- Twilio, Resend, and VAPID notification keys

## Secret Rotation

If any real key has appeared in a committed file, rotate it at the provider immediately. Editing the repository does not invalidate exposed keys.

Rotate at minimum:

- Supabase anon and service-role keys
- Google OAuth secrets
- Google AI/Gemini keys
- VAPID keys
- Twilio/Resend keys if they were ever committed

## Supabase

Before launch:

- Apply schema migrations intentionally.
- Verify RLS policies in the live Supabase project.
- Test user, admin, and unauthenticated access separately.
- Verify storage buckets and object policies for uploaded emergency media.

The migration `roadsos/supabase/migrations/202605220001_security_hardening.sql` addresses the latest advisor findings observed on the ROADSoS Supabase project: duplicate profile policies, missing foreign-key indexes, RLS-enabled tables without policies, public execution of the custom `rls_auto_enable()` helper, and RLS on `public.spatial_ref_sys`. Review and apply it deliberately because enabling RLS on extension-owned metadata can affect clients that read PostGIS metadata.

## CI/CD

GitHub Actions must pass before merging to `main`.

Recommended branch protections:

- Require the ROADSoS CI workflow.
- Require pull request review.
- Block force pushes to `main`.
- Require Vercel preview success before production promotion.

## Incident Readiness

Production still needs provider-level observability: Vercel logs, Supabase logs, error tracking, uptime checks, and restore-tested database backups.
