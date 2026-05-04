# ROADSoS: Emergency Intelligence Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Froadsos&env=OPENROUTER_API_KEY,VITE_API_URL,VITE_SOCKET_URL)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blueviolet?style=for-the-badge)](https://your-app.vercel.app)

ROADSoS is an AI-powered emergency response platform designed to optimize the "Golden Hour" of survival for road crash victims. By fusing real-time telemetry, vision-AI triage, and peer-to-peer mesh networking, ROADSoS bridges the critical gap between incident detection and professional medical intervention.

### 🛠️ Tech Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![OpenRouter AI](https://img.shields.io/badge/OpenRouter%20AI-Anthropic/OpenAI-orange?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

## ✨ New & Advanced Features

### 1. Neural Triage & AI Decision Core
- **Real-Time Conversational AI**: Upgraded backend utilizing the OpenRouter SDK for high-speed, robust AI triage.
- **"AI Thinking" Overlay**: Transparent logic streaming that details the system's thought process (e.g., "Analyzing crash dynamics", "Selecting nearest ALS responder").
- **Optimized Chat Interface**: Improved accessibility, UI responsiveness, and reliable streaming for critical emergency dialogues.

### 2. Immersive Crisis UI & Panic Mode
- **Panic Mode Overlay**: High-contrast, accessibility-first design with large (80px) touch targets for extreme stress scenarios.
- **Advanced Emergency Button**: Features "Hold-to-SOS" mechanics and device haptic feedback.
- **Sensory Awareness**: Integrates Screen Wake Lock API and Gyroscope detection.
- **Cinematic Experience**: High-stress visual overlays, heartbeat audio cues, and red-alert UI states.
- **Precision Layering**: Meticulously structured z-index management ensuring crucial elements (War Room, Hospitals, Data Reliability) always take visual priority over tactical maps.

### 3. Interactive Bystander Mode
A dedicated workflow empowering untrained bystanders to assist effectively during the Golden Hour:
- **Guided First Aid**: Step-by-step visual and voice-guided medical assistance.
- **Location & Status Sharing**: Rapid transmission of victim status and exact coordinates to dispatchers.

### 4. Data Reliability Center
- **Live Telemetry Dashboard**: Real-time health checks and latency pings across all integrated APIs (OpenStreetMap, Google Places, OSRM, etc.).
- **Accuracy Scores**: Dynamic visualizations detailing the integrity and freshness of the data pipeline.
- **Data Guarantee**: Full transparency on system version history and service uptime.

### 5. Resilient Architecture & Deployment
- **Multi-Service Vercel Deployment**: Configured via an `experimentalServices` `vercel.json` file to independently route and scale the Vite frontend (`/`) and the Node.js backend (`/_/backend`) within a monorepo.
- **Mesh Mode Simulation**: P2P communication logic designed as a fallback for internet-deprived or rural environments.
- **Offline-First PWA**: Service Worker integration for sub-second UI responsiveness and map caching even in unstable network conditions.

## 🏛️ Government-Ready Architecture

ROADSoS is engineered for multi-agency interoperability, ensuring that emergency signals from civilian devices are seamlessly translated into actionable data for national and local institutions.

### Interoperability Standards
- **NHTSA FARS Integration**: Real-time synchronization with the National Highway Traffic Safety Administration's Fatality Analysis Reporting System.
- **911 CAD Orchestration**: Direct API bridging with Computer-Aided Dispatch (CAD) systems.
- **WHO Global Registry**: Automated reporting in ICD-10-CM format.
- **Hospital HIE**: Real-time trauma bed availability and ER wait-time telemetry via HL7/FHIR channels.

### Security & Compliance
- **Zero-Knowledge Architecture**: Patient medical data is encrypted on-device using AES-GCM-256.
- **GovCloud Compatible**: Designed for deployment within isolated, high-compliance government cloud environments.

## 🚀 Technical Stack Breakdown

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Framer Motion, Leaflet
- **Backend**: Node.js (Express), Socket.io, Redis, OpenRouter SDK
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
