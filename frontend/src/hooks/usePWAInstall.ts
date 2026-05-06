import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the default browser banner
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setInstallable(true);
      // Also save to window for global access if needed
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installable (if event fired before component mount)
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setInstallable(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  return { installable, handleInstallClick };
};
