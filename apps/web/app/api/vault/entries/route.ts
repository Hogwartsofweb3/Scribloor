import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultEntries, users } from '@solscribe/db';
import { eq, and, desc, asc } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const cacheKey = `vault:entries:${category || 'all'}:${sort}:${page}`;

    // Try Redis cache (2 min TTL)
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return NextResponse.json(cached);
    } catch (_) {}

    // Build where conditions
    const conditions: any[] = [eq(vaultEntries.status, 'published')];
    if (category && category !== 'all') {
      conditions.push(eq(vaultEntries.category, category as any));
    }

    // Order By
    const orderBy =
      sort === 'most_accessed' ? desc(vaultEntries.accessCount) :
      sort === 'price_asc' ? asc(vaultEntries.singleAccessPriceUsdc) :
      desc(vaultEntries.publishedAt);

    const results = await db
      .select({
        entry: vaultEntries,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(vaultEntries)
      .innerJoin(users, eq(vaultEntries.authorId, users.id))
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    const data = results.map(r => ({ ...r.entry, author: r.author }));

    // Cache for 2 minutes
    try {
      await redis.set(cacheKey, data, { ex: 120 });
    } catch (_) {}

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Vault Entries API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
