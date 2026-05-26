import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db, creatorMilestones, subscriptions, transactions, publications, vaultEntries, eq, and, sql } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';
import { calculatePublishingStreak, MilestoneType } from '@/lib/milestones/check';

export const dynamic = 'force-dynamic';

const MILESTONE_DEFINITIONS = [
  { type: 'first_subscriber', label: 'First Subscriber', targetValue: 1, metric: 'subscribers' },
  { type: 'subscribers_10', label: '10 Subscribers', targetValue: 10, metric: 'subscribers' },
  { type: 'subscribers_100', label: '100 Subscribers', targetValue: 100, metric: 'subscribers' },
  { type: 'subscribers_1k', label: '1,000 Subscribers', targetValue: 1000, metric: 'subscribers' },
  { type: 'first_usdc', label: 'First USDC Earned', targetValue: 1, metric: 'usdc' },
  { type: 'usdc_100', label: '100 USDC Earned', targetValue: 100, metric: 'usdc' },
  { type: 'usdc_1k', label: '1,000 USDC Earned', targetValue: 1000, metric: 'usdc' },
  { type: 'usdc_10k', label: '10,000 USDC Earned', targetValue: 10000, metric: 'usdc' },
  { type: 'first_vault_entry', label: 'First Vault Entry', targetValue: 1, metric: 'vault' },
  { type: 'publishing_streak_7', label: '7-Week Publishing Streak', targetValue: 7, metric: 'streak' },
  { type: 'publishing_streak_30', label: '30-Week Publishing Streak', targetValue: 30, metric: 'streak' },
];

export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Fetch Achieved Milestones
    const achieved = await db.select().from(creatorMilestones).where(eq(creatorMilestones.userId, user.id));
    const achievedTypes = new Set(achieved.map(m => m.milestoneType));

    // 2. Fetch Current Stats
    const userPubs = await db.select({ id: publications.id }).from(publications).where(eq(publications.ownerId, user.id));
    const pubIds = userPubs.map(p => p.id);

    let subCount = 0;
    let revenue = 0;
    let vaultCount = 0;
    let streakDays = 0;

    if (pubIds.length > 0) {
      const [{ count: sub }] = await db.select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            sql`${subscriptions.publicationId} IN (${sql.join(pubIds, sql`, `)})`,
            eq(subscriptions.status, 'active')
          )
        );
      subCount = Number(sub) || 0;

      const [{ totalRevenue }] = await db.select({ totalRevenue: sql<number>`sum(${transactions.creatorReceivedUsdc})` })
        .from(transactions)
        .innerJoin(subscriptions, eq(transactions.subscriptionId, subscriptions.id))
        .where(
          and(
            sql`${subscriptions.publicationId} IN (${sql.join(pubIds, sql`, `)})`,
            eq(transactions.status, 'confirmed')
          )
        );
      revenue = Number(totalRevenue) || 0;

      const [{ count: vault }] = await db.select({ count: sql<number>`count(*)` })
        .from(vaultEntries)
        .where(
          and(
            eq(vaultEntries.authorId, user.id),
            eq(vaultEntries.status, 'published')
          )
        );
      vaultCount = Number(vault) || 0;

      streakDays = await calculatePublishingStreak(user.id);
    }

    const currentValues: Record<string, number> = {
      subscribers: subCount,
      usdc: revenue,
      vault: vaultCount,
      streak: streakDays,
    };

    // 3. Determine Next Milestones
    const nextMilestones = [];
    
    // Group definitions by metric
    const metrics = ['subscribers', 'usdc', 'vault', 'streak'];
    
    for (const metric of metrics) {
      const defs = MILESTONE_DEFINITIONS.filter(d => d.metric === metric);
      // Find the first unachieved milestone for this metric
      for (const def of defs) {
        if (!achievedTypes.has(def.type as MilestoneType)) {
          const currentValue = currentValues[metric];
          const targetValue = def.targetValue;
          const percentComplete = Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
          
          nextMilestones.push({
            type: def.type,
            label: def.label,
            currentValue,
            targetValue,
            percentComplete
          });
          break; // Only show the *next* immediate goal per metric
        }
      }
    }

    return NextResponse.json({
      achieved,
      next: nextMilestones
    });

  } catch (error) {
    console.error('[API] Error fetching milestones:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
