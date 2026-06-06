'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#111110] text-[var(--color-text-primary)] select-none">
      {/* Mini Branding Header */}
      <header className="h-[60px] border-b border-[var(--color-border)] flex items-center px-6 md:px-10">
        <Link href="/" className="font-serif font-bold text-lg tracking-tight">
          Sol<span className="text-[var(--color-brand-500)]">scribe</span>
        </Link>
      </header>

      {/* Main Error Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-800 flex items-center justify-center mb-6">
          <span className="text-[var(--color-brand-500)] font-bold text-xl">404</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight font-sans mb-3">
          Page not found
        </h1>

        <p className="max-w-md mx-auto text-sm text-[var(--color-text-secondary)] leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link href="/">
          <button className="px-6 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition-colors shadow">
            Back to home
          </button>
        </Link>
      </main>
    </div>
  );
}
