'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [flashOnline, setFlashOnline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial state
    const onlineState = navigator.onLine;
    setIsOnline(onlineState);
    if (!onlineState) {
      setShowBanner(true);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setFlashOnline(true);
      setShowBanner(true); // Keep open to show "Back online" flash
      
      // Dismiss after 2 seconds
      setTimeout(() => {
        setFlashOnline(false);
        setShowBanner(false);
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setFlashOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full shrink-0 z-[99999] overflow-hidden"
      >
        {flashOnline ? (
          /* Success: Back Online Flash (Green) */
          <div className="bg-emerald-500 text-white py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md font-sans">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Back online ✓
          </div>
        ) : (
          /* Warning: Offline Banner (Yellow/Amber) */
          <div className="bg-amber-500 text-zinc-950 py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md font-sans">
            <WifiOff className="w-4 h-4 shrink-0 text-zinc-900" />
            You're offline — some features unavailable
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
