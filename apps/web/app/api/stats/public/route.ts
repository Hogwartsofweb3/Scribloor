import { NextResponse } from 'next/server';
import { db, publications, transactions, posts, vaultEntries, sql } from '@solscribe/db';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = 'stats:public';
    
    // 1. Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Fetch all stats concurrently from Drizzle
    const [
      creatorsRes,
      subscribersRes,
      usdcPaidRes,
      postsRes,
      vaultRes
    ] = await Promise.all([
      db.select({ count: sql<number>`count(distinct ${publications.ownerId})` }).from(publications),
      db.select({ count: sql<number>`sum(${publications.subscriberCount})` }).from(publications),
      db.select({ amount: sql<number>`sum(${transactions.creatorReceivedUsdc})` })
        .from(transactions)
        .where(sql`${transactions.status} = 'confirmed'`),
      db.select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(sql`${posts.status} = 'published'`),
      db.select({ count: sql<number>`count(*)` })
        .from(vaultEntries)
        .where(sql`${vaultEntries.status} = 'published'`),
    ]);

    // Parse values, defaulting to 0
    const totalCreators = Number(creatorsRes[0]?.count) || 0;
    const totalSubscribers = Number(subscribersRes[0]?.count) || 0;
    const totalUsdcPaidOut = Number(usdcPaidRes[0]?.amount) || 0;
    const totalPosts = Number(postsRes[0]?.count) || 0;
    const vaultEntriesCount = Number(vaultRes[0]?.count) || 0;

    const stats = {
      totalCreators,
      totalSubscribers,
      totalUsdcPaidOut,
      totalPosts,
      vaultEntries: vaultEntriesCount,
    };

    // 3. Cache in Redis for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(stats), { ex: 300 });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Public Stats API] Error fetching stats:', error);
    // Return 200 with zeros to prevent breaking the landing page
    return NextResponse.json({
      totalCreators: 0,
      totalSubscribers: 0,
      totalUsdcPaidOut: 0,
      totalPosts: 0,
      vaultEntries: 0,
    });
  }
}
