'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-500">
      <div className="relative flex items-center justify-center">
        {/* Animated outer pulsing ring */}
        <div className="w-16 h-16 rounded-full border border-primary/20 bg-primary/5 animate-ping absolute" />
        
        {/* Spinning loader */}
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-primary border-r-transparent animate-spin" />
        
        {/* Brand logo watermark inside spinner */}
        <div className="absolute font-sans font-black text-primary text-base">S</div>
      </div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-6 select-none animate-pulse">
        Compiling Solscribe...
      </span>
    </div>
  );
}
