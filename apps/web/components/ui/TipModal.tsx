'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getConnection } from '@/lib/solana/connection';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, Heart, Loader2, Sparkles, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TipModal() {
  const { activeModal, modalProps, closeModal } = useUIStore();
  const { authenticated, login } = usePrivy();
  const { publicKey, signTransaction } = useWallet();
  const { balance, refetch: refetchBalance } = useWalletBalance();

  const [presetAmount, setPresetAmount] = useState<number | 'custom'>(3);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'tip') {
      setPresetAmount(3);
      setCustomAmount('');
      setMessage('');
      setLoading(false);
      setError(null);
      setSuccess(false);
      setTxSignature(null);
      if (authenticated) {
        refetchBalance();
      }
    }
  }, [activeModal, authenticated, refetchBalance]);

  if (activeModal !== 'tip') return null;

  const { publication, post } = modalProps as {
    publication?: { id: string; name: string; payoutWallet: string };
    post?: { id: string; title: string };
  };

  if (!publication) return null;

  const getTipAmount = (): number => {
    if (presetAmount === 'custom') {
      const val = parseFloat(customAmount);
      return isNaN(val) ? 0 : val;
    }
    return presetAmount;
  };

  const handleSendTip = async () => {
    setError(null);
    const amount = getTipAmount();

    if (amount <= 0) {
      setError('Please specify a tip amount greater than 0.');
      return;
    }

    if (balance !== null && balance < amount) {
      setError(`Insufficient USDC balance. You have $${balance.toFixed(2)} USDC.`);
      return;
    }

    if (!signTransaction) {
      setError('Wallet adapter signing functions not available. Make sure your wallet is connected.');
      return;
    }

    setLoading(true);

    try {
      // ── Step 1: Initiate Tip build transaction ───────────────
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationId: publication.id,
          postId: post?.id || null,
          amountUsdc: amount,
          message: message.trim() || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to construct tip transaction');
      }

      const { transaction: base64Tx } = await res.json();

      // ── Step 2: Deserialize transaction ───────────────
      const txBuffer = Buffer.from(base64Tx, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuffer);

      // ── Step 3: Sign with user wallet ───────────────
      const signedTx = await signTransaction(transaction);

      // ── Step 4: Broadcast to Solana ───────────────
      const connection = getConnection();
      const rawTx = signedTx.serialize();
      const signature = await connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      setTxSignature(signature);

      // ── Step 5: Await Confirmation ───────────────
      const { value: confirmationResult } = await connection.confirmTransaction(
        {
          signature,
          ...(await connection.getLatestBlockhash('confirmed')),
        },
        'confirmed'
      );

      if (confirmationResult?.err) {
        throw new Error('Solana transaction failed during on-chain settlement.');
      }

      setSuccess(true);
      refetchBalance();
    } catch (err: any) {
      console.error('[TipModal] Tipping error:', err);
      setError(err.message || 'Transaction failed. Please check your wallet connection.');
    } finally {
      setLoading(false);
    }
  };

  const currentAmount = getTipAmount();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl z-10 flex flex-col gap-5"
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3 pr-6 select-none">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/15 text-violet-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 leading-tight">
                Support {publication.name}
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                USDC Microtips on Solana
              </span>
            </div>
          </div>

          {success ? (
            /* Inline Success State */
            <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                <Check className="w-6 h-6 stroke-[3px]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-zinc-100">Tip sent! ✓</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
                  Thank you for supporting {publication.name}! Your tip of ${currentAmount.toFixed(2)} USDC has settled on-chain.
                </p>
              </div>
              {txSignature && (
                <a
                  href={`https://solscan.io/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition underline"
                >
                  View Solscan transaction
                </a>
              )}
              <Button
                onClick={closeModal}
                className="w-full font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 mt-2 h-10 rounded-xl"
              >
                Close
              </Button>
            </div>
          ) : (
            /* Form Input State */
            <>
              {!authenticated ? (
                /* Unauthenticated Sign-in Prompt */
                <div className="flex flex-col gap-4 py-2 text-center">
                  <p className="text-xs text-zinc-400 leading-normal max-w-xs mx-auto">
                    Please log in to support creators with on-chain USDC microtips.
                  </p>
                  <Button
                    onClick={login}
                    className="w-full font-bold bg-violet-500 hover:bg-violet-600 text-white h-11 rounded-xl shadow-lg"
                  >
                    Log In to Continue
                  </Button>
                </div>
              ) : (
                /* Active Tipping Form */
                <div className="flex flex-col gap-4">
                  {/* Preset Amount Grid */}
                  <div className="flex flex-col gap-1.5 select-none">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Select Amount (USDC)
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 3, 5, 10].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setPresetAmount(amount)}
                          className={`py-2 text-sm font-semibold rounded-xl border transition ${
                            presetAmount === amount
                              ? 'border-violet-500 bg-violet-500/10 text-violet-400 font-bold'
                              : 'border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                      <button
                        onClick={() => setPresetAmount('custom')}
                        className={`py-2 text-xs font-semibold rounded-xl border transition ${
                          presetAmount === 'custom'
                            ? 'border-violet-500 bg-violet-500/10 text-violet-400 font-bold'
                            : 'border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {/* Custom Input */}
                  {presetAmount === 'custom' && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        Custom USDC Amount
                      </span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.1"
                          min="0.1"
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-7 pr-3 py-2 text-sm font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Optional message */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span className="uppercase tracking-wider">Optional Message</span>
                      <span>{message.length}/140</span>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 140))}
                      placeholder="Say something nice..."
                      rows={2}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition resize-none leading-relaxed"
                    />
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs leading-normal select-none">
                      {error}
                    </div>
                  )}

                  {/* Action button */}
                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      onClick={handleSendTip}
                      disabled={loading || currentAmount <= 0}
                      className="w-full font-bold bg-violet-500 hover:bg-violet-600 text-white h-11 rounded-xl shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                          Processing Transaction...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 shrink-0" />
                          Send Tip (${currentAmount > 0 ? currentAmount.toFixed(2) : '0.00'} USDC)
                        </>
                      )}
                    </Button>
                    {balance !== null && (
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-1">
                        <span>WALLET BALANCE: ${balance.toFixed(2)} USDC</span>
                        <span>SOLANA CHAIN</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
