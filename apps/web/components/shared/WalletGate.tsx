"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { usePrivy } from '@privy-io/react-auth';
import { WalletButton } from '@/components/shared/WalletButton';
import { Wallet } from 'lucide-react';

interface WalletGateProps {
  children: React.ReactNode;
  /** Optional message shown in the connection prompt */
  message?: string;
}

export function WalletGate({
  children,
  message = 'Connect your wallet to continue.',
}: WalletGateProps) {
  const { connected } = useWallet();
  const { user: privyUser } = usePrivy();
  const { setVisible } = useWalletModal();

  const hasWallet = connected || !!privyUser?.wallet?.address;

  if (hasWallet) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-card p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
        <Wallet className="h-7 w-7 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Wallet Required</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      </div>
      <WalletButton />
    </div>
  );
}
