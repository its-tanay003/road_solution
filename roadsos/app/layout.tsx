import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { BottomNav } from '@/components/nav/BottomNav';
import { PanicMode } from '@/components/sos/PanicMode';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { VoiceCommands } from '@/components/voice/VoiceCommands';
import { SensorWatcher } from '@/components/sensors/SensorWatcher';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'ROADSoS — Emergency Response Platform',
  description: 'AI-powered emergency response and SOS platform with real-time maps, triple AI assistant, and multi-channel alerts.',
  keywords: ['emergency', 'SOS', 'road accident', 'first aid', 'ambulance', '112', '108'],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'ROADSoS' },
  openGraph: {
    title: 'ROADSoS — Emergency Response Platform',
    description: 'Your AI-powered lifeline in road emergencies.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans bg-gray-950 text-white antialiased transition-colors duration-300`}>
        <Providers>
          {/* Global overlays */}
          <PanicMode />
          <VoiceCommands />
          <SensorWatcher />
          <ChatWidget />
          <Toaster position="top-center" richColors />

          {/* Page content */}
          <main className="min-h-screen">{children}</main>

          {/* Persistent bottom nav */}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

