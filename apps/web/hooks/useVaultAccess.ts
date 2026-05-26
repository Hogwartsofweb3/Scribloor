"use client";

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { buildSubscriptionTransaction } from '@/lib/solana/payment';
import { getConnection } from '@/lib/solana/connection';
import { PLATFORM_FEE_WALLET } from '@/lib/solana/constants';
import { useRouter } from 'next/navigation';

export type VaultPaymentStatus =
  | 'idle'
  | 'building'
  | 'awaiting_signature'
  | 'confirming'
  | 'success'
  | 'error';

interface UseVaultAccessReturn {
  purchaseSingleAccess: (entryId: string) => Promise<void>;
  purchaseVaultPass: () => Promise<void>;
  status: VaultPaymentStatus;
  txSignature: string | null;
  error: string | null;
  reset: () => void;
}

export function useVaultAccess(): UseVaultAccessReturn {
  const { publicKey, signTransaction } = useWallet();
  const { user: privyUser } = usePrivy();
  const router = useRouter();
  
  const [status, setStatus] = useState<VaultPaymentStatus>('idle');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setTxSignature(null);
    setError(null);
  }, []);

  const getSignerWallet = () => {
    const walletPubkey = publicKey ?? (privyUser?.wallet?.address ? new PublicKey(privyUser.wallet.address) : null);
    if (!walletPubkey || !signTransaction) {
      throw new Error('No wallet connected');
    }
    if (!PLATFORM_FEE_WALLET) {
      throw new Error('Platform fee wallet not configured');
    }
    return { walletPubkey, signTransaction };
  };

  const processPayment = async (initiateEndpoint: string, body: any, confirmEndpoint: string) => {
    try {
      const { walletPubkey, signTransaction } = getSignerWallet();

      // Step 1: Initiate
      setStatus('building');
      const initiateRes = await fetch(initiateEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!initiateRes.ok) {
        const { error: msg } = await initiateRes.json();
        throw new Error(msg ?? 'Failed to initiate payment');
      }

      const initiateData = await initiateRes.json();
      const { amount, creatorWallet, passId, recordId } = initiateData;

      // Step 2: Build
      const connection = getConnection();
      const tx = await buildSubscriptionTransaction({
        payerWallet: walletPubkey,
        creatorWallet: creatorWallet ? new PublicKey(creatorWallet) : new PublicKey(PLATFORM_FEE_WALLET), 
        amountUsdc: amount,
        platformFeeWallet: new PublicKey(PLATFORM_FEE_WALLET),
        connection,
      });

      // Step 3: Sign
      setStatus('awaiting_signature');
      const signedTx = await signTransaction(tx);

      // Step 4: Send
      setStatus('confirming');
      const rawTx = signedTx.serialize();
      const signature = await connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      setTxSignature(signature);

      // Step 5: Confirm
      const { value: confirmationResult } = await connection.confirmTransaction(
        { signature, ...(await connection.getLatestBlockhash('confirmed')) },
        'confirmed'
      );

      if (confirmationResult?.err) {
        throw new Error('Transaction failed during confirmation');
      }

      // Step 6: Backend Verification
      const confirmRes = await fetch(confirmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          txSignature: signature, 
          entryId: body.entryId,
          passId,
          recordId 
        }),
      });

      if (!confirmRes.ok) {
        const { error: msg } = await confirmRes.json();
        throw new Error(msg ?? 'Backend confirmation failed');
      }

      setStatus('success');
      router.refresh();
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
    }
  };

  const purchaseSingleAccess = useCallback(async (entryId: string) => {
    reset();
    await processPayment('/api/vault/access/single', { entryId }, '/api/vault/access/confirm');
  }, [publicKey, privyUser, signTransaction, reset, router]);

  const purchaseVaultPass = useCallback(async () => {
    reset();
    await processPayment('/api/vault/pass', {}, '/api/vault/pass/confirm');
  }, [publicKey, privyUser, signTransaction, reset, router]);

  return { purchaseSingleAccess, purchaseVaultPass, status, txSignature, error, reset };
}
