'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, ChevronUp, X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingProgress } from '@/lib/onboarding/progress';

const checklistItems = [
  {
    key: 'profile_created',
    label: 'Create your profile handle',
    description: 'Set your display name and claim your custom username.',
    cta: '/account',
    ctaLabel: 'Edit Profile',
  },
  {
    key: 'wallet_connected',
    label: 'Link your Solana wallet',
    description: 'Set up your destination payout address to receive subscription fees.',
    cta: '/account',
    ctaLabel: 'Link Wallet',
  },
  {
    key: 'publication_created',
    label: 'Launch your publication',
    description: 'Establish your name, pricing tiers, and landing portal.',
    cta: '/dashboard/settings',
    ctaLabel: 'Launch Pub',
  },
  {
    key: 'first_post_published',
    label: 'Publish your first post',
    description: 'Draft, format, and share your first issue with readers.',
    cta: '/dashboard/posts/new',
    ctaLabel: 'Write Post',
  },
  {
    key: 'first_subscriber',
    label: 'Gain your first subscriber',
    description: 'Share your link and welcome your first USDC subscriber.',
    cta: '/dashboard',
    ctaLabel: 'Share Link',
  },
];

export default function OnboardingChecklist() {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(true); // Default to true until checked in client mount

  const { data: progress } = useQuery<OnboardingProgress>({
    queryKey: ['onboarding-progress'],
    queryFn: async () => {
      const res = await fetch('/api/onboarding/progress');
      if (!res.ok) throw new Error('Failed to load onboarding progress');
      return res.json();
    },
  });

  useEffect(() => {
    const isDismissed = localStorage.getItem('onboarding-checklist-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  if (!progress) return null;
  if (progress.isComplete || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('onboarding-checklist-dismissed', 'true');
    setDismissed(true);
  };

  const stepsDone = progress.steps || [];
  const completedCount = stepsDone.length;
  const percent = Math.round((completedCount / 5) * 100);

  return (
    <div className="w-full border border-[var(--color-brand-500)]/20 bg-gradient-to-r from-[var(--color-brand-50)]/20 to-transparent dark:from-[var(--color-brand-500)]/5 dark:to-transparent rounded-[var(--radius-lg)] p-5 relative select-none animate-fade-in">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition"
        title="Dismiss checklist"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3.5 pr-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 flex items-center justify-center text-[var(--color-brand-500)] shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            Creator Setup Checklist
            <span className="text-[10px] uppercase font-bold text-white bg-[var(--color-brand-500)] px-2 py-0.5 rounded-full font-mono">
              {completedCount}/5 Done
            </span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Complete these steps to fully establish your publication and start earning USDC.
          </p>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)]"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-brand-500)] transition-all duration-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-[var(--color-text-primary)] whitespace-nowrap">
          {percent}%
        </span>
      </div>

      {/* Collapsible Steps list */}
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-5 border-t border-[var(--color-border)] pt-4 animate-fade-in">
          {checklistItems.map((item, index) => {
            const isCompleted = stepsDone.includes(item.key as any);
            return (
              <div
                key={item.key}
                className={cn(
                  'p-3.5 rounded-[var(--radius-md)] border flex flex-col justify-between gap-3 transition-all',
                  isCompleted
                    ? 'bg-[var(--color-teal-50)]/20 dark:bg-[var(--color-teal-400)]/5 border-[var(--color-teal-400)]/20'
                    : 'bg-white/40 dark:bg-zinc-950/20 border-[var(--color-border)]'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <div className="w-4 h-4 rounded-full bg-[var(--color-teal-400)] flex items-center justify-center text-white shrink-0 shadow-sm shadow-teal-500/20">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[var(--color-border-strong)] flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-[var(--color-text-muted)] font-mono">{index + 1}</span>
                      </div>
                    )}
                    <span className={cn('text-xs font-bold text-[var(--color-text-primary)]', isCompleted && 'line-through opacity-70')}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {!isCompleted && (
                  <Link href={item.cta} className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors mt-auto">
                    {item.ctaLabel}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
