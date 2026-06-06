'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-8 md:py-12 mt-auto" id="main-footer">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Section: Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shadow shadow-primary/20">
              <span className="text-primary-foreground font-bold text-xs">S</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              Sol<span className="text-primary">scribe</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            &copy; {currentYear} Solscribe. All rights reserved.
          </p>
        </div>

        {/* Middle Section: Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/explore" className="hover:text-foreground transition-colors">
            Explore
          </Link>
          <Link href="/leaderboard" className="hover:text-foreground transition-colors">
            Leaderboard
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <a
            href="https://docs.solscribe.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Docs
          </a>
        </div>

        {/* Right Section: Built on Solana Badge */}
        <div className="flex items-center gap-4">
          <a
            href="https://solana.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14F195]/10 border border-[#14F195]/20 text-[#14F195] text-xs font-semibold hover:bg-[#14F195]/20 transition-all shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
            Built on Solana
          </a>
        </div>
      </div>
    </footer>
  );
}
