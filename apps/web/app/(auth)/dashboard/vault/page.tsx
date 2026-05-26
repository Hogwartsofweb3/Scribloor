import React from 'react';
import { db, vaultEntries, vaultRevenueDistributions } from '@solscribe/db';
import { eq, desc } from '@solscribe/db';
import { getServerUserFromCookies } from '@/lib/auth/privy';
import { redirect } from 'next/navigation';
import { Plus, Eye, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CreatorVaultDashboard() {
  const user = await getServerUserFromCookies();
  if (!user || user.role !== 'creator') {
    redirect('/dashboard');
  }

  const entries = await db.query.vaultEntries.findMany({
    where: eq(vaultEntries.authorId, user.id),
    orderBy: [desc(vaultEntries.createdAt)],
  });

  const distributions = await db.query.vaultRevenueDistributions.findMany({
    where: eq(vaultRevenueDistributions.authorId, user.id),
    orderBy: [desc(vaultRevenueDistributions.createdAt)],
  });

  const totalEarnings = distributions.reduce((sum, dist) => sum + parseFloat(dist.authorShareUsdc), 0);
  const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Vault</h1>
          <p className="text-zinc-400">Manage your premium research and track earnings.</p>
        </div>
        <Link 
          href="/dashboard/vault/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Submit Research
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-medium">Total Vault Earnings</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalEarnings.toFixed(2)} USDC</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <Eye className="w-5 h-5" />
            <h3 className="font-medium">Total Reads</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalAccesses}</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <Clock className="w-5 h-5" />
            <h3 className="font-medium">Published Entries</h3>
          </div>
          <p className="text-3xl font-bold text-white">{entries.filter(e => e.status === 'published').length}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Your Research Entries</h2>
        </div>
        <div className="divide-y divide-white/5">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              You haven't submitted any research to The Vault yet.
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-white text-lg">{entry.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                      entry.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                      entry.status === 'pending_review' ? 'bg-amber-500/10 text-amber-500' :
                      entry.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {entry.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm max-w-2xl line-clamp-1">{entry.abstract}</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-zinc-400">
                  <div className="text-right">
                    <p className="font-medium text-zinc-300">{entry.singleAccessPriceUsdc} USDC</p>
                    <p className="text-xs">Price</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-zinc-300">{entry.accessCount}</p>
                    <p className="text-xs">Reads</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
