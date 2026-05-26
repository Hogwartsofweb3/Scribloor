'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if permanently dismissed
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Track page views
    const views = parseInt(localStorage.getItem('pwa_page_views') || '0', 10) + 1;
    localStorage.setItem('pwa_page_views', views.toString());

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      if (views >= 3) {
        setShowPrompt(true);
      }
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      if (views >= 3) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-card border border-border rounded-xl shadow-lg p-4 z-50 flex flex-col gap-3 animate-in slide-in-from-bottom-10">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="text-primary w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h4 className="font-semibold text-sm">Install Solscribe</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {isIOS 
              ? "To install: tap Share below, then 'Add to Home Screen'."
              : "Install the app for a faster, offline-capable experience."}
          </p>
        </div>
      </div>
      
      {!isIOS && isInstallable && (
        <Button onClick={handleInstall} className="w-full text-sm mt-1" size="sm">
          Install App
        </Button>
      )}
    </div>
  );
}
