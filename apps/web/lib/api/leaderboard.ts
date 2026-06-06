import { db, publications, users, transactions, subscriptions, eq, desc, and, sql } from '@solscribe/db';
import { redis } from '@/lib/redis';

export async function getLeaderboardData(): Promise<any> {
  const cacheKey = 'public:leaderboard:data';

  try {
    // 1. Try Cache (1 hour TTL)
    try {
      const cached = await redis.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (cacheErr) {
      console.error('[Leaderboard Cache] Redis read error:', cacheErr);
    }

    const now = new Date();
    const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 2. Query Top Publications
    const topPubs = await db.select({
      id: publications.id,
      name: publications.name,
      slug: publications.slug,
      coverImageUrl: publications.coverImageUrl,
      ownerName: users.displayName,
      ownerUsername: users.username,
      ownerAvatar: users.avatarUrl,
      subCount: publications.subscriberCount,
    })
    .from(publications)
    .innerJoin(users, eq(publications.ownerId, users.id))
    .where(
      and(
        eq(publications.isPublished, true),
        eq(users.isLeaderboardOptIn, true)
      )
    )
    .orderBy(desc(publications.subscriberCount))
    .limit(20);

    // 3. Query Top Earners (USDC earned this month)
    const topEarners = await db.select({
      creatorId: users.id,
      creatorName: users.displayName,
      creatorUsername: users.username,
      creatorAvatar: users.avatarUrl,
      publicationName: publications.name,
      publicationSlug: publications.slug,
      coverImageUrl: publications.coverImageUrl,
      monthlyEarnings: sql<number>`SUM(CAST(${transactions.amountUsdc} AS NUMERIC))`
    })
    .from(transactions)
    .innerJoin(subscriptions, eq(transactions.subscriptionId, subscriptions.id))
    .innerJoin(publications, eq(subscriptions.publicationId, publications.id))
    .innerJoin(users, eq(publications.ownerId, users.id))
    .where(
      and(
        eq(transactions.status, 'confirmed'),
        eq(users.isLeaderboardOptIn, true),
        sql`${transactions.createdAt} >= ${firstOfCurrentMonth}`
      )
    )
    .groupBy(
      users.id, 
      users.displayName, 
      users.username, 
      users.avatarUrl, 
      publications.name, 
      publications.slug, 
      publications.coverImageUrl
    )
    .orderBy(desc(sql`SUM(CAST(${transactions.amountUsdc} AS NUMERIC))`))
    .limit(20);

    // 4. Query Rising Fast (< 30 days old publications sorted by growth rate)
    const risingPubs = await db.select({
      id: publications.id,
      name: publications.name,
      slug: publications.slug,
      coverImageUrl: publications.coverImageUrl,
      createdAt: publications.createdAt,
      ownerName: users.displayName,
      ownerUsername: users.username,
      ownerAvatar: users.avatarUrl,
      subCount: publications.subscriberCount,
    })
    .from(publications)
    .innerJoin(users, eq(publications.ownerId, users.id))
    .where(
      and(
        eq(publications.isPublished, true),
        eq(users.isLeaderboardOptIn, true),
        sql`${publications.createdAt} >= ${thirtyDaysAgo}`
      )
    );

    // Calculate growth rate in JS: subscriber count / days old
    const risingPubsWithGrowth = risingPubs.map((pub) => {
      const msDiff = now.getTime() - new Date(pub.createdAt).getTime();
      const days = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
      const growthRate = pub.subCount / days; // subscribers per day
      return {
        id: pub.id,
        name: pub.name,
        slug: pub.slug,
        coverImageUrl: pub.coverImageUrl,
        ownerName: pub.ownerName,
        ownerUsername: pub.ownerUsername,
        ownerAvatar: pub.ownerAvatar,
        subCount: pub.subCount,
        growthRate: Math.round(growthRate * 100) / 100,
      };
    })
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 20);

    const leaderboardData = {
      topPublications: topPubs,
      topEarners: topEarners.map(e => ({
        ...e,
        monthlyEarnings: parseFloat(e.monthlyEarnings.toString())
      })),
      risingFast: risingPubsWithGrowth,
      updatedAt: now.toISOString()
    };

    // Cache in Redis for 1 hour
    try {
      await redis.set(cacheKey, leaderboardData, { ex: 3600 });
    } catch (cacheSetErr) {
      console.error('[Leaderboard Cache] Redis write error:', cacheSetErr);
    }

    return leaderboardData;
  } catch (error) {
    console.error('[Leaderboard Logic] Error:', error);
    return null;
  }
}
