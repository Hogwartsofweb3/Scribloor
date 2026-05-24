import { db, subscriptions } from '@solscribe/db';
import { eq, and, gt } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export async function hasActiveSubscription({
  userId,
  publicationId,
}: {
  userId: string;
  publicationId: string;
}): Promise<boolean> {
  const cacheKey = `sub:access:${userId}:${publicationId}`;

  // 1. Check Redis cache first
  try {
    const cached = await redis.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  } catch (error) {
    console.error('Redis cache error during subscription check:', error);
  }

  // 2. Fallback to DB query
  const now = new Date();
  const activeSub = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.subscriberId, userId),
      eq(subscriptions.publicationId, publicationId),
      eq(subscriptions.status, 'active'),
      gt(subscriptions.expiresAt, now)
    ),
  });

  const hasAccess = !!activeSub;

  // 3. Update Redis cache with 5-minute TTL
  try {
    await redis.set(cacheKey, hasAccess, { ex: 300 });
  } catch (error) {
    console.error('Redis cache set error:', error);
  }

  return hasAccess;
}

export async function getSubscriptionStatus({
  userId,
  publicationId,
}: {
  userId: string;
  publicationId: string;
}): Promise<{
  status: 'active' | 'expired' | 'none';
  expiresAt: Date | null;
  daysRemaining: number | null;
}> {
  const sub = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.subscriberId, userId),
      eq(subscriptions.publicationId, publicationId)
    ),
  });

  if (!sub) {
    return { status: 'none', expiresAt: null, daysRemaining: null };
  }

  const now = new Date();
  const isExpired = sub.expiresAt < now || sub.status !== 'active';

  if (isExpired) {
    return {
      status: 'expired',
      expiresAt: sub.expiresAt,
      daysRemaining: 0,
    };
  }

  // Calculate days remaining
  const msRemaining = sub.expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  return {
    status: 'active',
    expiresAt: sub.expiresAt,
    daysRemaining,
  };
}
