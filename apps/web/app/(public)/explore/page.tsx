import React from 'react';
import Link from 'next/link';
import { db, publications, posts } from '@solscribe/db';
import { eq, and, desc, gte } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { PublicationCard } from '@/components/shared/PublicationCard';
import { PostCard } from '@/components/shared/PostCard';
import {
  Search,
  Compass,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface ExplorePageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const activeCategory = searchParams.category || 'all';
  const searchQuery = searchParams.search || '';

  // 1. Fetch Featured Publications (highest subscriber counts)
  const featuredPublications = await db.query.publications.findMany({
    where: eq(publications.isPublished, true),
    orderBy: [desc(publications.subscriberCount)],
    limit: 3,
  });

  // 2. Fetch Trending Posts (last 7 days by view count, with fallback to all time if database is fresh)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let trendingPostsList = await db
    .select({
      id: posts.id,
      title: posts.title,
      subtitle: posts.subtitle,
      slug: posts.slug,
      coverImageUrl: posts.coverImageUrl,
      contentHtml: posts.contentHtml,
      isPaywalled: posts.isPaywalled,
      publishedAt: posts.publishedAt,
      viewCount: posts.viewCount,
      pubSlug: publications.slug,
    })
    .from(posts)
    .innerJoin(publications, eq(posts.publicationId, publications.id))
    .where(
      and(
        eq(posts.status, 'published'),
        gte(posts.publishedAt, sevenDaysAgo)
      )
    )
    .orderBy(desc(posts.viewCount))
    .limit(3);

  // If no posts in last 7 days, fallback to all time top posts
  if (trendingPostsList.length === 0) {
    trendingPostsList = await db
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        coverImageUrl: posts.coverImageUrl,
        contentHtml: posts.contentHtml,
        isPaywalled: posts.isPaywalled,
        publishedAt: posts.publishedAt,
        viewCount: posts.viewCount,
        pubSlug: publications.slug,
      })
      .from(posts)
      .innerJoin(publications, eq(posts.publicationId, publications.id))
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.viewCount))
      .limit(3);
  }

  // 3. Fetch New Arrivals (publications launched in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newPublications = await db.query.publications.findMany({
    where: and(
      eq(publications.isPublished, true),
      gte(publications.createdAt, thirtyDaysAgo)
    ),
    orderBy: [desc(publications.createdAt)],
    limit: 3,
  });

  // 4. Fetch All Publications for Category Directory
  const allPubsList = await db.query.publications.findMany({
    where: eq(publications.isPublished, true),
    orderBy: [desc(publications.createdAt)],
  });

  // Match category search terms statically in Javascript for extreme reliability
  const filteredPubs = allPubsList.filter((pub) => {
    // Apply search filter if present
    if (searchQuery) {
      const match =
        pub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pub.description && pub.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }

    // Apply category filter
    if (activeCategory === 'all') return true;

    const descText = (pub.description || '').toLowerCase();
    const nameText = pub.name.toLowerCase();

    const categoryKeywords: Record<string, string[]> = {
      tech: ['tech', 'software', 'develop', 'code', 'engineering', 'ai', 'computer'],
      finance: ['finance', 'money', 'stock', 'invest', 'macro', 'economics', 'trading'],
      crypto: ['crypto', 'web3', 'solana', 'blockchain', 'ethereum', 'token', 'usdc', 'defi', 'nft'],
      art: ['art', 'design', 'paint', 'creative', 'music', 'illustration', 'culture'],
      culture: ['culture', 'society', 'life', 'story', 'philosophy', 'politics', 'book'],
    };

    const keywords = categoryKeywords[activeCategory] || [];
    return keywords.some((kw) => descText.includes(kw) || nameText.includes(kw));
  });

  const categories = [
    { slug: 'all', label: '🌐 All Sectors' },
    { slug: 'crypto', label: '⚡ Crypto & Web3' },
    { slug: 'tech', label: '💻 Tech & AI' },
    { slug: 'finance', label: '📈 Finance & Macro' },
    { slug: 'art', label: '🎨 Creative Art' },
    { slug: 'culture', label: '🎭 Culture' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-12">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 select-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mb-1 flex items-center gap-2">
            <Compass className="w-8 h-8 text-amber-500" /> Explore Directory
          </h1>
          <p className="text-sm text-zinc-400">
            Discover premium publications and trending news feeds on the Solana ecosystem
          </p>
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={{
                pathname: '/explore',
                query: { category: cat.slug, ...(searchQuery ? { search: searchQuery } : {}) },
              }}
            >
              <button
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border uppercase transition',
                  activeCategory === cat.slug
                    ? 'text-amber-500 border-amber-500/20 bg-amber-500/5 font-bold'
                    : 'text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800'
                )}
              >
                {cat.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Directory Feed (span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div>
            <h2 className="text-lg font-bold text-zinc-200 uppercase tracking-widest font-mono mb-4 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" /> Newsletter Directory ({filteredPubs.length})
            </h2>

            {filteredPubs.length === 0 ? (
              <div className="p-12 border border-zinc-800 rounded-2xl bg-zinc-900/5 text-center">
                <span className="text-3xl block mb-2">🔍</span>
                <h3 className="text-base font-bold text-zinc-300 mb-1">No publications found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  No newsletters match the "{activeCategory}" filter category. Try browsing other sectors!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPubs.map((pub) => (
                  <PublicationCard
                    key={pub.id}
                    publication={{
                      id: pub.id,
                      name: pub.name,
                      slug: pub.slug,
                      description: pub.description,
                      coverImageUrl: pub.coverImageUrl,
                      monthlyPriceUsdc: pub.monthlyPriceUsdc ? Number(pub.monthlyPriceUsdc) : 0,
                      subscriberCount: pub.subscriberCount,
                      accentColor: 'amber',
                    }}
                    showSubscribeButton={true}
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebars (span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          {/* Trending Posts Feed */}
          {trendingPostsList.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Trending Articles
              </h3>
              <div className="flex flex-col gap-4">
                {trendingPostsList.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      title: post.title,
                      subtitle: post.subtitle,
                      slug: post.slug,
                      coverImageUrl: post.coverImageUrl,
                      contentHtml: post.contentHtml,
                      isPaywalled: post.isPaywalled,
                      publishedAt: post.publishedAt,
                      viewCount: post.viewCount,
                    }}
                    publicationSlug={post.pubSlug}
                  />
                ))}
              </div>
            </div>
          )}

          {/* New Arrivals Sidebar */}
          {newPublications.length > 0 && (
            <div className="flex flex-col gap-4 select-none">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" /> New Arrivals
              </h3>
              <div className="flex flex-col gap-3">
                {newPublications.map((pub) => (
                  <Link key={pub.id} href={`/${pub.slug}`}>
                    <div className="p-3 rounded-xl border border-zinc-800/40 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/10 transition duration-300 flex items-center gap-3">
                      {pub.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pub.coverImageUrl}
                          alt={pub.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center font-bold text-zinc-500">
                          {pub.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-amber-500">
                          {pub.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {pub.subscriberCount} subscribers
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
