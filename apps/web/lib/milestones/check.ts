import { db, publications, subscriptions, posts, vaultEntries, creatorMilestones, users, transactions, eq, and, sql, gte } from '@solscribe/db';

export type MilestoneType = 
  | 'first_subscriber' 
  | 'subscribers_10' 
  | 'subscribers_100' 
  | 'subscribers_1k' 
  | 'first_usdc' 
  | 'usdc_100' 
  | 'usdc_1k' 
  | 'usdc_10k' 
  | 'first_vault_entry' 
  | 'publishing_streak_7' 
  | 'publishing_streak_30';

/**
 * Calculates the current publishing streak (consecutive weeks with at least 1 post).
 * Resets to 0 if a week is missed.
 */
export async function calculatePublishingStreak(userId: string): Promise<number> {
  const userPubs = await db.select({ id: publications.id }).from(publications).where(eq(publications.ownerId, userId));
  if (!userPubs.length) return 0;
  
  const pubIds = userPubs.map(p => p.id);

  // Fetch all published posts sorted by date descending
  const userPosts = await db.select({ publishedAt: posts.publishedAt })
    .from(posts)
    .where(
      and(
        sql`${posts.publicationId} IN (${sql.join(pubIds, sql`, `)})`,
        eq(posts.status, 'published')
      )
    )
    .orderBy(sql`${posts.publishedAt} DESC`);

  if (!userPosts.length) return 0;

  let streak = 0;
  let currentDate = new Date();
  
  // A week is 7 days
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // Verify they posted within the last 7 days to have an active streak at all
  if (currentDate.getTime() - new Date(userPosts[0].publishedAt!).getTime() > SEVEN_DAYS_MS) {
    return 0;
  }

  // Count consecutive weeks
  // This is a naive streak counter: it just checks if the distance between consecutive posts is <= 7 days
  // and aggregates the total time span of the streak in weeks.
  // A more robust way is tracking calendar weeks, but this works for a scaffold.
  let streakStart = new Date(userPosts[0].publishedAt!);
  
  for (let i = 0; i < userPosts.length - 1; i++) {
    const currentPostDate = new Date(userPosts[i].publishedAt!);
    const nextPostDate = new Date(userPosts[i+1].publishedAt!);
    
    if (currentPostDate.getTime() - nextPostDate.getTime() <= SEVEN_DAYS_MS) {
      streakStart = nextPostDate;
    } else {
      break; // Streak broken
    }
  }

  const streakDays = (new Date(userPosts[0].publishedAt!).getTime() - streakStart.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(streakDays);
}

/**
 * Checks and awards milestones for a user. Returns an array of newly awarded milestone types.
 */
export async function checkAndAwardMilestones(userId: string): Promise<MilestoneType[]> {
  // 1. Fetch current achieved milestones
  const achieved = await db.select().from(creatorMilestones).where(eq(creatorMilestones.userId, userId));
  const achievedTypes = new Set(achieved.map(m => m.milestoneType));

  const newMilestones: MilestoneType[] = [];

  // 2. Fetch stats
  const userPubs = await db.select({ id: publications.id }).from(publications).where(eq(publications.ownerId, userId));
  const pubIds = userPubs.map(p => p.id);

  if (pubIds.length === 0) return [];

  // Subscribers
  const resSub = await db.select({ count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(
      and(
        sql`${subscriptions.publicationId} IN (${sql.join(pubIds, sql`, `)})`,
        eq(subscriptions.status, 'active')
      )
    );
  const subCount = Number(resSub[0]?.count ?? 0);

  // USDC Revenue
  const [{ totalRevenue }] = await db.select({ totalRevenue: sql<number>`sum(${transactions.creatorReceivedUsdc})` })
    .from(transactions)
    .innerJoin(subscriptions, eq(transactions.subscriptionId, subscriptions.id))
    .where(
      and(
        sql`${subscriptions.publicationId} IN (${sql.join(pubIds, sql`, `)})`,
        eq(transactions.status, 'confirmed')
      )
    );

  const revenue = totalRevenue || 0;

  // Vault Entries
  const resVault = await db.select({ count: sql<number>`count(*)` })
    .from(vaultEntries)
    .where(
      and(
        eq(vaultEntries.authorId, userId),
        eq(vaultEntries.status, 'published')
      )
    );
  const vaultCount = Number(resVault[0]?.count ?? 0);

  // Publishing Streak
  const streakDays = await calculatePublishingStreak(userId);

  // 3. Evaluate Thresholds
  const evaluate = (type: MilestoneType, condition: boolean) => {
    if (condition && !achievedTypes.has(type)) {
      newMilestones.push(type);
    }
  };

  evaluate('first_subscriber', subCount >= 1);
  evaluate('subscribers_10', subCount >= 10);
  evaluate('subscribers_100', subCount >= 100);
  evaluate('subscribers_1k', subCount >= 1000);

  evaluate('first_usdc', revenue > 0);
  evaluate('usdc_100', revenue >= 100);
  evaluate('usdc_1k', revenue >= 1000);
  evaluate('usdc_10k', revenue >= 10000);

  evaluate('first_vault_entry', vaultCount >= 1);

  evaluate('publishing_streak_7', streakDays >= 7);
  evaluate('publishing_streak_30', streakDays >= 30);

  // 4. Award Milestones
  if (newMilestones.length > 0) {
    await db.insert(creatorMilestones).values(
      newMilestones.map(type => ({
        userId,
        milestoneType: type,
        notified: false
      }))
    );
  }

  return newMilestones;
}
