'use client';

import React from 'react';
import Link from 'next/link';
import { trackLandingEvent } from '@/lib/analytics/landing';

export function FinalCta() {
  return (
    <section className="py-32 bg-indigo-600 relative overflow-hidden">
      {/* Abstract bg pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white blur-2xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-8 leading-tight">
          Start earning what you <br className="hidden md:block" />
          actually deserve.
        </h2>
        <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-2xl mx-auto">
          Free to publish. 4% only when you earn. No credit card, no bank account needed.
        </p>
        
        <Link 
          href="/login"
          onClick={() => trackLandingEvent('hero_cta_click', { source: 'final_cta' })}
          className="inline-block px-10 py-5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-full font-bold text-lg md:text-xl transition-transform transform hover:-translate-y-1 shadow-xl"
        >
          Create your publication
        </Link>
      </div>
    </section>
  );
}
