# 7. DevOps & Deployment Manual

> **Runtime:** Node.js v20+ / npm v10+  
> **Testing Suite:** Playwright E2E Browser Testing  
> **Production Platform:** Vercel (Frontend & Serverless) + Supabase (Database & Realtime CDC)  

---

## 1. Local Development Environment Setup

Follow these steps to spin up the ROADSoS project on a local workstation:

### 1.1 Prerequisites
Ensure the following are installed:
- **Node.js** (v20.x or higher)
- **Git**
- A code editor (e.g., VS Code)

### 1.2 Installation Steps
1. Open your terminal (e.g., PowerShell on Windows) and navigate to the project directory:
   ```powershell
   cd "C:/New Volume (D)/mandi/roadsos"
   ```
2. Install all node packages using clean installation commands:
   ```powershell
   npm ci
   ```

### 1.3 Local Environment Variables Setup
Create a file named `.env.local` inside the `roadsos/` folder and configure the following template:

```ini
# NEXTAUTH SESSION CONFIGURATION
NEXTAUTH_SECRET="use-a-secure-random-32-character-string"
NEXTAUTH_URL="http://localhost:3000"

# SUPABASE SERVICES KEYS
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key"

# OAUTH AUTHENTICATION PROVIDERS
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-oauth-client-secret"

# EMERGENCY COMMUNICATIONS & NOTIFICATIONS
TWILIO_ACCOUNT_SID="ACyour-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+12015550199"

# CONTROL ROOM ADMINISTRATORS ALLOWLIST
ADMIN_EMAILS="operator1@example.com,admin@roadsos.in"

# GENERATIVE AI PROVIDERS
GEMINI_API_KEY="AIzaSyYourGeminiApiKey"
```

*Note: Never commit `.env.local` or raw secret keys to Git repositories.*

---

## 2. Database Schema & Migration Execution

To set up the Supabase database schema, you must apply the database migrations in order:

1. Log into your **Supabase Dashboard** and navigate to your project.
2. Open the **SQL Editor** in the left-hand navigation panel.
3. Click **New Query**.
4. Open the SQL migration files located under `roadsos/supabase/migrations/` and copy-paste their content into the query editor:
   - **Step 1:** Run the contents of `001_initial_schema.sql` (Creates base incidents, messages, and responder schemas).
   - **Step 2:** Run the contents of `202605270001_create_profiles_table.sql` (Sets up authenticated citizen profile tables, relationships, and updated RLS structures).
   - **Step 3:** Run the contents of `202605220001_security_hardening.sql` (Applies security patches, optimized indexes, and PostGIS metadata protections).
5. Click **Run** to execute the scripts.
6. Verify your tables are fully indexed under: *Database ➔ Tables* or *API ➔ Rest API Schema*.

---

## 3. OAuth Google Console Configuration

Since credentials-based passwords are disabled for security, NextAuth relies on OAuth providers. To set up Google Login:

1. Go to the **Google Cloud Console** (https://console.cloud.google.com).
2. Create a new project named **ROADSoS**.
3. Navigate to **APIs & Services ➔ Credentials**.
4. Click **Configure Consent Screen**, select *External*, and input your support emails.
5. Go back to Credentials, click **Create Credentials ➔ OAuth Client ID**.
6. Select **Web Application** as the application type.
7. Configure the redirect and origin parameters:
   - **Authorized JavaScript Origins:**
     - Local: `http://localhost:3000`
     - Production: `https://roadsos.vercel.app`
   - **Authorized Redirect URIs:**
     - Local: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://roadsos.vercel.app/api/auth/callback/google`
8. Click **Save** and copy the generated **Client ID** and **Client Secret** into your `.env.local` and Vercel Environment dashboard.

---

## 4. Production Vercel Deployment

To deploy the production ROADSoS Next.js app to Vercel:

1. Set the **Root Directory** of the Vercel project to the repository root directory (i.e. `./`).
2. Configure Vercel to compile the `roadsos/` subfolder using the following build settings:
   - **Framework:** `Next.js`
   - **Build Command:** `npm run build --prefix roadsos`
   - **Install Command:** `npm ci --prefix roadsos`
   - **Output Directory:** `roadsos/.next`
3. Add all variables from your `.env.local` file under *Vercel Project Settings ➔ Environment Variables*.
4. Trigger the deployment. Vercel will build and host the high-fidelity Next.js App Router workspace successfully.

---

## 5. Quality Assurance & E2E Testing with Playwright

To run local testing cycles and ensure all verification gates pass before pushing to production:

### 5.1 Run Local Verification Pipelines
Inside the `roadsos/` directory, run:

```powershell
# 1. Install correct browser test binaries
npx playwright install --with-deps

# 2. Run static analysis and linting
npm run lint

# 3. Execute TypeScript type checking
npm run typecheck

# 4. Trigger production build verification
npm run build

# 5. Run end-to-end browser integration tests
npm run test:e2e
```

### 5.2 Verification Gates Matrix
Ensure the following checks pass before promoting any deployment:

```
[ Lint Checked ] ➔ [ Typechecked ] ➔ [ Audited ] ➔ [ Playwright Passed ] ➔ [ DEPLOYED ]
```
- **Lint Check:** Ensure no missing imports or syntax formatting anomalies exist.
- **Typecheck:** Ensure all Next.js page contexts compile successfully.
- **E2E Testing:** Playwright will spin up automated browsers to simulate citizen SOS actions, ensuring mock responders and location tracking function perfectly.
