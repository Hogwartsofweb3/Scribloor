'use client';

import React, { useState } from 'react';
import { Share2, Twitter, Link as LinkIcon, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  referralCode?: string;
}

export function ShareButton({ url, title, text, referralCode }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Append referral code to URL if provided
  const finalUrl = referralCode 
    ? `${url}${url.includes('?') ? '&' : '?'}ref=${referralCode}` 
    : url;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: finalUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // user cancelled or error
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalUrl);
    toast.success('Link copied to clipboard!');
    setIsOpen(false);
  };

  const intentLinks = {
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(finalUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + finalUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(title)}`,
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleNativeShare}
        className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <Share2 className="w-4 h-4 mr-1" />
        Share
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 animate-in fade-in slide-in-from-top-2">
          {/* Overlay to close when clicking outside could be added here */}
          <div className="flex flex-col gap-1">
            <a 
              href={intentLinks.x} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Twitter className="w-4 h-4 mr-3 text-slate-400" />
              Share on X
            </a>
            <a 
              href={intentLinks.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <MessageCircle className="w-4 h-4 mr-3 text-emerald-500" />
              Share on WhatsApp
            </a>
            <button 
              onClick={copyToClipboard}
              className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
            >
              <LinkIcon className="w-4 h-4 mr-3 text-slate-400" />
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
