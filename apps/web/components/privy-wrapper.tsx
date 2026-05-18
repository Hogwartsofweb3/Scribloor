"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const solanaConnectors = toSolanaWalletConnectors({
    shouldAutoConnect: false,
  });

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'dummy'}
      config={{
        loginMethods: ['email', 'google', 'twitter', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#f59e0b',
          logo: 'https://auth.privy.io/logos/privy-logo.png',
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
