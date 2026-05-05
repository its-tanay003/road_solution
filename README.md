# ROADSoS: Emergency Intelligence Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Froadsos&env=OPENROUTER_API_KEY,VITE_API_URL,VITE_SOCKET_URL)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blueviolet?style=for-the-badge)](https://your-app.vercel.app)

ROADSoS is an AI-powered emergency response platform designed to optimize the "Golden Hour" of survival for road crash victims. By fusing real-time telemetry, vision-AI triage, and peer-to-peer mesh networking, ROADSoS bridges the critical gap between incident detection and professional medical intervention.

## 🛠️ Tech Stack

![React 19](https://img.shields.io/badge/React%2019-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Tailwind 4](https://img.shields.io/badge/Tailwind%20CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## ✨ New & Advanced Features

### 1. Neural Triage & AI Decision Core

- **Real-Time Conversational AI**: Upgraded backend utilizing the OpenRouter SDK for high-speed, robust AI triage.
- **"AI Thinking" Overlay**: Transparent logic streaming that details the system's thought process (e.g., "Analyzing crash dynamics", "Selecting nearest ALS responder").
- **Multilingual Support (India Focus)**: Full UI and AI triage support for **English, Hindi (हिन्दी), and Tamil (தமிழ்)** to ensure accessibility across diverse demographics.

### 2. Immersive Crisis UI & Panic Mode

- **Panic Mode Overlay**: High-contrast, accessibility-first design with large (80px) touch targets for extreme stress scenarios.
- **Advanced Emergency Button**: Features "Hold-to-SOS" mechanics and device haptic feedback.
- **Sensory Awareness**: Integrates Screen Wake Lock API and Gyroscope detection.
- **Cinematic Experience**: High-stress visual overlays, heartbeat audio cues, and red-alert UI states.
- **Precision Layering**: Meticulously structured z-index management ensuring crucial elements (War Room, Hospitals, Data Reliability) always take visual priority over tactical maps.

### 3. Interactive Bystander Mode (Good Samaritan Friendly)

A dedicated workflow empowering untrained bystanders to assist effectively during the Golden Hour:

- **Guided First Aid**: Step-by-step visual and voice-guided medical assistance.
- **Good Samaritan Law Info**: Built-in information regarding India's Good Samaritan laws to encourage bystander intervention without fear of legal repercussions.
- **Location & Status Sharing**: Rapid transmission of victim status and exact coordinates to dispatchers.

### 4. Data Reliability Center

- **Live Telemetry Dashboard**: Real-time health checks and latency pings across all integrated APIs (OpenStreetMap, Google Places, OSRM, etc.).
- **Accuracy Scores**: Dynamic visualizations detailing the integrity and freshness of the data pipeline.
- **Data Guarantee**: Full transparency on system version history and service uptime.

### 5. Resilient Architecture & Deployment

- **Multi-Service Vercel Deployment**: Configured via an `experimentalServices` `vercel.json` file to independently route and scale the Vite frontend (`/`) and the Node.js backend (`/_/backend`) within a monorepo.
- **Mesh Mode Simulation**: P2P communication logic designed as a fallback for internet-deprived or rural environments.
- **Offline-First PWA**: Service Worker integration for sub-second UI responsiveness and map caching even in unstable network conditions.

### 6. Autonomous Drone Dispatch Simulation

- **Drone Triage**: Automated dispatch of "ROADSoS Recon DR-1" drones within 90 seconds of crash detection.
- **Visual Recon**: Real-time video transmission from incident scenes to dispatchers via simulated drone-mounted cameras.
- **Flight Path Visualization**: Dynamic mapping of drone trajectories from regional hubs (e.g., Chennai Guindy) to incident coordinates.

### 7. Responder AR Guidance & Tactical HUD

- **Precision AR Navigation**: 3D spatial guidance for responders utilizing Three.js, projecting critical turn-by-turn data and "Golden Hour" countdowns onto a tactical HUD.
- **Vaahan Integration**: Real-time vehicle telemetry (owner, insurance, PUC) queried via TN-RTO databases to provide responders with victim-vehicle context.
- **Impact Simulation**: High-fidelity crash physics breakdown (G-force, deceleration, impact point) for precise medical preparation.

### 8. Presentation & Pitch Mode

- **Immersive Fullscreen Deck**: Built-in 5-slide pitch deck for hackathon presentations, featuring live-ticking casualty counters and platform architecture deep-dives.
- **Demo Orchestration**: A central "War Room" HUD allowing judges/presenters to trigger specific scenarios (Urban Crash, Rural Mesh, Bystander Intervention) and control time dilation.
- **Operational Shortcuts**: Comprehensive keyboard-driven architecture for rapid, error-free live demonstrations.

## 🏛️ Government-Ready Architecture

ROADSoS is engineered for multi-agency interoperability, ensuring that emergency signals from civilian devices are seamlessly translated into actionable data for national and local institutions.

### Interoperability & India-Specific Standards

- **iRAD (MoRTH India) Integration**: Real-time synchronization with the Integrated Road Accident Database (Ministry of Road Transport and Highways, India) for automated accident reporting.
- **112 India Alerting**: Simulation of emergency signals to India's unified '112' emergency response system.
- **National Highway Black Spots**: Integrated heatmap utilizing historical MoRTH data to alert drivers and responders to critical accident-prone zones.
- **WHO Global Registry**: Automated reporting in ICD-10-CM format.
- **Hospital HIE**: Real-time trauma bed availability and ER wait-time telemetry via HL7/FHIR channels.

### Security & Compliance
- **Zero-Knowledge Architecture**: Patient medical data is encrypted on-device using AES-GCM-256.
- **GovCloud Compatible**: Designed for deployment within isolated, high-compliance government cloud environments.

## 🚀 Technical Stack & Production Stability

The platform has undergone rigorous production hardening to ensure zero-error builds and reliable real-time performance.

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Framer Motion, Leaflet
- **Backend**: Node.js (Express), Socket.io, Redis, OpenRouter SDK
- **Hardening**: Resolved complex TypeScript redeclaration issues, standardized browser/node timer typings, and optimized Tailwind 4 design tokens for production stability.
- **Intelligence**: Multi-model routing (Claude/OpenAI via OpenRouter) for Vision & Triage
- **Networking**: WebRTC P2P Mesh Fallback
- **Observability**: Prometheus & Recharts
- **Deployment**: Vercel (Experimental Multi-Service Monorepo)

## 🛠️ Getting Started

1. Clone the repository and install dependencies in both `backend` and `frontend` directories.
2. Configure your `.env` files. Ensure you provide your `OPENROUTER_API_KEY`.
3. To run locally, use the concurrent script from the root:

```bash
npm run dev
```

*This starts both the Vite frontend and Node backend simultaneously.*

4. Access the demo at `http://localhost:5173`.
