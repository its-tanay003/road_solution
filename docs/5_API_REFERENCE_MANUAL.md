# 5. REST API Reference Manual

> **API Base URL:** `https://roadsos.vercel.app` (Production) / `http://localhost:3000` (Local)  
> **Protocol:** HTTPS / JSON REST  
> **Global Rate Limit:** 5 requests / 60 seconds per IP (Emergency routes)  

---

## 1. Global Specifications

### 1.1 Request Headers
Every standard transactional request to the ROADSoS server must contain the following HTTP headers:

```http
Content-Type: application/json
Accept: application/json
```

### 1.2 Authentication
Protected routes are protected by NextAuth v5 session middleware. The browser automatically forwards authorization cookies (`__Secure-next-auth.session-token` or `next-auth.session-token`). If a request lacks a valid session token, the server returns a `401 Unauthorized` response.

---

## 2. API Endpoints Catalog

### 2.1 Post Emergency SOS Report (`POST /api/sos`)
The primary gateway for submitting incident telemetry. This endpoint inserts the distress entry into the Supabase database, parses user emergency contacts, and sends SMS notifications via Twilio containing geolocative Google Maps coordinates.

* **Authorization:** Required (Authenticated Citizen Session)
* **Rate Limit:** 5 requests per 60 seconds per IP

#### Request Payload
```json
{
  "incidentId": "d3b07384-d113-4956-be7f-7128e469c84e",
  "lat": 23.022505,
  "lng": 72.571401,
  "address": "Navrangpura, Ahmedabad, Gujarat, India",
  "batteryLevel": 88,
  "networkType": "4g",
  "emergencyType": "road_crash",
  "triggerType": "manual",
  "emergencyContacts": [
    {
      "name": "Sarah Connor",
      "phone": "+919876543210"
    }
  ]
}
```

#### Response Payload (Success: `200 OK`)
```json
{
  "success": true,
  "incidentId": "d3b07384-d113-4956-be7f-7128e469c84e",
  "broadcastStatus": {
    "sms": "sent",
    "whatsapp": "link_generated",
    "push": "sent",
    "email": "sent",
    "websocket": "broadcast",
    "bluetooth": "attempted"
  },
  "responder": {
    "name": "Ambulance Unit #7",
    "lat": 23.018503,
    "lng": 72.569402,
    "etaMinutes": 6
  },
  "message": "Emergency services notified."
}
```

---

### 2.2 Manage Medical Profiles (`GET` / `PUT /api/profile`)
Enables reading and editing of critical medical passport and personal profile details.

* **Authorization:** Required (Authenticated Session matching Profile ID)
* **Rate Limit:** 30 requests per minute

#### Request Payload (`PUT /api/profile`)
```json
{
  "name": "Alex Mercer",
  "phone": "+919988776655",
  "date_of_birth": "1994-06-15",
  "blood_group": "AB+",
  "allergies": ["Penicillin", "Peanuts"],
  "medical_conditions": ["Asthma"],
  "home_address": "402 Skyline Apartments, Girdhar Nagar, Ahmedabad"
}
```

#### Response Payload (Success: `200 OK`)
```json
{
  "success": true,
  "profile": {
    "id": "e4c02283-e456-4254-be7f-7128e469c99d",
    "name": "Alex Mercer",
    "phone": "+919988776655",
    "date_of_birth": "1994-06-15",
    "blood_group": "AB+",
    "medical_data": {
      "allergies": ["Penicillin", "Peanuts"],
      "medical_conditions": ["Asthma"],
      "home_address": "402 Skyline Apartments, Girdhar Nagar, Ahmedabad"
    },
    "updated_at": "2026-05-28T09:12:45.000Z"
  }
}
```

---

### 2.3 Send AI First-Aid Query (`POST /api/ai`)
Connects with Google Gemini / Claude models loaded with clinical first-aid instructions to deliver instant first-aid recommendations during high-stress scenarios.

* **Authorization:** Required (Authenticated Session)
* **Rate Limit:** 10 requests per minute

#### Request Payload
```json
{
  "sessionId": "a823b123-e112-4254-be7f-7128e469c77c",
  "message": "My passenger is bleeding heavily from a deep cut on his left forearm after a glass shatter. What should I do immediately?",
  "language": "en"
}
```

#### Response Payload (Success: `200 OK`)
```json
{
  "success": true,
  "reply": "⚠️ **CRITICAL FIRST AID ACTION REQUIRED: BLEEDING CONTROL**\n\n1. **Apply Direct Pressure:** Press a clean cloth or sterile bandage firmly onto the forearm wound. Keep pressing continuously.\n2. **Elevate the Arm:** Raise the victim's left arm above the level of their heart if possible to slow blood flow.\n3. **Do Not Remove Cloths:** If blood seeps through, place another cloth on top. Do not peel the original cloth off as it disrupts clotting.\n4. **Keep Warm & Calm:** Cover the victim with a jacket to prevent shock.\n\n*Emergency responders have been alerted of your telemetry. Focus on holding pressure.*",
  "languageUsed": "en"
}
```

---

## 3. Error and Exception Catalog

The ROADSoS API uses a standard error format to convey failures, providing clear client-side context:

```json
{
  "error": "Error identification string",
  "details": "Human readable technical explanation"
}
```

### 3.1 HTTP Status Codes Map

| Status Code | Description | Origin Scenario |
| :--- | :--- | :--- |
| **`400 Bad Request`** | Input validation failure | Missing parameters (e.g., coordinates, address) on `/api/sos`. |
| **`401 Unauthorized`** | Authentication failure | Session token expired, invalid, or missing in protected endpoints. |
| **`403 Forbidden`** | Privilege breach | Citizen trying to access administrative `/control-room` API channels without operator privileges. |
| **`429 Too Many Requests`** | Rate limiting activation | Exceeded standard transaction rates on SOS trigger endpoints. |
| **`500 Internal Error`** | Server malfunction | Failure in external services (e.g., Twilio outage or Database connection issues). |
