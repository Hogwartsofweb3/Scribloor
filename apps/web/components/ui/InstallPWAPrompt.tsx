'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download, Share } from 'lucide-react';

export default function InstallPWAPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if already in standalone mode (installed app)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // 2. Check if user already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    if (dismissed) return;

    // 3. Track page views (must show after 3 page views)
    const viewsStr = localStorage.getItem('pwa-prompt-views') || '0';
    const views = parseInt(viewsStr) + 1;
    localStorage.setItem('pwa-prompt-views', views.toString());

    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDetected);

    // 4. If page views >= 3, prepare to show
    if (views >= 3) {
      if (iosDetected) {
        // iOS Safari doesn't support beforeinstallprompt, show directly if Safari
        const isSafari = /safari/.test(userAgent) && !/crios/.test(userAgent) && !/fxios/.test(userAgent);
        if (isSafari) {
          setShow(true);
        }
      } else {
        // Chrome/Android listener
        const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setShow(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Trigger Chrome/Android prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt user choice outcome: ${outcome}`);

    // Clean up
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto md:max-w-md z-[99999] pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="pointer-events-auto w-full p-4 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col gap-3 relative overflow-hidden"
        >
          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Heading content */}
          <div className="flex items-start gap-3 pr-6">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/15 text-violet-400 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100 font-sans leading-tight">
                Install Solscribe App
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-normal">
                Install Solscribe for faster reading, desktop access, and real-time native alerts.
              </p>
            </div>
          </div>

          {/* iOS instruction vs Android Install Button */}
          {isIOS ? (
            <div className="rounded-xl border border-violet-500/10 bg-violet-500/5 p-3 flex items-center gap-3">
              {/* Safari share icon illustration */}
              <div className="p-1.5 rounded-lg bg-zinc-950 text-zinc-400 shrink-0 border border-zinc-800 flex items-center justify-center">
                <Share className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-[11px] text-zinc-300 font-sans leading-normal">
                Tap the <span className="font-bold text-white">Share</span> button in Safari, then select <span className="font-bold text-white">Add to Home Screen</span>.
              </p>
            </div>
          ) : (
            <div className="flex gap-2.5 mt-1">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/50 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition text-xs font-semibold select-none"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white transition text-xs font-bold shadow-lg shadow-violet-500/10 select-none"
              >
                Install Now
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
