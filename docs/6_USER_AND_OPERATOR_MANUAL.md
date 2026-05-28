# 6. User & Operator Manual

> **System Roles:** Citizen / Victim Panel & Dispatch Control Room Operator  
> **Key Capabilities:** Shake-to-SOS, Automotive Deck, Real-time Dispatch Radar, Live WebRTC Streaming  

---

## 1. Citizen Operations Manual

This section outlines how citizens and bystanders interact with the ROADSoS mobile-first Progressive Web Application (PWA).

### 1.1 First-Time Setup & Onboarding Wizard
To ensure emergency notifications function flawlessly, new users must complete the onboarding flow:

```
[ Welcome screen ] ➔ [ 1. Medical Details ] ➔ [ 2. Emergency Contacts ] ➔ [ Dashboard Active ]
```

1. **Medical Passport Data Entry:**
   - Input your full legal name, date of birth, and select your blood group.
   - List key drug allergies (e.g., Penicillin) and pre-existing medical conditions (e.g., Diabetes, Cardiac issues).
2. **Emergency Contacts Configuration:**
   - Input name, relationship, and active phone numbers.
   - Choose notifications preferences: SMS, WhatsApp, or Email alerts.

---

### 1.2 SOS Activation Workflows
ROADSoS supports multiple activation methods to accommodate different crash scenarios:

#### Workflow A: The Manual SOS Button
1. Tap and hold the **red emergency SOS button** on the home screen.
2. A continuous full-screen visual countdown will initiate (3, 2, 1).
3. **Important:** Release the button before the countdown finishes to cancel false triggers.
4. Once the countdown hits 0s, the screen transitions to **Distress mode**, activating GPS streaming and dispatch alerts.

#### Workflow B: Accelerometer Shake Detection
1. In high-impact crash situations, shake your phone vigorously.
2. An automatic **10-second countdown** dialog will appear.
3. If not manually cancelled, the platform will automatically trigger the SOS flow.

#### Workflow C: Hands-Free Voice Activation
1. When mounted on a vehicle dashboard, speak the activation phrase: **"Hey Emergency, send SOS!"**
2. The browser will capture the audio stream, match the trigger, and launch the 3-second countdown automatically.

---

### 1.3 Automotive "Car Mode" Deck
When mounted horizontally, the application shifts to the **Automotive Deck**:

![Automotive Car Mode Deck Mockup](https://raw.githubusercontent.com/its-tanay003/road_solution/main/docs/assets/carmode_preview.jpg "Car Mode UI Overview")

*Note: The image placeholder above maps to high-fidelity dashboard views.*

- **Hands-Free Drive Mode:** Voice listening is continuously active for the trigger phrase *"Hey Emergency"*.
- **Quick Dials:** Large, readable touch panels enable single-click calls to emergency lines (112, 108, 100).
- **Reduced Glare:** Deep pitch black background reduces vehicle cabin glare during night driving.

---

### 1.4 AI First-Aid Assistant & Crowdsourcing Map
- **AI Triage:** Tap the **AI Assistant** icon to open the chat screen. Describe physical injuries to receive step-by-step first-aid guidance.
- **Accident Reporting:** Navigate to the **Map** tab to view public accident reports. Tap the map to report a crash, select the severity (Minor, Moderate, Severe, Fatal), and upload photos to alert other drivers.

---

## 2. Emergency Dispatch Center (Control Room) Operator Manual

This section is dedicated to emergency services operators and control room dispatchers.

### 2.1 The Control Room Radar Board
The dispatcher console operates as a real-time command dashboard. Access requires administrative privileges (the user's email must be configured in `ADMIN_EMAILS`).

```
+-----------------------------------------------------------------------------------------+
|  ROADSoS Dispatch Center [Radar Active]                        Gateway: CONNECTED [ok]   |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [ Live Distress Broadcaster Card ]          [ Deployed Responder Units Radar ]         |
|  +-----------------------------+             +-------------------------------+          |
|  | Victim: John Doe            |             | Deployed: Ambulance #108      |          |
|  | Event: Vehicle Crash        |             | Assigned to: John Doe         |          |
|  | Blood Group: O+             |             | ETA: 6 mins                   |          |
|  | Location: NH8 Bypass        |             +-------------------------------+          |
|  |                             |                                                        |
|  | [ WebRTC Video Feed ]       |             [ Available Dispatch Line Units ]          |
|  | +-------------------------+ |             +-------------------------------+          |
|  | | Live Stream Active      | |             | [ ] Fire Rescue Unit #4 (Avail)|          |
|  | +-------------------------+ |             | [ ] Highway Patrol Unit (Avail)|          |
|  |                             |             +-------------------------------+          |
|  | [Assign Responder Button]   |                                                        |
|  +-----------------------------+                                                        |
+-----------------------------------------------------------------------------------------+
```

---

### 2.2 Handling an Active SOS Incident
When a citizen triggers an SOS:

1. **Instant Notification:** A high-alert chime sounds, and a new card immediately appears on the **Distress Broadcaster Streams** list.
2. **WebRTC Media Connection:** The card will secure an encrypted WebRTC media connection, streaming live ambient audio and video from the victim's device.
3. **Medical Telemetry Review:** Review the victim's profile card on the dashboard to access critical medical data (blood group, allergies, pre-existing conditions) and device telemetry (battery level, network quality).
4. **Deploying Responders:**
   - Click **Assign Responder**.
   - Input the estimated arrival duration (ETA) in minutes.
   - Choose a nearby responder unit (Ambulance, Police, or Fire Rescue) and click **Confirm Dispatch**.
   - The status updates to `acknowledged` in the database, and the victim is instantly notified.
5. **Marking Resolved:** Once responders confirm the situation is handled, click the **All-Clear** resolution toggle to archive the incident.
