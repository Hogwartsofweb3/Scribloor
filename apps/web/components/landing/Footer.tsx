import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="text-center md:text-left">
          <div className="font-extrabold text-2xl tracking-tight text-white mb-4">
            Solscribe
          </div>
          <p className="text-sm">Built on Solana. Powered by USDC.</p>
        </div>

        <div className="flex gap-12 text-sm font-medium">
          <div className="flex flex-col space-y-3">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>
          <div className="flex flex-col space-y-3">
            <Link href="/terms" className="hover:text-white transition-colors">ToS</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <a href="https://twitter.com/solscribe" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Twitter/X</a>
            <a href="https://warpcast.com/solscribe" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Farcaster</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-slate-900 text-center text-xs opacity-50">
        &copy; {new Date().getFullYear()} Solscribe. All rights reserved.
      </div>
    </footer>
  );
}
