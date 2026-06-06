'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, Check, Twitter, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// SVGs for WhatsApp, Telegram, and Farcaster (Warpcast)
const FarcasterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.98 1.25-5.59 3.69-.53.36-1 .54-1.43.53-.47-.01-1.37-.27-2.05-.49-.83-.27-1.49-.41-1.43-.87.03-.24.37-.49 1.03-.75 4.04-1.76 6.74-2.92 8.1-3.48 3.84-1.6 4.64-1.88 5.16-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07 0 .16-.01.23z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.05 4.91A10 10 0 0 0 2.26 13.9c0 .73.08 1.44.24 2.13L1 23l7.21-1.89c.77.2 1.56.31 2.37.31 5.51 0 9.99-4.48 9.99-9.99a9.96 9.96 0 0 0-1.52-6.52zm-8.47 13.3c-1.37 0-2.71-.37-3.88-1.07l-.28-.16-4.28 1.12 1.14-4.17-.18-.29A8.25 8.25 0 0 1 1.9 8.82c0-4.57 3.72-8.29 8.3-8.29 2.22 0 4.31.86 5.88 2.43 1.57 1.57 2.43 3.66 2.43 5.88a8.28 8.28 0 0 1-7.93 8.29zm4.55-6.22c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.55.12-.17.25-.65.81-.8 1-.15.17-.3.2-.55.08a6.93 6.93 0 0 1-2.04-1.26 7.6 7.6 0 0 1-1.41-1.76c-.15-.25-.02-.39.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.55-1.33-.75-1.83-.2-.48-.39-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.23-.85.83-.85 2.03 0 1.2.87 2.37 1 2.53.12.17 1.7 2.6 4.12 3.65 2.42 1.05 2.42.7 2.87.66.45-.04 1.47-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.22-.48-.35z" />
  </svg>
);

export default function ShareSheet() {
  const { activeModal, modalProps, closeModal } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, []);

  if (activeModal !== 'share') return null;

  const {
    url = typeof window !== 'undefined' ? window.location.href : '',
    title = 'Solscribe',
    description = 'Read premium Web3 newsletters on Solscribe.',
  } = modalProps as {
    url?: string;
    title?: string;
    description?: string;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error('[Web Share API] Error sharing:', err);
      }
    }
  };

  const shareX = () => {
    const text = encodeURIComponent(`${title} — ${description}\n`);
    window.open(`https://x.com/intent/post?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareFarcaster = () => {
    const text = encodeURIComponent(`${title} — ${description}\n${url}`);
    window.open(`https://warpcast.com/~/compose?text=${text}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${title}: ${description} ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`${title} — ${description}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl z-10 flex flex-col gap-4 select-none"
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Header */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 font-sans">
              Share Publication
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Recommend this creator to your network
            </p>
          </div>

          {/* Quick Copy Link Row */}
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-400 overflow-ellipsis font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 transition text-xs font-semibold flex items-center gap-1.5 min-w-[85px] justify-center select-none shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="h-px bg-zinc-800/60 my-1" />

          {/* Sharing Options Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareX}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/50 hover:border-zinc-700 text-zinc-300 hover:text-white transition text-xs font-semibold"
            >
              <Twitter className="w-5 h-5 text-sky-400" />
              Share to X
            </button>

            <button
              onClick={shareFarcaster}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/50 hover:border-zinc-700 text-zinc-300 hover:text-white transition text-xs font-semibold"
            >
              <FarcasterIcon />
              Farcaster
            </button>

            <button
              onClick={shareTelegram}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/50 hover:border-zinc-700 text-zinc-300 hover:text-white transition text-xs font-semibold"
            >
              <TelegramIcon />
              Telegram
            </button>

            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/50 hover:border-zinc-700 text-zinc-300 hover:text-white transition text-xs font-semibold"
            >
              <WhatsAppIcon />
              WhatsApp
            </button>
          </div>

          {/* Web Share API option for mobile */}
          {canShare && (
            <Button
              onClick={handleNativeShare}
              className="w-full font-bold bg-violet-500 hover:bg-violet-600 text-white h-10 rounded-xl mt-1.5 flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Share2 className="w-4 h-4" /> Share...
            </Button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
