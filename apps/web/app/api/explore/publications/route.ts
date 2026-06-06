import { NextResponse } from 'next/server';
import { db, publications, users, posts, eq, and, desc } from '@solscribe/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const query = searchParams.get('q') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Fetch publications with owners and latest posts
    const allPubs = await db.query.publications.findMany({
      where: eq(publications.isPublished, true),
      orderBy: [desc(publications.subscriberCount), desc(publications.createdAt)],
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

    // We filter in JS since category is keyword-based on description/name
    let filtered = allPubs;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(pub => 
        pub.name.toLowerCase().includes(q) || 
        (pub.description && pub.description.toLowerCase().includes(q))
      );
    }

    if (category !== 'all') {
      const cat = category.toLowerCase();
      const categoryKeywords: Record<string, string[]> = {
        tech: ['tech', 'software', 'develop', 'code', 'engineering', 'ai', 'computer', 'science'],
        finance: ['finance', 'money', 'stock', 'invest', 'macro', 'economics', 'trading', 'market'],
        crypto: ['crypto', 'web3', 'solana', 'blockchain', 'ethereum', 'token', 'usdc', 'defi', 'nft', 'btc'],
        culture: ['culture', 'society', 'life', 'story', 'philosophy', 'politics', 'book', 'art', 'design'],
        health: ['health', 'medicine', 'biology', 'wellbeing', 'fitness', 'diet', 'nutrition', 'science'],
        research: ['research', 'paper', 'academic', 'study', 'analysis', 'investigation', 'science', 'data'],
      };
      const keywords = categoryKeywords[cat] || [];
      filtered = filtered.filter(pub => {
        const descText = (pub.description || '').toLowerCase();
        const nameText = pub.name.toLowerCase();
        return keywords.some(kw => descText.includes(kw) || nameText.includes(kw));
      });
    }

    // Paginate
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      publications: paginated.map(pub => ({
        id: pub.id,
        name: pub.name,
        slug: pub.slug,
        description: pub.description,
        coverImageUrl: pub.coverImageUrl,
        monthlyPriceUsdc: pub.monthlyPriceUsdc ? Number(pub.monthlyPriceUsdc) : 0,
        subscriberCount: pub.subscriberCount,
        owner: pub.owner,
        latestPost: pub.posts[0] || null,
      })),
      hasMore: offset + limit < filtered.length,
      total: filtered.length,
    });
  } catch (error) {
    console.error('[API Explore Publications] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch publications' }, { status: 500 });
  }
}
