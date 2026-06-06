import React from 'react';
import { getLeaderboardData } from '@/lib/api/leaderboard';
import LeaderboardTabs from '@/components/leaderboard/LeaderboardTabs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Leaderboard — Solscribe',
  description: 'Top publications, top earning creators, and fastest growing newsletters on Solana.',
};

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8 select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100 font-serif mb-2">
          Creator Leaderboard
        </h1>
        <p className="text-sm text-zinc-400">
          Discover the top earning creators and fastest growing publications building on Solscribe
        </p>
      </div>

      {!data ? (
        <div className="py-16 text-center border border-zinc-850 rounded-2xl bg-zinc-900/10 text-zinc-500 font-mono text-sm leading-normal">
          Leaderboard metrics are currently compiling. Please check back shortly.
        </div>
      ) : (
        <LeaderboardTabs data={data} />
      )}
    </div>
  );
}
