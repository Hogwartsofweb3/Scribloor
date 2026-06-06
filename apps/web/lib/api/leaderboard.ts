import { db, publications, users, transactions, subscriptions, eq, desc, and, sql } from '@solscribe/db';
import { redis } from '@/lib/redis';

export async function getLeaderboardData(): Promise<any> {
  const cacheKey = 'public:leaderboard:data';

  try {
    // 1. Try Cache (1 hour TTL)
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Build Leaderboard Data
    const topPubs = await db.select({
      id: publications.id,
      name: publications.name,
      description: publications.description,
      ownerName: users.displayName,
      ownerAvatar: users.avatarUrl,
      subCount: sql<number>`count(${subscriptions.id})`
    })
    .from(publications)
    .innerJoin(users, and(eq(publications.ownerId, users.id), eq(users.isLeaderboardOptIn, true)))
    .leftJoin(subscriptions, and(eq(subscriptions.publicationId, publications.id), eq(subscriptions.status, 'active')))
    .groupBy(publications.id, users.displayName, users.avatarUrl)
    .orderBy(desc(sql<number>`count(${subscriptions.id})`))
    .limit(10);

    const leaderboardData = {
      topPublications: topPubs,
      topCreators: [], // Placeholder for complex join
      updatedAt: new Date().toISOString()
    };

    // Cache for 1 hour
    await redis.set(cacheKey, leaderboardData, { ex: 3600 });

    return leaderboardData;
  } catch (error) {
    console.error('[Leaderboard Logic] Error:', error);
    return null;
  }
}
