'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-center select-none relative overflow-hidden">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* 404 illustration placeholder */}
      <div className="text-8xl font-black text-primary/10 tracking-widest font-mono select-none mb-6">
        404
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 font-sans mb-3">
        Lost in space
      </h1>
      
      <p className="max-w-md mx-auto text-sm text-zinc-400 leading-relaxed mb-8">
        The page you are looking for does not exist or has been relocated to another galaxy. Let's get you back on track.
      </p>

      {/* Suggested paths */}
      <div className="w-full max-w-sm border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm rounded-2xl p-4 text-xs text-left text-zinc-500 mb-8 space-y-3">
        <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Suggested Destinations</span>
        <Link href="/explore" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Compass className="w-4 h-4 text-primary" />
          <span>Explore premium publications & trending creators</span>
        </Link>
        <Link href="/leaderboard" className="flex items-center gap-2 border-t border-zinc-800/60 pt-3 hover:text-primary transition-colors">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>Check the Solscribe creator leaderboard</span>
        </Link>
      </div>

      <div className="flex gap-3 w-full max-w-xs justify-center">
        <Link href="/" className="w-full">
          <Button
            className="flex items-center justify-center gap-1.5 h-11 w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
          >
            <Home className="w-4 h-4" /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
