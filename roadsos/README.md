This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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

