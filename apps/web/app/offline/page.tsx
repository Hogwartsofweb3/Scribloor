"use client";

import { WifiOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h1 className="text-2xl font-bold font-serif mb-3">You're offline</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        It looks like you've lost your internet connection. But don't worry, you can still access some of the content you've read recently.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/">
            Go to Home
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>

      <div className="mt-12 w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg border-b border-border pb-3 mb-4 text-left">
          Offline Access
        </h3>
        <p className="text-sm text-muted-foreground text-left leading-relaxed">
          While you are offline, any articles or publications you have recently viewed may still be available from your device's local cache. Try navigating back using your browser's history or clicking the Home button above.
        </p>
      </div>
    </div>
  );
}
