"use client";

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import { getUsdcBalance } from '@/lib/solana/tokens';

const POLL_INTERVAL_MS = 30_000;

export function useWalletBalance() {
  const { publicKey, connected } = useWallet();
  const { user: privyUser } = usePrivy();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Resolve the active wallet address: adapter wallet > Privy embedded wallet
  const walletAddress =
    publicKey?.toBase58() ??
    privyUser?.wallet?.address ??
    null;

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }
    setIsLoading(true);
    try {
      const bal = await getUsdcBalance(walletAddress);
      setBalance(bal);
    } catch {
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Fetch immediately when wallet connects
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Poll every 30s while a wallet is present
  useEffect(() => {
    if (!walletAddress) return;
    const id = setInterval(fetchBalance, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [walletAddress, fetchBalance]);

  return { balance, isLoading, refetch: fetchBalance };
}
