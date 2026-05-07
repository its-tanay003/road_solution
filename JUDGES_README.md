# JUDGES_README — ROADSoS | SIH 2026

## Project Summary

ROADSoS is an AI-powered road crash emergency response system built for India's national highway infrastructure.  
It detects crashes via G-force simulation, dispatches to the **108 GVK EMRI** network, provides multilingual AI triage,  
auto-files iRAD MoRTH reports, and encrypts all personal data client-side — all within the Golden Hour.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · Framer Motion · Zustand · i18next · Node.js/Express · Socket.io · Claude AI

---

## Quick Links

| Resource | Link |
| :--- | :--- |
| **Live Demo** | https://road-solution.vercel.app |
| **GitHub** | https://github.com/its-tanay003/road_solution |
| **Pitch Video** | [YouTube URL — pending upload] |
| **Research Page** | `/research` |
| **Scalability Plan** | `/roadmap` |
| **Security Page** | `/security` |

---

## Start Here — Evaluate in 5 Minutes

**Step 1:** Open the live URL → click **"⚡ Continue as Demo User (Judge Mode)"** — no signup required.

**Step 2:** You're now on the home screen. Press **`Shift+P`** → Presentation Mode.

**Step 3:** In the War Room (Dashboard), press:
- **`1`** — Urban Crash (G-force → 108 dispatch → AI triage → iRAD auto-report)
- **`2`** — Rural Mesh Failure (offline fallback demo)
- **`?`** — All keyboard shortcuts

---

## Authentication System

| Method | Status | Notes |
| :--- | :--- | :--- |
| Phone OTP | ✅ Live | OTP pre-filled in dev mode for easy testing |
| Email / Password | ✅ Live | bcrypt hash, 30-day JWT |
| Google OAuth | ✅ Wired | Requires `GOOGLE_CLIENT_ID` env var |
| Demo User bypass | ✅ Live | Judge-friendly one-click login |

---

## Security & Compliance

| Control | Implementation | Status |
| :--- | :--- | :--- |
| AES-GCM-256 | `crypto.subtle` — client-side, key never leaves device | ✅ Active |
| HTTPS + HSTS | Vercel managed TLS, 1-year HSTS header | ✅ Active |
| Helmet CSP | X-Frame-Options DENY, no inline scripts | ✅ Active |
| Rate limiting | 10/15min auth, 3/min OTP, 5/min SOS | ✅ Active |
| DPDP Act 2023 | Granular consent, right to erasure, data minimisation | ✅ Compliant |
| JWT Auth | 30-day tokens, HMAC-SHA256 | ✅ Active |

---

## Features Addressing SIH Problem Statement

| SIH Criterion | ROADSoS Feature | Status |
| :--- | :--- | :--- |
| Emergency detection | G-force SOS + voice trigger + hold-3s button | ✅ Live |
| 112 India integration | Simulated 112 alert + iRAD auto-report | ✅ Simulated |
| 108 ambulance coordination | GVK EMRI dispatch API simulation | ✅ Simulated |
| Bystander empowerment | 6-step wizard + voice narration + Good Samaritan info | ✅ Live |
| Multilingual | EN / HI / TA / TE / BN + 9 more (i18next) | ✅ Live |
| Data-driven (MoRTH) | iRAD format incident export, NH black spots | ✅ Live |
| Offline/rural capability | Mesh mode + PWA offline-first | ✅ Simulated |
| Data security | AES-GCM-256 client-side encryption + DPDP compliance | ✅ Live |
| Scalability evidence | /roadmap — 3-phase pilot plan with cost model | ✅ Live |

---

## MoRTH Impact Data (as of 2024)

- **1,78,000+** road crash deaths annually (MoRTH Annual Report 2024)
- **50% deaths** occur within 1 hour — the "Golden Hour" gap
- **108 ambulance** median response time: 14 min (urban) / 28 min (rural)
- ROADSoS target: **< 6 min** notification-to-dispatch in pilot corridors

---

## Contact

**Team Lead:** [Name] — [phone] — [email]  
**Institution:** [Institute Name]  
**SIH Node:** [Node City]
