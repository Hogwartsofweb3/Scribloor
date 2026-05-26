import { db, vaultAccessRecords, vaultPassSubscriptions } from '@solscribe/db';
import { eq, and, gt } from '@solscribe/db';
import { redis } from '@/lib/redis';

/**
 * Checks if a user has access to a specific Vault entry.
 * They have access if they either:
 * 1. Hold an active Vault Pass subscription
 * 2. Have purchased single access to this specific entry
 * 
 * Result is cached in Redis for 5 minutes.
 */
export async function hasVaultAccess(userId: string, entryId: string): Promise<boolean> {
  const cacheKey = `vault:access:${userId}:${entryId}`;

  try {
    const cached = await redis.get<boolean>(cacheKey);
    if (cached !== null) return cached;
  } catch (err) {
    console.error('[Vault] Redis cache read error:', err);
  }

  // Check 1: Does the user have an active Vault Pass?
  const activePass = await db.query.vaultPassSubscriptions.findFirst({
    where: and(
      eq(vaultPassSubscriptions.subscriberId, userId),
      eq(vaultPassSubscriptions.status, 'active'),
      gt(vaultPassSubscriptions.expiresAt, new Date())
    ),
  });

  if (activePass) {
    await cacheAccessResult(cacheKey, true);
    return true;
  }

  // Check 2: Does the user have a single access purchase for this entry?
  const singleAccess = await db.query.vaultAccessRecords.findFirst({
    where: and(
      eq(vaultAccessRecords.userId, userId),
      eq(vaultAccessRecords.entryId, entryId)
    ),
  });

  const hasAccess = !!singleAccess;
  await cacheAccessResult(cacheKey, hasAccess);

  return hasAccess;
}

async function cacheAccessResult(key: string, result: boolean) {
  try {
    await redis.set(key, result, { ex: 300 }); // Cache for 5 minutes
  } catch (err) {
    console.error('[Vault] Redis cache write error:', err);
  }
}
