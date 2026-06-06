'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#111110] text-[#888780] border-t border-zinc-800 py-12 md:py-16 mt-auto select-none" id="main-footer">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-serif font-bold text-xl text-white tracking-tight">
              Sol<span className="text-[var(--color-brand-500)]">scribe</span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Crypto-native newsletter platform on Solana. Built on Solana. Powered by USDC.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
            <Link href="/explore" className="text-sm hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/leaderboard" className="text-sm hover:text-white transition-colors">
              Leaderboard
            </Link>
            <a
              href="https://docs.solscribe.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-white transition-colors"
            >
              Documentation
            </a>
          </div>

          {/* Column 3: Legal Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h4>
            <Link href="/terms" className="text-sm hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>

        <hr className="border-zinc-800 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div>
            &copy; 2025 Solscribe. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <a
              href="https://twitter.com/solscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://warpcast.com/~/channel/solscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Farcaster
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
