import { db, vaultRevenueDistributions, vaultAccessRecords, users, vaultEntries } from '@solscribe/db';
import { and, eq, gte, lte, sql } from '@solscribe/db';
import crypto from 'crypto';

/**
 * Calculates the monthly distribution of Vault Pass revenue.
 * The platform retains a configured percentage (default 15%), and distributes the rest
 * proportionally based on how many times each author's Vault entries were accessed via Vault Pass.
 * 
 * @param targetMonth The date within the month to calculate (uses first to last day of that month)
 */
export async function calculateMonthlyDistributions(targetMonth: Date) {
  // 1. Determine period bounds (first and last day of the target month)
  const periodStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const periodEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);

  // 2. Fetch all Vault Pass revenue generated in this month
  // (In a real scenario with Stripe/Web3, we would sum the actual settled subscription payments from transactions)
  // For this model, we'll assume we know the total pool or calculate it from active subscriptions.
  // Assuming 100 active subscriptions * $5 = $500 total pool for this month as a placeholder implementation.
  const ACTIVE_SUBSCRIPTIONS = 100; 
  const MONTHLY_PRICE = 5.00;
  const TOTAL_POOL_USDC = ACTIVE_SUBSCRIPTIONS * MONTHLY_PRICE;

  const PLATFORM_FEE_PERCENT = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || '15');
  const CREATOR_POOL_USDC = TOTAL_POOL_USDC * (1 - (PLATFORM_FEE_PERCENT / 100));

  // 3. Count total Vault Pass accesses in this period across all authors
  const accessStats = await db
    .select({
      authorId: users.id,
      accesses: sql<number>`count(${vaultAccessRecords.id})::int`,
    })
    .from(vaultAccessRecords)
    .innerJoin(
      vaultEntries,
      eq(vaultAccessRecords.entryId, vaultEntries.id) // Need to join to get author
    )
    .innerJoin(
      users,
      eq(vaultEntries.authorId, users.id)
    )
    .where(
      and(
        eq(vaultAccessRecords.accessType, 'vault_pass'),
        gte(vaultAccessRecords.accessedAt, periodStart),
        lte(vaultAccessRecords.accessedAt, periodEnd)
      )
    )
    .groupBy(users.id);

  const totalAccesses = accessStats.reduce((sum, stat) => sum + stat.accesses, 0);

  // 4. Calculate shares and create distribution records
  const distributions = [];

  if (totalAccesses > 0) {
    for (const stat of accessStats) {
      const sharePercentage = stat.accesses / totalAccesses;
      const authorShareUsdc = CREATOR_POOL_USDC * sharePercentage;

      distributions.push({
        id: crypto.randomUUID(),
        authorId: stat.authorId,
        periodStart,
        periodEnd,
        accessCount: stat.accesses,
        totalPoolUsdc: TOTAL_POOL_USDC.toString(),
        authorShareUsdc: authorShareUsdc.toString(),
        status: 'pending' as const,
      });
    }

    // Insert distributions into database
    if (distributions.length > 0) {
      await db.insert(vaultRevenueDistributions).values(distributions);
    }
  }

  return distributions;
}
