import React from 'react';
import { Users } from 'lucide-react';
import { db, subscriptions, eq, desc, and } from '@solscribe/db';

interface SubscriberWallProps {
  publicationId: string;
}

export async function SubscriberWall({ publicationId }: SubscriberWallProps) {
  // Fetch up to 20 recent active subscribers who haven't opted out
  const recentSubs = await db.query.subscriptions.findMany({
    where: and(
      eq(subscriptions.publicationId, publicationId),
      eq(subscriptions.status, 'active'),
      eq(subscriptions.isSubscriberWallOptOut, false)
    ),
    orderBy: [desc(subscriptions.startedAt)],
    limit: 20,
  });

  if (!recentSubs || recentSubs.length === 0) {
    return null;
  }

  // Helper to format wallet addresses (e.g. A1b2...C3d4)
  const formatWallet = (wallet: string) => {
    if (!wallet || wallet.length < 8) return wallet;
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  return (
    <div className="mt-12 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 text-indigo-600 mr-2" />
        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
          Recent Subscribers
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {recentSubs.map((sub) => (
          <div 
            key={sub.id} 
            className="px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-mono text-slate-600 shadow-sm"
          >
            {formatWallet(sub.subscriberWallet)}
          </div>
        ))}
      </div>
      
      {recentSubs.length === 20 && (
        <p className="text-xs text-indigo-400 mt-4 font-medium">
          And many more...
        </p>
      )}
    </div>
  );
}
