'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-center select-none">
      <div className="w-16 h-16 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 animate-pulse" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 font-sans mb-3">
        Something went wrong
      </h1>
      
      <p className="max-w-md mx-auto text-sm text-zinc-400 leading-relaxed mb-8">
        {isDev 
          ? error.message || 'An unexpected client-side exception occurred.'
          : 'An unexpected error occurred. Our engineering team has been notified.'}
      </p>

      {isDev && error.stack && (
        <pre className="max-w-xl mx-auto p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-left text-xs font-mono text-zinc-500 overflow-auto max-h-48 mb-8 scrollbar-thin">
          {error.stack}
        </pre>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center">
        <Button
          onClick={reset}
          className="flex items-center justify-center gap-1.5 h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </Button>
        <Link href="/" className="w-full">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-1.5 h-11 w-full border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold"
          >
            <Home className="w-4 h-4" /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
