import type { Metadata } from 'next';
import { Inter, Lora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import SubscribeModal from '@/components/subscribe/SubscribeModal';
import MobileTabBar from '@/components/layout/MobileTabBar';

// New global UI state components
import { Toaster } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TipModal from '@/components/ui/TipModal';
import ShareSheet from '@/components/ui/ShareSheet';
import CommandPalette from '@/components/ui/CommandPalette';
import KeyboardShortcuts from '@/components/layout/KeyboardShortcuts';
import InstallPWAPrompt from '@/components/ui/InstallPWAPrompt';
import OfflineBanner from '@/components/shared/OfflineBanner';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-serif',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://mainnet.helius-rpc.com" />
        <link rel="preconnect" href="https://api.resend.com" />
        <link rel="dns-prefetch" href="https://mainnet.helius-rpc.com" />
        <link rel="dns-prefetch" href="https://api.resend.com" />
        {/* Google Tag Manager — uncomment when GTM container is ready
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');`,
          }}
        />
        */}
      </head>
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OfflineBanner />
          {children}
          
          {/* Global UI Components */}
          <Toaster />
          <ConfirmModal />
          <TipModal />
          <ShareSheet />
          <CommandPalette />
          <KeyboardShortcuts />
          <InstallPWAPrompt />
          
          <SubscribeModal />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
