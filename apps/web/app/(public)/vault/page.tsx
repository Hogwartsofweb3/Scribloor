import React from 'react';
import { db, vaultEntries, users } from '@solscribe/db';
import { eq, and, desc } from '@solscribe/db';
import { VaultEntryCard } from '@/components/vault/VaultEntryCard';
import { getServerUserFromCookies } from '@/lib/auth/privy';
import { hasVaultAccess } from '@/lib/vault/access';

export const dynamic = 'force-dynamic';

export default async function VaultPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const user = await getServerUserFromCookies();
  const categoryFilter = searchParams.category;

  // Build the query
  let conditions = eq(vaultEntries.status, 'published');
  if (categoryFilter && categoryFilter !== 'all') {
    conditions = and(conditions, eq(vaultEntries.category, categoryFilter as any)) as any;
  }

  const entriesRaw = await db
    .select({
      entry: vaultEntries,
      author: users,
    })
    .from(vaultEntries)
    .innerJoin(users, eq(vaultEntries.authorId, users.id))
    .where(conditions)
    .orderBy(desc(vaultEntries.publishedAt));

  // Resolve access status for the current user
  const entriesWithAccess = await Promise.all(
    entriesRaw.map(async (row) => {
      const hasAccess = user ? await hasVaultAccess(user.id, row.entry.id) : false;
      return {
        ...row.entry,
        author: row.author,
        hasAccess,
      };
    })
  );

  const categories = ['all', 'research', 'report', 'analysis', 'guide', 'data', 'essay'];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative py-24 border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            The Vault
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
            Deep research, insightful reports, and permanent access to Solscribe's premium long-form library.
          </p>

          {!user ? (
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/50 border border-white/10 p-2 pl-6 rounded-full backdrop-blur-md">
              <span className="text-zinc-300 font-medium">Unlock everything for 5 USDC/month</span>
              <a href="/login" className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-zinc-200 transition-colors">
                Get Vault Pass
              </a>
            </div>
          ) : (
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-indigo-500/10 border border-indigo-500/30 p-2 pl-6 rounded-full backdrop-blur-md">
              <span className="text-indigo-400 font-medium">Ready to dive in?</span>
              <a href="#library" className="bg-indigo-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                Browse Library
              </a>
            </div>
          )}
        </div>
      </div>

      <div id="library" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-serif font-bold text-white">Latest Research</h2>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat}
                href={cat === 'all' ? '/vault' : `/vault?category=${cat}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  (categoryFilter === cat || (!categoryFilter && cat === 'all'))
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        {entriesWithAccess.length === 0 ? (
          <div className="text-center py-24 bg-zinc-950/50 rounded-3xl border border-white/5">
            <h3 className="text-xl text-zinc-300 mb-2">No entries found</h3>
            <p className="text-zinc-500">Check back later for new research.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entriesWithAccess.map((entry) => (
              <VaultEntryCard key={entry.id} entry={entry} hasAccess={entry.hasAccess} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
