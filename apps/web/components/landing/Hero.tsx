import React from 'react';
import Link from 'next/link';
import { StatsBar } from './StatsBar';

export function Hero() {
  return (
    <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute -top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
          Your writing. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Your readers. Your money.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-12 max-w-2xl mx-auto">
          Publish newsletters, get paid in USDC — instantly, to any wallet, anywhere in the world. 
          No banks. No 10% tax. No waiting.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            Start writing free
          </Link>
          <Link 
            href="/explore" 
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-medium text-lg transition-all"
          >
            Explore publications
          </Link>
        </div>

        <StatsBar />
      </div>
    </section>
  );
}
