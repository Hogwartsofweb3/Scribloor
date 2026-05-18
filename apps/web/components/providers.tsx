"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import dynamic from 'next/dynamic';

const PrivyWrapper = dynamic(() => import('./privy-wrapper'), { ssr: false });

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <PrivyWrapper>
        {children}
      </PrivyWrapper>
    </NextThemesProvider>
  );
}
