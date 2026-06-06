"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import dynamic from 'next/dynamic';

const PrivyWrapper = dynamic(() => import('./privy-wrapper'), { ssr: false });
const SolanaWalletProvider = dynamic(
  () => import('./providers/WalletProvider'),
  { ssr: false }
);

export function Providers({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <NextThemesProvider {...props}>
      <QueryClientProvider client={queryClient}>
        <PrivyWrapper>
          <SolanaWalletProvider>
            {children}
          </SolanaWalletProvider>
        </PrivyWrapper>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
