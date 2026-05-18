"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown } from 'lucide-react';

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { user: privyUser, login } = usePrivy();
  const { balance, isLoading } = useWalletBalance();

  // Prefer adapter wallet, fall back to Privy embedded wallet
  const activeAddress =
    publicKey?.toBase58() ?? privyUser?.wallet?.address ?? null;
  const isConnected = connected || !!privyUser?.wallet?.address;

  if (!isConnected) {
    return (
      <Button
        id="wallet-connect-btn"
        variant="outline"
        className="gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
        onClick={() => {
          if (privyUser) {
            setVisible(true);
          } else {
            login();
          }
        }}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* USDC Balance chip */}
      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
        {isLoading ? '…' : balance !== null ? `$${balance.toFixed(2)}` : '—'} USDC
      </span>

      {/* Address + disconnect */}
      <Button
        id="wallet-address-btn"
        variant="outline"
        size="sm"
        className="gap-1.5 border-border text-muted-foreground hover:text-foreground font-mono text-xs"
        onClick={() => {
          if (connected) {
            disconnect();
          }
        }}
      >
        {activeAddress ? truncateAddress(activeAddress) : 'Connected'}
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  );
}
