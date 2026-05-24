'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, Plus, Trash2, Star, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { cn } from '@/lib/utils';

interface LinkedWallet {
  address: string;
  type: 'embedded' | 'external';
  isPrimary?: boolean;
  chainType?: string;
}

function WalletRow({
  wallet,
  balance,
  balanceLoading,
  isPrimary,
  onRemove,
  canRemove,
}: {
  wallet: LinkedWallet;
  balance: number | null;
  balanceLoading: boolean;
  isPrimary: boolean;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const truncatedAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex flex-col gap-3 transition-colors',
        isPrimary
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-zinc-800 bg-zinc-900/40'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'p-2 rounded-xl shrink-0',
              wallet.type === 'embedded'
                ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
            )}
          >
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-mono text-zinc-300">{truncatedAddress}</span>
              {isPrimary && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-current" /> Primary
                </span>
              )}
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {wallet.type === 'embedded' ? 'Embedded Wallet' : 'External Wallet'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            title="Copy address"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <a
            href={`https://solscan.io/account/${wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Solscan"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {canRemove && (
            <button
              onClick={onRemove}
              title="Remove wallet"
              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* USDC Balance */}
      <div className="flex items-center justify-between text-xs font-mono px-1">
        <span className="text-zinc-500">USDC Balance</span>
        {balanceLoading ? (
          <RefreshCw className="w-3 h-3 animate-spin text-zinc-500" />
        ) : balance !== null ? (
          <span className="text-zinc-200 font-semibold">${balance.toFixed(2)}</span>
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </div>

      {copied && (
        <p className="text-[10px] text-emerald-400 text-center font-mono animate-in fade-in slide-in-from-bottom-1">
          Address copied!
        </p>
      )}
    </div>
  );
}

export default function WalletManager() {
  const { user, linkWallet, unlinkWallet, ready } = usePrivy();
  const { balance, isLoading: balanceLoading } = useWalletBalance();
  const [isLinking, setIsLinking] = useState(false);
  const [removingAddress, setRemovingAddress] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-zinc-800 p-6 animate-pulse">
        <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
        <div className="h-20 bg-zinc-900 rounded-xl" />
      </div>
    );
  }

  // Collect linked wallets from Privy user
  const linkedWallets: LinkedWallet[] = [];

  if (user?.wallet) {
    linkedWallets.push({
      address: user.wallet.address,
      type: 'embedded',
      chainType: user.wallet.chainType,
      isPrimary: true,
    });
  }

  // Privy's linkedAccounts may include additional external wallets
  const externalWallets =
    user?.linkedAccounts?.filter(
      (acct) =>
        acct.type === 'wallet' &&
        'address' in acct &&
        acct.address !== user?.wallet?.address
    ) ?? [];

  externalWallets.forEach((acct) => {
    if ('address' in acct) {
      linkedWallets.push({
        address: acct.address as string,
        type: 'external',
        isPrimary: false,
      });
    }
  });

  const handleAddWallet = async () => {
    setIsLinking(true);
    try {
      await linkWallet();
    } catch (err) {
      console.error('Failed to link wallet:', err);
    } finally {
      setIsLinking(false);
    }
  };

  const handleRemoveWallet = async (address: string) => {
    if (linkedWallets.length <= 1) return;
    setRemovingAddress(address);
    try {
      await unlinkWallet(address);
    } catch (err) {
      console.error('Failed to unlink wallet:', err);
    } finally {
      setRemovingAddress(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Connected Wallets</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {linkedWallets.length} wallet{linkedWallets.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <button
          onClick={handleAddWallet}
          disabled={isLinking}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border border-zinc-700 transition disabled:opacity-50"
        >
          {isLinking ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          Add Wallet
        </button>
      </div>

      {linkedWallets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
          <Wallet className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No wallets connected yet.</p>
          <button
            onClick={handleAddWallet}
            className="mt-3 text-xs text-amber-500 hover:text-amber-400 font-semibold transition"
          >
            Connect a Solana wallet →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {linkedWallets.map((wallet) => (
            <WalletRow
              key={wallet.address}
              wallet={wallet}
              balance={wallet.isPrimary ? balance : null}
              balanceLoading={wallet.isPrimary ? balanceLoading : false}
              isPrimary={!!wallet.isPrimary}
              canRemove={linkedWallets.length > 1 && removingAddress === null}
              onRemove={() => handleRemoveWallet(wallet.address)}
            />
          ))}
        </div>
      )}

      <p className="text-[10px] text-zinc-600 leading-relaxed">
        Your embedded wallet is created by Privy and tied to your Solscribe account. External wallets
        can be added for receiving payments. Solscribe never stores your private keys.
      </p>
    </div>
  );
}
