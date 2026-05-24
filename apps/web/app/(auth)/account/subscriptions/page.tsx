'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Zap,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionPublication {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  monthlyPriceUsdc: number | null;
  creatorName: string;
}

interface Subscription {
  id: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  subscriberWallet: string;
  startedAt: string;
  expiresAt: string;
  daysRemaining: number;
  lastTxSignature: string | null;
  totalPaid: number;
  txCount: number;
  publication: SubscriptionPublication;
}

function DaysProgressBar({ daysRemaining }: { daysRemaining: number }) {
  const total = 30;
  const pct = Math.min(100, Math.round((daysRemaining / total) * 100));
  const color =
    daysRemaining > 14
      ? 'bg-emerald-500'
      : daysRemaining > 7
      ? 'bg-amber-400'
      : 'bg-rose-500';

  return (
    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CancelDialog({
  publicationName,
  onConfirm,
  onClose,
  loading,
}: {
  publicationName: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100">Cancel subscription?</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Cancelling your subscription to{' '}
              <span className="font-semibold text-zinc-200">{publicationName}</span> will stop future
              renewals. You&apos;ll keep access until your current term expires.{' '}
              <strong className="text-zinc-300">No refunds are issued.</strong>
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full h-10 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            Yes, cancel subscription
          </button>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold text-sm border border-zinc-800 transition"
          >
            Keep subscription
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveSubscriptionCard({
  sub,
  onCancel,
}: {
  sub: Subscription;
  onCancel: (id: string) => void;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const isUrgent = sub.daysRemaining <= 7;

  const handleConfirmCancel = async () => {
    setCancelling(true);
    await onCancel(sub.id);
    setCancelling(false);
    setShowCancel(false);
  };

  const expiresFormatted = new Date(sub.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden hover:border-zinc-700 transition group">
        {/* Cover strip */}
        {sub.publication.coverImageUrl && (
          <div
            className="h-20 w-full bg-cover bg-center opacity-60 group-hover:opacity-80 transition"
            style={{ backgroundImage: `url(${sub.publication.coverImageUrl})` }}
          />
        )}
        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Active
                </span>
                {sub.publication.monthlyPriceUsdc && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    ${sub.publication.monthlyPriceUsdc.toFixed(2)} USDC/mo
                  </span>
                )}
              </div>
              <h3 className="font-bold text-zinc-100 text-sm leading-tight truncate">
                {sub.publication.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">by {sub.publication.creatorName}</p>
            </div>
          </div>

          {/* Expiry */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Active until {expiresFormatted}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  isUrgent ? 'text-rose-400' : 'text-zinc-400'
                )}
              >
                {sub.daysRemaining}d left
              </span>
            </div>
            <DaysProgressBar daysRemaining={sub.daysRemaining} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/${sub.publication.slug}`}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition"
            >
              <BookOpen className="w-3.5 h-3.5" /> Read now
            </Link>

            {isUrgent && (
              <button
                onClick={() => setShowCancel(false)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 transition"
              >
                <Zap className="w-3.5 h-3.5" /> Renew now
              </button>
            )}

            <button
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/30 transition ml-auto"
            >
              Cancel
            </button>
          </div>

          {/* Tx link */}
          {sub.lastTxSignature && (
            <a
              href={`https://solscan.io/tx/${sub.lastTxSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition"
            >
              Last TX: {sub.lastTxSignature.substring(0, 8)}...
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {showCancel && (
        <CancelDialog
          publicationName={sub.publication.name}
          loading={cancelling}
          onConfirm={handleConfirmCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
    </>
  );
}

function ExpiredSubscriptionRow({ sub }: { sub: Subscription }) {
  const expiresFormatted = new Date(sub.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusLabel = sub.status === 'cancelled' ? 'Cancelled' : 'Expired';
  const statusColor =
    sub.status === 'cancelled'
      ? 'text-zinc-500 bg-zinc-800 border-zinc-700'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4 flex items-center gap-3 opacity-60 hover:opacity-80 transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
              statusColor
            )}
          >
            {statusLabel}
          </span>
          <span className="text-xs font-semibold text-zinc-400 truncate">
            {sub.publication.name}
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> Ended {expiresFormatted}
        </p>
      </div>
      <Link
        href={`/${sub.publication.slug}`}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition shrink-0"
      >
        Resubscribe
      </Link>
    </div>
  );
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpired, setShowExpired] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load subscriptions');
      setSubscriptions(data.subscriptions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel');
      }
      await fetchSubscriptions();
    } catch (err: unknown) {
      console.error('Cancel error:', err);
      setError(err instanceof Error ? err.message : 'Cancel failed');
    }
  };

  const active = subscriptions.filter((s) => s.status === 'active');
  const inactive = subscriptions.filter((s) =>
    ['expired', 'cancelled'].includes(s.status)
  );

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100">My Subscriptions</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your active newsletter subscriptions and access history.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={fetchSubscriptions}
              className="mt-3 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && subscriptions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-400">No subscriptions yet</h3>
            <p className="text-xs text-zinc-600 mt-1">
              Discover publications and subscribe to start reading.
            </p>
            <Link
              href="/explore"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition"
            >
              Explore publications
            </Link>
          </div>
        )}

        {/* Active subscriptions */}
        {!loading && !error && active.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Active ({active.length})
            </h2>
            {active.map((sub) => (
              <ActiveSubscriptionCard key={sub.id} sub={sub} onCancel={handleCancel} />
            ))}
          </section>
        )}

        {/* Expired/Cancelled (collapsed) */}
        {!loading && !error && inactive.length > 0 && (
          <section className="space-y-3">
            <button
              onClick={() => setShowExpired((v) => !v)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition w-full"
            >
              <ChevronDown
                className={cn('w-4 h-4 transition-transform', showExpired && 'rotate-180')}
              />
              Past subscriptions ({inactive.length})
            </button>

            {showExpired && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                {inactive.map((sub) => (
                  <ExpiredSubscriptionRow key={sub.id} sub={sub} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
