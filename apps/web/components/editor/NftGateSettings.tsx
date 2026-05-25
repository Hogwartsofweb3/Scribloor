'use client';

import React, { useState, useCallback } from 'react';
import { Shield, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionMeta {
  address: string;
  name: string;
  symbol: string;
  image: string | null;
  description: string | null;
}

interface NftGateSettingsProps {
  nftGateCollection: string | null;
  nftGateName: string | null;
  onUpdate: (collection: string | null, name: string | null) => void;
}

export default function NftGateSettings({
  nftGateCollection,
  nftGateName,
  onUpdate,
}: NftGateSettingsProps) {
  const [enabled, setEnabled] = useState(!!nftGateCollection);
  const [collectionAddress, setCollectionAddress] = useState(nftGateCollection ?? '');
  const [collectionMeta, setCollectionMeta] = useState<CollectionMeta | null>(
    nftGateCollection && nftGateName
      ? { address: nftGateCollection, name: nftGateName, symbol: '', image: null, description: null }
      : null
  );
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleToggle = (on: boolean) => {
    setEnabled(on);
    if (!on) {
      setCollectionAddress('');
      setCollectionMeta(null);
      setVerifyError(null);
      onUpdate(null, null);
    }
  };

  const handleVerify = useCallback(async () => {
    if (!collectionAddress.trim()) return;
    setVerifying(true);
    setVerifyError(null);
    setCollectionMeta(null);

    try {
      const res = await fetch(`/api/nft/collection/${collectionAddress.trim()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Collection not found');
      }
      const meta: CollectionMeta = await res.json();
      setCollectionMeta(meta);
      onUpdate(meta.address, meta.name);
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'Verification failed');
      onUpdate(null, null);
    } finally {
      setVerifying(false);
    }
  }, [collectionAddress, onUpdate]);

  const handleClear = () => {
    setCollectionAddress('');
    setCollectionMeta(null);
    setVerifyError(null);
    onUpdate(null, null);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-zinc-200">NFT Token Gate</span>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => handleToggle(!enabled)}
          className={cn(
            'relative w-10 h-[22px] rounded-full transition-colors shrink-0',
            enabled ? 'bg-violet-500' : 'bg-zinc-700'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
              enabled ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {enabled && (
        <>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Require readers to hold an NFT from a specific collection to access this post.
            NFT holders bypass the paywall.
          </p>

          {/* Collection address input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={collectionAddress}
              onChange={(e) => setCollectionAddress(e.target.value)}
              placeholder="Collection mint address..."
              className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition"
            />
            <button
              onClick={handleVerify}
              disabled={verifying || !collectionAddress.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white transition disabled:opacity-50"
            >
              {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              Verify
            </button>
          </div>

          {/* Error */}
          {verifyError && (
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {verifyError}
            </div>
          )}

          {/* Verified collection preview */}
          {collectionMeta && (
            <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
              {collectionMeta.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={collectionMeta.image}
                  alt={collectionMeta.name}
                  className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-zinc-200 truncate">{collectionMeta.name}</span>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 truncate">
                  {collectionMeta.address}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`https://magiceden.io/marketplace/${collectionMeta.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
                  title="View on Magic Eden"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"
                  title="Remove gate"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
