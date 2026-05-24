"use client";

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useSubscriptionPayment } from '@/hooks/useSubscriptionPayment';

interface PaywallGateProps {
  publicationId: string;
  subscriptionPrice: number;
  hasExpiredSub?: boolean;
}

export function PaywallGate({
  publicationId,
  subscriptionPrice,
  hasExpiredSub = false,
}: PaywallGateProps) {
  const { login, authenticated } = usePrivy();
  const { initiatePayment, status, error } = useSubscriptionPayment();

  const handleSubscribe = async () => {
    await initiatePayment(publicationId);
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-8 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-sm">
        <div className="p-3 mb-4 rounded-full bg-zinc-800/80">
          <Lock className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-zinc-100">
          This post is for subscribers only
        </h3>
        <p className="mb-6 text-sm text-center text-zinc-400">
          Sign in to access this content and support the creator.
        </p>
        <Button onClick={login} className="w-full max-w-xs font-semibold text-black bg-amber-500 hover:bg-amber-400">
          Sign in to subscribe
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 mt-8 border border-amber-500/20 rounded-xl bg-gradient-to-b from-zinc-900/50 to-zinc-950">
      <div className="p-3 mb-4 rounded-full bg-amber-500/10">
        <Lock className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-zinc-100">
        {hasExpiredSub ? 'Your subscription has expired' : 'Unlock full access'}
      </h3>
      <p className="max-w-md mb-6 text-sm text-center text-zinc-400">
        Subscribe for <span className="font-semibold text-zinc-200">${subscriptionPrice} USDC/month</span> to read the full post and access the entire archive.
      </p>

      {status === 'error' && (
        <div className="p-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-950/30 border-red-900/50">
          {error}
        </div>
      )}

      <Button
        onClick={handleSubscribe}
        disabled={status !== 'idle' && status !== 'error'}
        className="w-full max-w-xs font-semibold text-black shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 disabled:opacity-50"
      >
        {status === 'building' && 'Preparing transaction...'}
        {status === 'awaiting_signature' && 'Please sign in wallet...'}
        {status === 'confirming' && 'Confirming on-chain...'}
        {status === 'success' && 'Subscribed! Refreshing...'}
        {(status === 'idle' || status === 'error') &&
          (hasExpiredSub ? 'Renew subscription' : 'Subscribe with USDC')}
      </Button>

      <p className="mt-4 text-xs text-zinc-500">
        Payments settle instantly on Solana.
      </p>
    </div>
  );
}
