"use client";

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { buildSubscriptionTransaction } from '@/lib/solana/payment';
import { getConnection } from '@/lib/solana/connection';
import { PLATFORM_FEE_WALLET } from '@/lib/solana/constants';

type PaymentStatus =
  | 'idle'
  | 'building'
  | 'awaiting_signature'
  | 'confirming'
  | 'success'
  | 'error';

interface UseSubscriptionPaymentReturn {
  initiatePayment: (publicationId: string) => Promise<void>;
  status: PaymentStatus;
  txSignature: string | null;
  error: string | null;
  reset: () => void;
}

export function useSubscriptionPayment(): UseSubscriptionPaymentReturn {
  const { publicKey, signTransaction } = useWallet();
  const { user: privyUser } = usePrivy();
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setTxSignature(null);
    setError(null);
  }, []);

  const initiatePayment = useCallback(
    async (publicationId: string) => {
      // Resolve signer — prefer adapter wallet, fall back to Privy embedded
      const walletPubkey =
        publicKey ??
        (privyUser?.wallet?.address
          ? new PublicKey(privyUser.wallet.address)
          : null);

      if (!walletPubkey || !signTransaction) {
        setError('No wallet connected');
        setStatus('error');
        return;
      }

      if (!PLATFORM_FEE_WALLET) {
        setError('Platform fee wallet not configured');
        setStatus('error');
        return;
      }

      try {
        // ── Step 1: Fetch subscription details from backend ───────────────
        setStatus('building');
        const initiateRes = await fetch('/api/subscription/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicationId }),
        });

        if (!initiateRes.ok) {
          const { error: msg } = await initiateRes.json();
          throw new Error(msg ?? 'Failed to initiate subscription');
        }

        const { amount, creatorWallet, subscriptionId } =
          (await initiateRes.json()) as {
            amount: number;
            creatorWallet: string;
            subscriptionId: string;
          };

        // ── Step 2: Build the unsigned transaction ────────────────────────
        const connection = getConnection();
        const tx = await buildSubscriptionTransaction({
          payerWallet: walletPubkey,
          creatorWallet: new PublicKey(creatorWallet),
          amountUsdc: amount,
          platformFeeWallet: new PublicKey(PLATFORM_FEE_WALLET),
          connection,
        });

        // ── Step 3: Sign ──────────────────────────────────────────────────
        setStatus('awaiting_signature');
        const signedTx = await signTransaction(tx);

        // ── Step 4: Send ──────────────────────────────────────────────────
        setStatus('confirming');
        const rawTx = signedTx.serialize();
        const signature = await connection.sendRawTransaction(rawTx, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        setTxSignature(signature);

        // ── Step 5: Poll for confirmation ─────────────────────────────────
        const { value: confirmationResult } =
          await connection.confirmTransaction(
            {
              signature,
              ...(await connection.getLatestBlockhash('confirmed')),
            },
            'confirmed'
          );

        if (confirmationResult?.err) {
          throw new Error('Transaction failed during confirmation');
        }

        // ── Step 6: Tell backend to verify & activate subscription ────────
        const confirmRes = await fetch('/api/subscription/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txSignature: signature, subscriptionId }),
        });

        if (!confirmRes.ok) {
          const { error: msg } = await confirmRes.json();
          throw new Error(msg ?? 'Backend confirmation failed');
        }

        setStatus('success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('error');
      }
    },
    [publicKey, privyUser, signTransaction]
  );

  return { initiatePayment, status, txSignature, error, reset };
}
