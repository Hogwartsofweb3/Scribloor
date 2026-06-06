import React, { Suspense } from 'react';
import { db, publications, posts, users, eq, and, desc, gte } from '@solscribe/db';
import ExploreClient from '@/components/explore/ExploreClient';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Explore Solscribe — Discover Creators',
  description: 'Search publications, posts, and research from top creators around the world.',
};

export default async function ExplorePage() {
  // 1. Fetch featured publications (top 3 by subscribers)
  const featuredPubs = await db.query.publications.findMany({
    where: eq(publications.isPublished, true),
    orderBy: [desc(publications.subscriberCount)],
    limit: 3,
    with: {
      owner: {
        columns: {
          id: true,
          displayName: true,
          avatarUrl: true,
          username: true,
        }
      }
    }
  });

  // 2. Fetch trending posts (top 5 posts by views)
  const trendingPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      pubName: publications.name,
      pubSlug: publications.slug,
      viewCount: posts.viewCount,
    })
    .from(posts)
    .innerJoin(publications, eq(posts.publicationId, publications.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.viewCount))
    .limit(5);

  // 3. Fetch new publications this month (launched in last 30 days, limit 4)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPubs = await db.query.publications.findMany({
    where: and(
      eq(publications.isPublished, true),
      gte(publications.createdAt, thirtyDaysAgo)
    ),
    orderBy: [desc(publications.createdAt)],
    limit: 4,
    with: {
      owner: {
        columns: {
          id: true,
          displayName: true,
          avatarUrl: true,
          username: true,
        }
      }
    }
  });

  // 4. Fetch initial publications grid (first 12)
  const initialPubs = await db.query.publications.findMany({
    where: eq(publications.isPublished, true),
    orderBy: [desc(publications.subscriberCount), desc(publications.createdAt)],
    limit: 12,
    with: {
      owner: {
        columns: {
          id: true,
          displayName: true,
          avatarUrl: true,
          username: true,
        }
      },
      posts: {
        where: eq(posts.status, 'published'),
        orderBy: [desc(posts.publishedAt)],
        limit: 1,
      }
    }
  });

  // Format initial publications data
  const formattedInitialPubs = initialPubs.map((pub) => ({
    id: pub.id,
    name: pub.name,
    slug: pub.slug,
    description: pub.description,
    coverImageUrl: pub.coverImageUrl,
    monthlyPriceUsdc: pub.monthlyPriceUsdc ? Number(pub.monthlyPriceUsdc) : 0,
    subscriberCount: pub.subscriberCount,
    owner: pub.owner,
    latestPost: pub.posts[0] || null,
  }));

  const formattedFeaturedPubs = featuredPubs.map((pub) => ({
    id: pub.id,
    name: pub.name,
    slug: pub.slug,
    description: pub.description,
    coverImageUrl: pub.coverImageUrl,
    monthlyPriceUsdc: pub.monthlyPriceUsdc ? Number(pub.monthlyPriceUsdc) : 0,
    subscriberCount: pub.subscriberCount,
    owner: pub.owner,
  }));

  return (
    <div className="min-h-screen bg-black/10 select-none">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
              Loading explore page...
            </span>
          </div>
        }
      >
        <ExploreClient
          initialPublications={formattedInitialPubs}
          featuredPublications={formattedFeaturedPubs}
          trendingPosts={trendingPosts}
          newPublications={newPubs}
        />
      </Suspense>
    </div>
  );
}
