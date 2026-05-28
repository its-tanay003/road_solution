# 🚑 ROADSoS: Emergency Intelligence & SOS Platform

ROADSoS is a real-time, emergency-response platform designed to streamline the crash response pipeline. By combining **Next.js 15 App Router**, **Supabase Real-Time CDC**, **WebRTC live distress feeds**, **Automotive Car Mode**, and **Generative AI Triage**, ROADSoS bridges the critical communication gap between citizens in distress and emergency service dispatch centers.

---

## 📂 Project Submission Documentation Suite

We have compiled a comprehensive, premium **7-Volume Project Submission Documentation Suite** designed to satisfy rigorous academic, technical, and executive panel evaluations. You can access each volume directly via the links below:

| Volume | Document Link | Focus & Substantive Themes |
| :---: | :--- | :--- |
| **Vol. 1** | [1_PROJECT_SYNOPSIS.md](file:///c:/New%20Volume%20(D)/mandi/docs/1_PROJECT_SYNOPSIS.md) | Executive abstract, Golden Hour problem statement, key differentiators, tech stack, modular roadmap. |
| **Vol. 2** | [2_SRS_DOCUMENT.md](file:///c:/New%20Volume%20(D)/mandi/docs/2_SRS_DOCUMENT.md) | IEEE 830-1998 standard Software Requirements Specification, functional/non-functional requirements catalog, SOS lifecycle state and sequence diagrams (Mermaid format). |
| **Vol. 3** | [3_SYSTEM_ARCHITECTURE_AND_DESIGN.md](file:///c:/New%20Volume%20(D)/mandi/docs/3_SYSTEM_ARCHITECTURE_AND_DESIGN.md) | Client-server tiers, Next.js Route map, WebRTC peer-connection/signaling logic via Supabase CDC, and Car Mode responsive adapter calculations. |
| **Vol. 4** | [4_DATABASE_SCHEMA_AND_SECURITY.md](file:///c:/New%20Volume%20(D)/mandi/docs/4_DATABASE_SCHEMA_AND_SECURITY.md) | Relational database schema data dictionaries, conceptual ERD (Mermaid), Row Level Security (RLS) policies audit, and SQL automation triggers. |
| **Vol. 5** | [5_API_REFERENCE_MANUAL.md](file:///c:/New%20Volume%20(D)/mandi/docs/5_API_REFERENCE_MANUAL.md) | Formally drafted REST API reference contracts with exact request/response JSON schemas, rate limits, and error status code logs. |
| **Vol. 6** | [6_USER_AND_OPERATOR_MANUAL.md](file:///c:/New%20Volume%20(D)/mandi/docs/6_USER_AND_OPERATOR_MANUAL.md) | Visual and step-by-step user guide for Citizens (including Shake-to-SOS & Car Mode) and Dispatch Operators (dashboard radar & dispatch workflows). |
| **Vol. 7** | [7_DEVOPS_AND_DEPLOYMENT_GUIDE.md](file:///c:/New%20Volume%20(D)/mandi/docs/7_DEVOPS_AND_DEPLOYMENT_GUIDE.md) | Local installation guide, `.env.local` template, Supabase SQL migration script setup, Google Cloud OAuth console configurations, Vercel host pipelines, and Playwright verification checks. |

---

## 🛠️ Production Architecture Quick-View

The active production source of truth is:
`C:/New Volume (D)/mandi/roadsos`

- **Primary Stack:** Next.js App Router (React 19), NextAuth v5, Supabase, Tailwind CSS 4, Google Maps, Gemini/Claude AI.
- **Verification Gates:** Before promoting any code to production, all local validation gates must pass:
  ```powershell
  cd "C:/New Volume (D)/mandi/roadsos"
  npm ci
  npm run lint
  npm run typecheck
  npm run audit:prod
  npm run build
  npm run test:e2e
  ```

---

## 📦 Directory Structure

- `roadsos/` — Active production Next.js application workspace.
- `docs/` — Premium 7-Volume project submission documentation.
- `frontend/` — Previous legacy Vite implementation (for reference).
- `backend/` — Previous legacy Express/Socket.io backend (for reference).
- `archive/` — Historical demo and hackathon materials.

