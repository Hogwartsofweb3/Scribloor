'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  DollarSign,
  BookOpen,
  Mail,
  RefreshCw,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import SubscriberGrowthChart from '@/components/dashboard/SubscriberGrowthChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TopPosts from '@/components/dashboard/TopPosts';
import LocalCurrencyAmount from '@/components/dashboard/LocalCurrencyAmount';

export default function CreatorDashboard() {
  const [revenuePeriod, setRevenuePeriod] = useState<'30' | '60' | '90'>('60');
  const [subscribersPeriod, setSubscribersPeriod] = useState<'30' | '60' | '90'>('60');

  // 1. Fetch dashboard statistics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stats, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) {
        throw new Error('Failed to retrieve analytics data');
      }
      return res.json();
    },
  });

  // 2. Real-time subscription alert via SSE stream
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.addEventListener('new_subscription', (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as {
          wallet: string;
          amount: string;
          publicationName: string;
        };

        // Trigger react-hot-toast with requested specs
        toast.custom(
          (t) => (
            <div
              className={cn(
                'max-w-md w-full bg-white dark:bg-zinc-950 border-l-4 border-teal-500 shadow-xl rounded-r-lg pointer-events-auto flex ring-1 ring-black/5 p-4 transition-all duration-300',
                t.visible ? 'animate-fade-in' : 'opacity-0 scale-95'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  🎉 New Subscription Confirmed!
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Received{' '}
                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                    +{payload.amount} USDC
                  </span>{' '}
                  from{' '}
                  <span className="font-mono bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">
                    {payload.wallet.substring(0, 6)}...{payload.wallet.substring(payload.wallet.length - 4)}
                  </span>{' '}
                  for <span className="font-semibold text-zinc-900 dark:text-zinc-100">{payload.publicationName}</span>
                </p>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
        
        // Refresh statistics when a new subscription is completed
        refetch();
      } catch (err) {
        console.error('Error parsing subscription toast notification:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [refetch]);

  // 3. Filter timeline data based on selected periods
  const filteredRevenueTimeline = useMemo(() => {
    if (!stats?.revenueTimeline) return [];
    const days = parseInt(revenuePeriod);
    return stats.revenueTimeline.slice(-days);
  }, [stats?.revenueTimeline, revenuePeriod]);

  const filteredSubscriberGrowth = useMemo(() => {
    if (!stats?.subscriberGrowth) return [];
    const days = parseInt(subscribersPeriod);
    return stats.subscriberGrowth.slice(-days);
  }, [stats?.subscriberGrowth, subscribersPeriod]);

  // Calculate revenue percent growth vs last month
  const revenueDelta = useMemo(() => {
    if (!stats?.revenue) return null;
    const thisMonth = stats.revenue.thisMonth ?? 0;
    const lastMonth = stats.revenue.lastMonth ?? 0;
    
    if (lastMonth > 0) {
      const pct = ((thisMonth - lastMonth) / lastMonth) * 100;
      return `${pct >= 0 ? '+' : ''}${Math.round(pct)}%`;
    }
    return thisMonth > 0 ? '+100%' : null;
  }, [stats?.revenue]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-zinc-500 select-none">
        <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-brand-500)] mb-4" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Compiling Creator Analytics...
        </span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-center select-none">
        <span className="text-2xl block mb-2">⚠️</span>
        <h3 className="text-base font-bold text-red-400 mb-1">Failed to load dashboard</h3>
        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
          {error instanceof Error ? error.message : 'Network error querying analytics dashboard stats.'}
        </p>
        <Button onClick={() => refetch()} className="font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
          Try Reloading
        </Button>
      </div>
    );
  }

  // Fallback screen for onboarding creators without active publications
  if (stats.noPublication) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center select-none">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full border border-[var(--color-brand-500)]/20 bg-[var(--color-brand-50)]/5 text-[var(--color-brand-500)] mb-6 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-4">
          Ready to Monetize Your Insights?
        </h1>
        <p className="max-w-lg mx-auto text-sm text-[var(--color-text-secondary)] leading-relaxed mb-8">
          Welcome to Solscribe! To unlock the creator analytics suite, schedule articles, and accept USDC subscription fees directly to your Solana wallet, you must first launch your publication.
        </p>
        <Link href="/dashboard/new-publication">
          <Button className="font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-6 py-5 shadow-lg">
            Launch Your Publication <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5 select-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-1">
            Creator Hub
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Real-time subscriber metrics, USDC earnings, and article performance indicators
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-white dark:bg-zinc-900 text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Checklist */}
      <OnboardingChecklist />

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label="Active Subscribers"
          value={stats.subscribers.total}
          delta={`+${stats.subscribers.newThisMonth}`}
          deltaLabel="new this month"
          icon={<Users className="w-4.5 h-4.5" />}
        />
        <MetricCard
          label="Monthly Net Revenue"
          value={<LocalCurrencyAmount amountUsdc={stats.revenue.thisMonth} />}
          delta={revenueDelta}
          deltaLabel="vs last month"
          icon={<DollarSign className="w-4.5 h-4.5" />}
          valueColor="teal"
        />
        <MetricCard
          label="Articles Published"
          value={stats.posts.published}
          icon={<BookOpen className="w-4.5 h-4.5" />}
        />
        <MetricCard
          label="Email Open Rate"
          value={`${stats.emailStats.openRate}%`}
          icon={<Mail className="w-4.5 h-4.5" />}
        />
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        {/* Revenue AreaChart */}
        <ChartCard
          title="Revenue"
          subtitle="USDC net earnings over time"
          actions={
            <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md p-0.5 text-[10px] font-bold uppercase tracking-wider">
              {(['30', '60', '90'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={cn(
                    'px-2.5 py-1 rounded transition-colors',
                    revenuePeriod === period
                      ? 'bg-[var(--color-brand-500)] text-white font-bold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {period}d
                </button>
              ))}
            </div>
          }
        >
          <RevenueChart data={filteredRevenueTimeline} exchangeRate={stats?.exchangeRate} />
        </ChartCard>

        {/* Subscriber Growth Chart */}
        <ChartCard
          title="Subscribers"
          subtitle="Newsletter distribution growth"
          actions={
            <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md p-0.5 text-[10px] font-bold uppercase tracking-wider">
              {(['30', '60', '90'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSubscribersPeriod(period)}
                  className={cn(
                    'px-2.5 py-1 rounded transition-colors',
                    subscribersPeriod === period
                      ? 'bg-[var(--color-brand-500)] text-white font-bold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {period}d
                </button>
              ))}
            </div>
          }
        >
          <SubscriberGrowthChart data={filteredSubscriberGrowth} />
        </ChartCard>
      </section>

      {/* Bottom split list details */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <RecentActivity activities={stats.recentActivity} />
        </div>
        <div className="lg:col-span-4">
          <TopPosts posts={stats.topPosts || []} />
        </div>
      </section>
    </div>
  );
}
