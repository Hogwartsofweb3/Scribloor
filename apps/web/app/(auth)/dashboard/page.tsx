"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  BookOpen,
  Mail,
  RefreshCw,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import RevenueChart from '@/components/dashboard/RevenueChart';
import SubscriberGrowthChart from '@/components/dashboard/SubscriberGrowthChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import SubscriberTable from '@/components/dashboard/SubscriberTable';

export default function CreatorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) {
        throw new Error('Failed to retrieve analytics data');
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error querying analytics dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-zinc-500 select-none">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Compiling Creator Analytics...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-center select-none">
        <span className="text-2xl block mb-2">⚠️</span>
        <h3 className="text-base font-bold text-red-400 mb-1">Failed to load dashboard</h3>
        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">{error}</p>
        <Button onClick={fetchStats} className="font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
          Try Reloading
        </Button>
      </div>
    );
  }

  // Fallback visual screen for onboarding new creators without active publications
  if (stats?.noPublication) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center select-none">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 mb-6 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 mb-4">
          Ready to Monetize Your Insights?
        </h1>
        <p className="max-w-lg mx-auto text-sm text-zinc-400 leading-relaxed mb-8">
          Welcome to Solscribe! To unlock the creator analytics suite, schedule articles, and accept USDC subscription fees directly to your Solana wallet, you must first launch your premium publication.
        </p>
        <Link href="/dashboard/new-publication">
          <Button className="font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-5 shadow-lg shadow-amber-500/10">
            Launch Your Publication <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Dashboard Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-1">
            Creator Hub
          </h1>
          <p className="text-sm text-zinc-400">
            Real-time subscriber metrics, USDC earnings, and article performance indicators
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-850 hover:border-zinc-800 bg-zinc-950/40 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card: Subscribers */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex items-start justify-between gap-4 select-none hover:border-zinc-700/60 transition duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Active Subscribers
            </span>
            <span className="text-3xl font-black text-zinc-100 font-sans tracking-tight">
              {stats.subscribers.total}
            </span>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +{stats.subscribers.newThisMonth} new this month
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/10 text-amber-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card: Monthly Earnings */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex items-start justify-between gap-4 select-none hover:border-zinc-700/60 transition duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Earnings (This Month)
            </span>
            <span className="text-3xl font-black text-zinc-100 font-sans tracking-tight">
              ${stats.revenue.thisMonth.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              ALL-TIME: ${stats.revenue.allTime.toFixed(2)} USDC
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card: Published Posts */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex items-start justify-between gap-4 select-none hover:border-zinc-700/60 transition duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Articles Published
            </span>
            <span className="text-3xl font-black text-zinc-100 font-sans tracking-tight">
              {stats.posts.published}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {stats.posts.drafts} DRAFTS, {stats.posts.total} TOTAL
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/10 text-sky-500">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card: Email Open Rate */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex items-start justify-between gap-4 select-none hover:border-zinc-700/60 transition duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              30d Email Open Rate
            </span>
            <span className="text-3xl font-black text-zinc-100 font-sans tracking-tight">
              {stats.emailStats.openRate}%
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {stats.emailStats.opened} OPENED / {stats.emailStats.sent} SENT
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/10 text-violet-500">
            <Mail className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.revenueTimeline} />
        <SubscriberGrowthChart data={stats.subscriberGrowth} />
      </div>

      {/* Lower Dashboard Detail Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Paginated Subscribers Table (span 8) */}
        <div className="lg:col-span-8">
          <SubscriberTable subscribers={stats.subscribersList} />
        </div>

        {/* Right: Recent Activity Log Feed (span 4) */}
        <div className="lg:col-span-4">
          <RecentActivity activities={stats.recentActivity} />
        </div>
      </div>
    </div>
  );
}
