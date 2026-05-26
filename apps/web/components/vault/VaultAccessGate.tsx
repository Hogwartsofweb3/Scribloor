"use client";

import React, { useState } from 'react';
import { useVaultAccess } from '@/hooks/useVaultAccess';
import { usePrivy } from '@privy-io/react-auth';
import { Lock, Unlock, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface VaultAccessGateProps {
  entryId: string;
  singleAccessPrice: string | number;
  accessState: 'no_access' | 'single_access' | 'vault_pass';
  children?: React.ReactNode;
}

export function VaultAccessGate({ entryId, singleAccessPrice, accessState, children }: VaultAccessGateProps) {
  const { authenticated, login } = usePrivy();
  const { purchaseSingleAccess, purchaseVaultPass, status, error } = useVaultAccess();

  // If they have access, render the content
  if (accessState === 'single_access') {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-3 rounded-xl border border-emerald-500/20 mb-8 w-fit">
          <Unlock className="w-5 h-5" />
          <span className="font-medium">You have permanent access to this research.</span>
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          {children}
        </div>
      </div>
    );
  }

  if (accessState === 'vault_pass') {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-3 rounded-xl border border-indigo-500/20 mb-8 w-fit">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-medium">Included in your active Vault Pass.</span>
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          {children}
        </div>
      </div>
    );
  }

  // They don't have access, render the payment gate
  const isLoading = status === 'building' || status === 'awaiting_signature' || status === 'confirming';

  return (
    <div className="mt-12 relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/50 p-8 md:p-12 text-center backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-zinc-400" />
        </div>
        
        <h3 className="text-3xl font-serif font-bold text-white mb-4">
          Read this research
        </h3>
        <p className="text-zinc-400 mb-10 max-w-lg mx-auto">
          Unlock this deep dive permanently, or get the Vault Pass to access our entire library of premium research.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 w-full">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 w-full mb-8">
          {/* Single Access */}
          <button
            onClick={() => authenticated ? purchaseSingleAccess(entryId) : login()}
            disabled={isLoading}
            className="flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-white/20 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-zinc-400 text-sm font-medium mb-2 group-hover:text-zinc-300">Permanent Access</span>
            <span className="text-2xl font-bold text-white mb-1">{singleAccessPrice} USDC</span>
            <span className="text-zinc-500 text-sm">One-time payment</span>
          </button>

          {/* Vault Pass */}
          <button
            onClick={() => authenticated ? purchaseVaultPass() : login()}
            disabled={isLoading}
            className="flex flex-col items-center p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
              Best Value
            </div>
            <span className="text-indigo-400 text-sm font-medium mb-2 group-hover:text-indigo-300">Vault Pass</span>
            <span className="text-2xl font-bold text-white mb-1">5 USDC</span>
            <span className="text-indigo-400/80 text-sm">per month</span>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-indigo-400 mb-6">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing transaction... {status === 'awaiting_signature' ? 'Please sign in wallet' : ''}</span>
          </div>
        )}

        {!authenticated && (
          <p className="text-sm text-zinc-500">
            Already have access?{' '}
            <button onClick={() => login()} className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
