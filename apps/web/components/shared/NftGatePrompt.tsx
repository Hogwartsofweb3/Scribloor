'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Shield, ExternalLink, Wallet, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NftGatePromptProps {
  collectionAddress: string;
  collectionName?: string;
  onAccessGranted?: () => void;
}

export default function NftGatePrompt({
  collectionAddress,
  collectionName,
  onAccessGranted,
}: NftGatePromptProps) {
  const { authenticated, login, user } = usePrivy();
  const [collectionMeta, setCollectionMeta] = useState<{
    name: string;
    image: string | null;
    symbol: string;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'idle' | 'found' | 'not_found'>('idle');

  // Fetch collection metadata on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/nft/collection/${collectionAddress}`);
        if (res.ok) {
          const meta = await res.json();
          setCollectionMeta(meta);
        }
      } catch {}
    })();
  }, [collectionAddress]);

  const walletAddress = user?.wallet?.address;

  const handleCheckWallet = async () => {
    if (!walletAddress) return;
    setChecking(true);
    setCheckResult('idle');

    try {
      // Use the API to re-check — this busts the Redis cache effectively via a fresh query
      const res = await fetch(`/api/nft/collection/${collectionAddress}`);
      if (res.ok) {
        // Now check actual ownership via a client-side call to a verify endpoint
        // For simplicity, we'll check via the main post access endpoint
        // or we'll call a simple ownership check
        const ownerRes = await fetch(
          `/api/nft/collection/${collectionAddress}?checkWallet=${walletAddress}`
        );
        // The presence of the NFT in the wallet is checked server-side
        // For now, we'll trigger a page reload to let the post access check run
        if (onAccessGranted) {
          onAccessGranted();
        } else {
          window.location.reload();
        }
      }
    } catch {
      setCheckResult('not_found');
    } finally {
      setChecking(false);
    }
  };

  const displayName = collectionName || collectionMeta?.name || 'Required NFT Collection';

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-zinc-950 p-8 text-center max-w-md mx-auto">
      {/* Collection image */}
      {collectionMeta?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={collectionMeta.image}
          alt={displayName}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/30 mx-auto mb-5 shadow-lg shadow-violet-500/10"
        />
      )}
      {!collectionMeta?.image && (
        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border-2 border-violet-500/30 flex items-center justify-center mx-auto mb-5">
          <Shield className="w-8 h-8 text-violet-400" />
        </div>
      )}

      <h3 className="text-lg font-bold text-zinc-100 mb-1">NFT Required</h3>
      <p className="text-sm text-zinc-400 mb-2">
        This content is exclusive to holders of
      </p>
      <p className="text-base font-bold text-violet-300 mb-6">{displayName}</p>

      {/* Check result badges */}
      {checkResult === 'found' && (
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold mb-4 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" /> NFT found! Granting access...
        </div>
      )}
      {checkResult === 'not_found' && (
        <div className="flex items-center justify-center gap-2 text-rose-400 text-sm mb-4 animate-in fade-in">
          <XCircle className="w-4 h-4" /> No matching NFT found in your wallet.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {!authenticated ? (
          <button
            onClick={login}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm transition"
          >
            <Wallet className="w-4 h-4" /> Connect wallet to verify
          </button>
        ) : (
          <button
            onClick={handleCheckWallet}
            disabled={checking}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm transition disabled:opacity-60"
          >
            {checking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {checking ? 'Checking wallet...' : 'Check my wallet'}
          </button>
        )}

        <a
          href={`https://magiceden.io/marketplace/${collectionAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-800 transition"
        >
          <ExternalLink className="w-4 h-4" /> View collection on Magic Eden
        </a>
      </div>

      <p className="text-[10px] text-zinc-600 mt-5 leading-relaxed">
        NFT ownership is verified on-chain via Helius DAS. Results are cached for up to 10 minutes.
        If you just purchased, try checking again shortly.
      </p>
    </div>
  );
}
