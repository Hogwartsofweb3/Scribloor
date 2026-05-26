import React from 'react';
import { FeeCalculator } from './FeeCalculator';

export function PainSection() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Substack takes 10% forever. <br className="md:hidden"/> We don't.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Stop paying platform taxes on your hard work. Keep what you earn with honest, flat 4% pricing.
          </p>
        </div>
        
        <FeeCalculator />
        
        <div className="mt-12 text-center text-slate-500 font-medium">
          That's money back in your wallet. Literally.
        </div>
      </div>
    </section>
  );
}
