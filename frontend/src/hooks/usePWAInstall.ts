import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [installable, setInstallable] = useState(!!window.deferredPrompt);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    window.deferredPrompt || null
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent the default browser banner
      event.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(event);
      setInstallable(true);
      // Also save to window for global access if needed
      window.deferredPrompt = event;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallable(false);
      setDeferredPrompt(null);
      window.deferredPrompt = undefined;
    }
  };

  return { installable, handleInstallClick };
};

