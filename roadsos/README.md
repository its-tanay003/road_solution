# ROADSoS - Core Web Platform

This is the primary Next.js 14 (App Router) workspace for the **ROADSoS** platform, bootstrapped using `create-next-app` and fully customized for high-availability emergency response.

For complete project documentation, including the Technical Manifesto, Deployment Roadmap, and overarching Architecture, please see the [Root README](../README.md) and [DevOps Guide](../DEVOPS_GUIDE.md).

## 🚀 Quick Start

Ensure you are in the `roadsos` directory, then install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Modify pages in the `app/` directory.

---

## 🚗 Automotive Integration Setup

### 📱 iOS Siri Shortcuts Configuration
To integrate ROADSoS triggers with iOS Siri Shortcuts:
1. Open the **Shortcuts** app on your iOS device.
2. Create a new shortcut and title it: `Hey Siri, Emergency` or `Activate SOS`.
3. Add the **Open URLs** action.
4. Set the URL target to: `https://<your-domain>/?sos=activate` (or `http://localhost:3000/?sos=activate` for local environments).
5. Add another shortcut `Drive Dashboard` pointing to `https://<your-domain>/?automotive=1` to launch directly in CarPlay display mode.

### 🤖 Android Auto Developer Mode Setup
To emulate the Android Auto head unit interface for debugging:
1. On your Android phone, navigate to **Settings** > **Advanced features** > **Android Auto**.
2. Scroll to the bottom and tap **Version** 10 times consecutively to enable **Developer settings**.
3. Tap the three-dot menu in the top right and select **Developer settings**.
4. Check the box for **Unknown sources** to allow local PWAs.
5. Select **Start Head Unit Server** from the menu.
6. Connect your phone to your development PC via USB, then run:
   ```bash
   adb forward tcp:5277 tcp:5277
   ```
7. Open the Desktop Head Unit (DHU) tool from the Android SDK to see the high-contrast dashboard running.
