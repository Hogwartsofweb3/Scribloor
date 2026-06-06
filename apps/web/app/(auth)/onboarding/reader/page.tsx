'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bookmark, Bell, Compass, ArrowRight, Sparkles } from 'lucide-react';

function ReaderOnboardingContent() {
  const searchParams = useSearchParams();
  const pubName = searchParams.get('pubName') || 'your publication';
  const pubSlug = searchParams.get('pubSlug') || 'explore';

  return (
    <div className="w-full max-w-[480px] p-8 border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-white dark:bg-[#111110] shadow-xl text-center space-y-6 animate-fade-in">
      {/* Top Icon */}
      <div className="inline-flex w-16 h-16 rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border-strong)] items-center justify-center text-[var(--color-brand-500)] mx-auto animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="font-serif font-bold text-[28px] text-[var(--color-text-primary)] leading-tight">
          Welcome to Solscribe
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          You're now subscribed to <span className="font-bold text-[var(--color-brand-500)]">{pubName}</span>!
        </p>
      </div>

      {/* Explanations Grid */}
      <div className="text-left border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] p-4 space-y-4">
        {/* Bookmark */}
        <div className="flex gap-3">
          <Bookmark className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Bookmark the App</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Add Solscribe to your home screen or bookmark it for easy, one-tap access to your library.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex gap-3 border-t border-[var(--color-border)] pt-4">
          <Bell className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Enable Notifications</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Receive live alerts when creators drop new posts so you never miss an issue.
            </p>
          </div>
        </div>

        {/* Explore */}
        <div className="flex gap-3 border-t border-[var(--color-border)] pt-4">
          <Compass className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Explore Publications</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Discover other newsletters, essays, and reports matching your interests.
            </p>
          </div>
        </div>
      </div>

      {/* Start Reading CTA */}
      <Link href={pubSlug !== 'explore' ? `/${pubSlug}` : '/explore'} className="block">
        <button className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition shadow flex items-center justify-center gap-2">
          Start reading
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  );
}

export default function ReaderOnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] p-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[var(--color-brand-500)] animate-spin" />
        </div>
      }>
        <ReaderOnboardingContent />
      </Suspense>
    </main>
  );
}
