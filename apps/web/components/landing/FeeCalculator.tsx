'use client';

import React, { useState } from 'react';
import { trackLandingEvent } from '@/lib/analytics/landing';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FeeCalculator() {
  const [revenue, setRevenue] = useState<number>(1000);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Estimations
  const averageSubPrice = 10;
  const estimatedSubscribers = Math.max(1, Math.floor(revenue / averageSubPrice));

  // Substack fees: 10% platform + 2.9% + 30c per sub
  const substackPlatformFee = revenue * 0.10;
  const substackStripeFee = (revenue * 0.029) + (estimatedSubscribers * 0.30);
  const substackTotalFee = substackPlatformFee + substackStripeFee;
  const substackKeep = revenue - substackTotalFee;
  const substackAnnualLoss = substackTotalFee * 12;

  // Solscribe fees: 4% platform + ~$0.001 network (negligible)
  const solscribePlatformFee = revenue * 0.04;
  const solscribeTotalFee = solscribePlatformFee;
  const solscribeKeep = revenue - solscribeTotalFee;
  const solscribeAnnualLoss = solscribeTotalFee * 12;

  const annualSavings = substackAnnualLoss - solscribeAnnualLoss;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRevenue(Number(e.target.value));
    if (!hasInteracted) {
      setHasInteracted(true);
      trackLandingEvent('calculator_interaction');
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
      <div className="mb-10 text-center">
        <label htmlFor="revenue-slider" className="block text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
          Your monthly subscription revenue
        </label>
        <div className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
          {formatCurrency(revenue)}
        </div>
        
        <input
          id="revenue-slider"
          type="range"
          min="100"
          max="50000"
          step="100"
          value={revenue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>$100</span>
          <span>$50,000+</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Substack Card */}
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center justify-between">
            Substack
            <span className="text-xs font-normal px-2 py-1 bg-slate-800 rounded-full text-slate-400">Legacy</span>
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Platform fee (10%)</span>
              <span className="text-slate-200">{formatCurrency(substackPlatformFee)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex flex-col">
                <span>Stripe fees (est.)</span>
                <span className="text-[10px] opacity-70">2.9% + 30¢ per txn</span>
              </span>
              <span className="text-slate-200">{formatCurrency(substackStripeFee)}</span>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-between font-medium text-base">
              <span className="text-slate-300">You keep</span>
              <span className="text-white">{formatCurrency(substackKeep)}</span>
            </div>
            <div className="pt-2 flex justify-between font-bold text-lg text-red-400">
              <span>Annual fees</span>
              <span>{formatCurrency(substackAnnualLoss)}</span>
            </div>
          </div>
        </div>

        {/* Solscribe Card */}
        <div className="bg-indigo-950/40 rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h3 className="text-xl font-bold text-indigo-100 mb-6 flex items-center justify-between">
            Solscribe
            <span className="text-xs font-normal px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/20">Global</span>
          </h3>
          <div className="space-y-4 text-sm relative z-10">
            <div className="flex justify-between text-indigo-200/70">
              <span>Platform fee (4%)</span>
              <span className="text-indigo-100">{formatCurrency(solscribePlatformFee)}</span>
            </div>
            <div className="flex justify-between text-indigo-200/70">
              <span className="flex flex-col">
                <span>Stripe fees</span>
                <span className="text-[10px] opacity-70">USDC transfer is ~$0.001</span>
              </span>
              <span className="text-indigo-100">$0</span>
            </div>
            <div className="pt-4 border-t border-indigo-500/20 flex justify-between font-medium text-base">
              <span className="text-indigo-100">You keep</span>
              <span className="text-white">{formatCurrency(solscribeKeep)}</span>
            </div>
            <div className="pt-2 flex justify-between font-bold text-lg text-emerald-400">
              <span>Annual fees</span>
              <span>{formatCurrency(solscribeAnnualLoss)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl md:text-2xl font-medium text-slate-300 mb-6">
          That's <span className="text-emerald-400 font-bold">{formatCurrency(annualSavings)}</span> extra per year in your wallet.
        </p>
        <Link 
          href="/login"
          onClick={() => trackLandingEvent('hero_cta_click', { source: 'calculator' })}
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
        >
          <span>Start saving &rarr; Create publication</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
