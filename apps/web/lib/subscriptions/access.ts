import { db, subscriptions } from '@solscribe/db';
import { eq, and, gt } from '@solscribe/db';
import { redis } from '@/lib/redis';
import { doesWalletHoldCollectionNft } from '@/lib/solana/nft';

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

export type AccessReason = 'public' | 'subscribed' | 'nft_holder' | 'creator' | 'no_subscription' | 'no_nft' | 'not_logged_in';

export interface PostAccessResult {
  canRead: boolean;
  reason: AccessReason;
  requiredNftCollection?: string;
}

export async function getPostAccessLevel({
  userId,
  walletAddress,
  post,
  publication,
}: {
  userId: string | null;
  walletAddress: string | null;
  post: { isPaywalled: boolean; nftGateCollection: string | null; nftGateName: string | null; publicationId: string };
  publication: { ownerId: string; nftGateCollection: string | null };
}): Promise<PostAccessResult> {
  // 1. Public posts are always accessible
  if (!post.isPaywalled && !post.nftGateCollection) {
    return { canRead: true, reason: 'public' };
  }

  // 2. Must be logged in for gated content
  if (!userId) {
    return {
      canRead: false,
      reason: 'not_logged_in',
      requiredNftCollection: post.nftGateCollection ?? undefined,
    };
  }

  // 3. Creator always has access to their own content
  if (userId === publication.ownerId) {
    return { canRead: true, reason: 'creator' };
  }

  // Determine which collection gate applies (post-level overrides publication-level)
  const nftCollection = post.nftGateCollection ?? publication.nftGateCollection;

  // 4. Check NFT gate (if set) — NFT holders bypass paywall
  if (nftCollection && walletAddress) {
    const holdsNft = await doesWalletHoldCollectionNft({
      walletAddress,
      collectionAddress: nftCollection,
    });
    if (holdsNft) {
      return { canRead: true, reason: 'nft_holder' };
    }
  }

  // 5. Check subscription (if paywalled)
  if (post.isPaywalled) {
    const subscribed = await hasActiveSubscription({
      userId,
      publicationId: post.publicationId,
    });
    if (subscribed) {
      return { canRead: true, reason: 'subscribed' };
    }
  }

  // 6. Access denied — determine the reason
  if (nftCollection && !walletAddress) {
    return {
      canRead: false,
      reason: 'no_nft',
      requiredNftCollection: nftCollection,
    };
  }

  if (nftCollection) {
    // They have a wallet but don't hold the NFT, AND aren't subscribed
    return {
      canRead: false,
      reason: post.isPaywalled ? 'no_subscription' : 'no_nft',
      requiredNftCollection: nftCollection,
    };
  }

  return { canRead: false, reason: 'no_subscription' };
}
