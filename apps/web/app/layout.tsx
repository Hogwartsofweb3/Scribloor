import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import SubscribeModal from '@/components/subscribe/SubscribeModal';

import InstallPrompt from '@/components/shared/InstallPrompt';
import MobileTabBar from '@/components/layout/MobileTabBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Solscribe — Crypto-native newsletters on Solana',
    template: '%s | Solscribe',
  },
  description:
    'Subscribe to your favorite creators with USDC on Solana. Payments go directly to creators — no middlemen.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app'),
  openGraph: {
    type: 'website',
    siteName: 'Solscribe',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@solscribe',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Solscribe',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#534AB7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
      <head>
        <link rel="preconnect" href="https://mainnet.helius-rpc.com" />
        <link rel="preconnect" href="https://api.resend.com" />
        <link rel="dns-prefetch" href="https://mainnet.helius-rpc.com" />
        <link rel="dns-prefetch" href="https://api.resend.com" />
      </head>
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <SubscribeModal />
          <InstallPrompt />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
