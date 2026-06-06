'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#111110] text-[var(--color-text-primary)] select-none">
      {/* Mini Header */}
      <header className="h-[60px] border-b border-[var(--color-border)] flex items-center px-6 md:px-10">
        <Link href="/" className="font-serif font-bold text-lg tracking-tight">
          Sol<span className="text-[var(--color-brand-500)]">scribe</span>
        </Link>
      </header>

      {/* Error Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-red-50)] dark:bg-red-500/10 flex items-center justify-center text-[var(--color-error)] mb-6">
          <span className="font-bold text-2xl">!</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight font-sans mb-3">
          Something went wrong
        </h1>

        <p className="max-w-md mx-auto text-sm text-[var(--color-text-secondary)] leading-relaxed mb-8">
          An unexpected error occurred while loading this page.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition-colors shadow"
          >
            Try again
          </button>
          <Link href="/">
            <button className="px-5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold transition-colors">
              Back to home
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
