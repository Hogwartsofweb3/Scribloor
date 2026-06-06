'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, TrendingUp, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardTabsProps {
  data: {
    topPublications: any[];
    topEarners: any[];
    risingFast: any[];
    updatedAt: string;
  };
}

export default function LeaderboardTabs({ data }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'pubs' | 'earners' | 'rising'>('pubs');

  // Render rank badge style
  const getRankStyle = (index: number) => {
    const rank = index + 1;
    if (rank === 1) return 'text-purple-600 dark:text-purple-400 font-bold text-2xl';
    if (rank === 2) return 'text-teal-600 dark:text-teal-400 font-bold text-2xl';
    if (rank === 3) return 'text-amber-600 dark:text-amber-500 font-bold text-2xl';
    return 'text-zinc-400 dark:text-zinc-600 font-bold text-2xl';
  };

  const formattedUpdateTime = new Date(data.updatedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6">
      {/* Updated Hourly Indicator */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-4 select-none">
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          Updated hourly (Last update: {formattedUpdateTime})
        </span>
      </div>

      {/* Tabs list */}
      <div className="flex border border-[var(--color-border)] rounded-lg p-0.5 bg-[var(--color-bg-secondary)]/50 w-full sm:w-max select-none">
        <button
          onClick={() => setActiveTab('pubs')}
          className={cn(
            'flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap',
            activeTab === 'pubs'
              ? 'text-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-violet-950/20 font-bold shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <Users className="w-3.5 h-3.5" /> Top Publications
        </button>
        <button
          onClick={() => setActiveTab('earners')}
          className={cn(
            'flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap',
            activeTab === 'earners'
              ? 'text-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-violet-950/20 font-bold shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <DollarSign className="w-3.5 h-3.5" /> Top Earners
        </button>
        <button
          onClick={() => setActiveTab('rising')}
          className={cn(
            'flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap',
            activeTab === 'rising'
              ? 'text-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-violet-950/20 font-bold shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Rising Fast
        </button>
      </div>

      {/* Leaderboard Lists */}
      <div className="border border-[var(--color-border)] rounded-[10px] bg-white dark:bg-[#111110] shadow-sm overflow-hidden select-none">
        
        {/* Top Publications List */}
        {activeTab === 'pubs' && (
          <div className="divide-y divide-[var(--color-border)]">
            {data.topPublications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)] font-mono">No publications found.</div>
            ) : (
              data.topPublications.map((pub, index) => (
                <div key={pub.id} className="flex items-center gap-4 p-4 hover:bg-[var(--color-bg-secondary)]/30 transition-colors">
                  <span className={cn('w-8 text-center shrink-0', getRankStyle(index))}>
                    #{index + 1}
                  </span>
                  
                  {/* Cover (40px circle) */}
                  {pub.coverImageUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
                      <Image src={pub.coverImageUrl} alt={pub.name} fill unoptimized className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-brand-500)] shrink-0 text-sm">
                      {pub.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <Link href={`/${pub.slug}`} className="font-semibold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-brand-500)] hover:underline truncate block">
                      {pub.name}
                    </Link>
                    <span className="text-xs text-[var(--color-text-muted)] truncate block">
                      by {pub.ownerName || pub.ownerUsername || 'Anonymous Creator'}
                    </span>
                  </div>

                  {/* Metric */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
                      {pub.subCount.toLocaleString()}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">
                      subscribers
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Top Earners List */}
        {activeTab === 'earners' && (
          <div className="divide-y divide-[var(--color-border)]">
            {data.topEarners.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)] font-mono">No transaction records found.</div>
            ) : (
              data.topEarners.map((earner, index) => (
                <div key={earner.creatorId} className="flex items-center gap-4 p-4 hover:bg-[var(--color-bg-secondary)]/30 transition-colors">
                  <span className={cn('w-8 text-center shrink-0', getRankStyle(index))}>
                    #{index + 1}
                  </span>
                  
                  {/* Creator Avatar (40px circle) */}
                  {earner.creatorAvatar ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
                      <Image src={earner.creatorAvatar} alt={earner.creatorName || earner.creatorUsername} fill unoptimized className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-brand-500)] shrink-0 text-sm">
                      {(earner.creatorName || earner.creatorUsername || '?').charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <span className="font-semibold text-sm text-[var(--color-text-primary)] truncate block">
                      {earner.creatorName || earner.creatorUsername || 'Anonymous Creator'}
                    </span>
                    <Link href={`/${earner.publicationSlug}`} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-500)] hover:underline truncate block">
                      in {earner.publicationName}
                    </Link>
                  </div>

                  {/* Metric */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ${earner.monthlyEarnings.toFixed(2)}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">
                      usdc this month
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rising Fast List */}
        {activeTab === 'rising' && (
          <div className="divide-y divide-[var(--color-border)]">
            {data.risingFast.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)] font-mono">No rising publications found.</div>
            ) : (
              data.risingFast.map((pub, index) => (
                <div key={pub.id} className="flex items-center gap-4 p-4 hover:bg-[var(--color-bg-secondary)]/30 transition-colors">
                  <span className={cn('w-8 text-center shrink-0', getRankStyle(index))}>
                    #{index + 1}
                  </span>
                  
                  {/* Cover (40px circle) */}
                  {pub.coverImageUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
                      <Image src={pub.coverImageUrl} alt={pub.name} fill unoptimized className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-brand-500)] shrink-0 text-sm">
                      {pub.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <Link href={`/${pub.slug}`} className="font-semibold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-brand-500)] hover:underline truncate block">
                      {pub.name}
                    </Link>
                    <span className="text-xs text-[var(--color-text-muted)] truncate block">
                      by {pub.ownerName || pub.ownerUsername || 'Anonymous Creator'}
                    </span>
                  </div>

                  {/* Metric */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-[var(--color-brand-500)] dark:text-violet-400">
                      +{pub.growthRate}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">
                      subs / day
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
