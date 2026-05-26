import React from 'react';
import { notFound } from 'next/navigation';
import { db, vaultEntries, users } from '@solscribe/db';
import { eq, sql } from '@solscribe/db';
import { getServerUserFromCookies } from '@/lib/auth/privy';
import { hasVaultAccess } from '@/lib/vault/access';
import { VaultAccessGate } from '@/components/vault/VaultAccessGate';
import { Clock, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

export default async function VaultEntryPage({ params }: { params: { slug: string } }) {
  const user = await getServerUserFromCookies();

  const result = await db
    .select({
      entry: vaultEntries,
      author: users,
    })
    .from(vaultEntries)
    .innerJoin(users, eq(vaultEntries.authorId, users.id))
    .where(eq(vaultEntries.slug, params.slug))
    .limit(1);

  if (!result || result.length === 0) {
    notFound();
  }

  const { entry, author } = result[0];

  // Check access
  const hasAccess = user ? await hasVaultAccess(user.id, entry.id) : false;
  
  // Determine access state
  // We can look up if they have a Vault pass or a single access to pass down for UI state
  let accessState: 'no_access' | 'single_access' | 'vault_pass' = 'no_access';
  
  if (hasAccess && user) {
    // If they have access, we can quickly determine which one it is (pass or single)
    // For simplicity of this page render, we can default to 'vault_pass' if they have one, else 'single_access'
    const activePass = await db.query.vaultPassSubscriptions.findFirst({
      where: (pubs, { and, eq, gt }) => and(
        eq(pubs.subscriberId, user.id),
        eq(pubs.status, 'active'),
        gt(pubs.expiresAt, new Date())
      )
    });
    accessState = activePass ? 'vault_pass' : 'single_access';
    
    // Increment access count if it's a view (since we render on server, we do it here asynchronously)
    db.update(vaultEntries)
      .set({ accessCount: sql`${vaultEntries.accessCount} + 1` })
      .where(eq(vaultEntries.id, entry.id))
      .execute()
      .catch(console.error);
  }

  const sanitizedContent = hasAccess ? DOMPurify.sanitize(entry.contentHtml) : '';

  return (
    <div className="min-h-screen bg-black text-zinc-300 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/vault" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
              {entry.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            {entry.title}
          </h1>

          <p className="text-xl text-zinc-400 leading-relaxed mb-8">
            {entry.abstract}
          </p>

          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-white/10 text-sm">
            <div className="flex items-center gap-3">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800" />
              )}
              <div>
                <p className="font-medium text-white">{author.displayName || author.username}</p>
                <p className="text-zinc-500">Researcher</p>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-6 text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString() : 'Draft'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{entry.readTimeMinutes} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(entry.accessCount)} accesses</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {entry.coverImageUrl && (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 border border-white/10">
            <img src={entry.coverImageUrl} alt="" className="object-cover w-full h-full" />
          </div>
        )}

        <VaultAccessGate 
          entryId={entry.id}
          singleAccessPrice={entry.singleAccessPriceUsdc ?? 0}
          accessState={accessState}
        >
          {hasAccess && (
            <div 
              className="tiptap prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}
        </VaultAccessGate>
      </div>
    </div>
  );
}
