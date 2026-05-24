"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSubscribeModal } from '@/hooks/useSubscribeModal';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useSubscriptionPayment } from '@/hooks/useSubscriptionPayment';
import { Button } from '@/components/ui/button';
import {
  Lock,
  X,
  RefreshCw,
  Coins,
  DollarSign,
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Twitter,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SubscribeModal() {
  const { isOpen, publicationId, publicationName, publicationPrice, close } = useSubscribeModal();
  const { authenticated, login, user: privyUser } = usePrivy();
  const { balance, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance();
  const { initiatePayment, status: paymentStatus, txSignature, error: paymentError, reset: resetPayment } = useSubscriptionPayment();
  const { select } = useWallet();

  const [activeScreen, setActiveScreen] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);

  // Sync modal lifecycle state on open/close and balance changes
  useEffect(() => {
    if (!isOpen) return;

    if (!authenticated) {
      setActiveScreen(1); // SCREEN 1: Not Logged In
    } else if (balanceLoading) {
      setActiveScreen(2); // SCREEN 2: Checking Balance
    } else if (balance === null || (publicationPrice !== null && balance < publicationPrice)) {
      setActiveScreen(3); // SCREEN 3: Insufficient Balance
    } else {
      // Balance is sufficient, map to payment hooks
      if (paymentStatus === 'idle') {
        setActiveScreen(4); // SCREEN 4: Ready to Pay
      } else if (paymentStatus === 'building' || paymentStatus === 'awaiting_signature') {
        setActiveScreen(5); // SCREEN 5: Awaiting Wallet Signature
      } else if (paymentStatus === 'confirming') {
        setActiveScreen(6); // SCREEN 6: Confirming on Solana
      } else if (paymentStatus === 'success') {
        setActiveScreen(7); // SCREEN 7: Success
      } else if (paymentStatus === 'error') {
        setActiveScreen(8); // SCREEN 8: Error
      }
    }
  }, [isOpen, authenticated, balance, balanceLoading, paymentStatus, publicationPrice]);

  // Refetch wallet balance when user logs in or modal opens
  useEffect(() => {
    if (isOpen && authenticated) {
      refetchBalance();
      resetPayment();
    }
  }, [isOpen, authenticated, refetchBalance, resetPayment]);

  if (!isOpen) return null;

  const price = publicationPrice || 0;
  const platformFee = price * 0.04;
  const creatorPayout = price - platformFee;

  const walletAddress = privyUser?.wallet?.address || '';
  const truncatedWallet = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : 'Unknown Signer';

  const handlePay = async () => {
    if (publicationId) {
      await initiatePayment(publicationId);
    }
  };

  const handleRetry = () => {
    resetPayment();
    refetchBalance();
  };

  const handleTwitterShare = () => {
    if (typeof window === 'undefined') return;
    const shareText = encodeURIComponent(`I'm now a premium subscriber to "${publicationName}" on Solscribe! 🚀`);
    const shareUrl = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
  };

  // Human-readable error translation helper
  const getTranslatedError = () => {
    if (!paymentError) return 'An unexpected transaction error occurred.';
    const err = paymentError.toLowerCase();
    if (err.includes('0x1') || err.includes('insufficient') || err.includes('balance')) {
      return 'Not enough USDC in your wallet. Top up or swap tokens on Jupiter and try again.';
    }
    if (err.includes('timeout') || err.includes('too long') || err.includes('expired')) {
      return 'Transaction took too long to confirm on-chain. Please check your signature on Solscan.';
    }
    if (err.includes('rejected') || err.includes('cancelled') || err.includes('declined') || err.includes('user cancel')) {
      return 'You cancelled the transaction in your wallet signature window.';
    }
    return paymentError;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/90 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex items-center justify-center select-none animate-in fade-in duration-300">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col min-h-[380px] sm:min-h-0">
        
        {/* Top Close Button (hidden on success) */}
        {activeScreen !== 7 && (
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200 transition z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Dynamic Screen Render Pipeline */}
        <div className="p-6 sm:p-8 flex flex-col justify-center flex-grow">

          {/* SCREEN 1 — Not Logged In */}
          {activeScreen === 1 && (
            <div className="flex flex-col items-center justify-center text-center gap-5 pt-4">
              <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/10 text-amber-500">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-zinc-100 font-serif leading-snug">
                  Subscribe to {publicationName}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-normal max-w-xs mx-auto">
                  Unlock premium articles for <span className="font-semibold text-zinc-200">${price} USDC/month</span>.
                </p>
              </div>
              <Button
                onClick={login}
                className="w-full font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 h-11 rounded-xl shadow-lg shadow-amber-500/10 mt-2"
              >
                Sign in to subscribe
              </Button>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Pay with any Solana wallet. Cancel anytime.
              </span>
            </div>
          )}

          {/* SCREEN 2 — Checking Balance */}
          {activeScreen === 2 && (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-zinc-300 font-mono uppercase tracking-widest">
                  Checking wallet balance...
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Connecting to Solana RPC cluster nodes to query USDC token balances
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 3 — Insufficient Balance */}
          {activeScreen === 3 && (
            <div className="flex flex-col items-center justify-center text-center gap-5 pt-4">
              <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/10 text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Insufficient USDC Balance</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-normal">
                  You need <span className="text-zinc-300 font-semibold">${price} USDC</span> to subscribe, but your current wallet balance is <span className="text-rose-400 font-bold">${balance?.toFixed(2) || '0.00'} USDC</span>.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 h-11 rounded-xl">
                    Swap & Buy USDC on Jupiter <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
                <Button
                  onClick={login}
                  className="w-full font-bold bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 h-11 rounded-xl"
                >
                  Try another wallet
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 4 — Ready to Pay */}
          {activeScreen === 4 && (
            <div className="flex flex-col gap-5 pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/10 text-amber-500 shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100 leading-tight">
                    Confirm USDC Checkout
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                    Billed via Solana on-chain USDC
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-4 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Author Payout ({publicationName})</span>
                  <span className="font-semibold text-zinc-200">${creatorPayout.toFixed(2)} USDC</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Solscribe Platform Fee (4%)</span>
                  <span className="font-semibold text-zinc-200">${platformFee.toFixed(2)} USDC</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-sm font-bold">
                  <span className="text-zinc-100">Total Billed</span>
                  <span className="text-amber-500">${price.toFixed(2)} USDC</span>
                </div>
              </div>

              {/* Wallet info */}
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1 select-none">
                <span>WALLET: {truncatedWallet}</span>
                <span>USDC BALANCE: ${balance?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <Button
                  onClick={handlePay}
                  className="w-full font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 h-11 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Pay {price.toFixed(2)} USDC/month
                </Button>
                <p className="text-[10px] text-zinc-500 leading-normal text-center max-w-xs mx-auto">
                  By subscribing, you agree to Solscribe's billing terms. Term renewals are settled manually on-chain to give you total control.
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 5 — Awaiting Wallet Signature */}
          {activeScreen === 5 && (
            <div className="flex flex-col items-center justify-center text-center gap-5 py-6">
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute w-full h-full border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-widest">
                  Awaiting wallet confirmation...
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-normal">
                  Please open your Solana wallet extension or interface and sign the transaction to authorize the USDC monthly subscription transfer.
                </p>
              </div>
              <Button
                onClick={close}
                className="font-bold bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 h-9 px-4 rounded-lg mt-2 text-zinc-500 hover:text-zinc-300"
              >
                Cancel Transaction
              </Button>
            </div>
          )}

          {/* SCREEN 6 — Confirming on Solana */}
          {activeScreen === 6 && (
            <div className="flex flex-col items-center justify-center text-center gap-5 py-6">
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute w-full h-full border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-widest">
                  Confirming on Solana...
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-normal">
                  Authorizing block signature. Transaction is settling instantly on the Solana network layer.
                </p>
              </div>
              {txSignature && (
                <a
                  href={`https://solscan.io/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-mono mt-2"
                >
                  View Solscan Signature <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* SCREEN 7 — Success */}
          {activeScreen === 7 && (
            <div className="flex flex-col items-center justify-center text-center gap-5 pt-4">
              <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-zinc-100 font-serif leading-snug">
                  You're now subscribed!
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-normal">
                  Access is unlocked! You are now subscribed to <span className="font-semibold text-zinc-200">{publicationName}</span>. Enjoy reading exclusive editorial releases.
                </p>
              </div>

              {txSignature && (
                <a
                  href={`https://solscan.io/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-400 font-mono"
                >
                  TX signature: {txSignature.substring(0, 6)}...{txSignature.substring(txSignature.length - 6)} <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <div className="flex flex-col gap-2 w-full mt-2 select-none">
                <Button
                  onClick={close}
                  className="w-full font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 h-11 rounded-xl shadow-lg shadow-amber-500/10"
                >
                  Start Reading <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  onClick={handleTwitterShare}
                  className="w-full font-bold bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 h-11 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Twitter className="w-4 h-4 shrink-0 text-sky-400" /> Share on Twitter
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 8 — Error */}
          {activeScreen === 8 && (
            <div className="flex flex-col items-center justify-center text-center gap-5 pt-4">
              <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/10 text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Transaction Failed</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-normal">
                  {getTranslatedError()}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Button
                  onClick={handlePay}
                  className="w-full font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 h-11 rounded-xl shadow-lg shadow-amber-500/10"
                >
                  Try again
                </Button>
                <Button
                  onClick={handleRetry}
                  className="w-full font-bold bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 h-11 rounded-xl"
                >
                  Refresh Balance & Wallet
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
