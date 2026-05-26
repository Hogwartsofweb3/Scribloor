import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultEntries, vaultRevenueDistributions, vaultAccessRecords } from '@solscribe/db';
import { eq, and, gte, sql, desc } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Entry counts by status
    const entryCounts = await db
      .select({
        status: vaultEntries.status,
        count: sql<number>`count(*)::int`,
      })
      .from(vaultEntries)
      .where(eq(vaultEntries.authorId, user.id))
      .groupBy(vaultEntries.status);

    const entries = {
      total: entryCounts.reduce((sum, r) => sum + r.count, 0),
      published: entryCounts.find(r => r.status === 'published')?.count || 0,
      pending: entryCounts.find(r => r.status === 'pending_review')?.count || 0,
      rejected: entryCounts.find(r => r.status === 'rejected')?.count || 0,
    };

    // 2. Earnings summary
    const distributions = await db.query.vaultRevenueDistributions.findMany({
      where: eq(vaultRevenueDistributions.authorId, user.id),
      orderBy: [desc(vaultRevenueDistributions.createdAt)],
    });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const allTimeEarnings = distributions.reduce((sum, d) => sum + parseFloat(d.authorShareUsdc), 0);
    const thisMonthEarnings = distributions
      .filter(d => new Date(d.periodStart) >= thisMonthStart)
      .reduce((sum, d) => sum + parseFloat(d.authorShareUsdc), 0);
    const lastMonthEarnings = distributions
      .filter(d => new Date(d.periodStart) >= lastMonthStart && new Date(d.periodEnd) <= lastMonthEnd)
      .reduce((sum, d) => sum + parseFloat(d.authorShareUsdc), 0);
    const pendingEarnings = distributions
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + parseFloat(d.authorShareUsdc), 0);

    // 3. Top entry by access count
    const topEntry = await db.query.vaultEntries.findFirst({
      where: and(
        eq(vaultEntries.authorId, user.id),
        eq(vaultEntries.status, 'published')
      ),
      orderBy: [desc(vaultEntries.accessCount)],
    });

    // 4. Access history for the last 60 days (by day)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const authorEntries = await db.query.vaultEntries.findMany({
      where: eq(vaultEntries.authorId, user.id),
      columns: { id: true },
    });

    const entryIds = authorEntries.map(e => e.id);

    let accessHistory: { date: string; count: number }[] = [];
    if (entryIds.length > 0) {
      const rawHistory = await db
        .select({
          date: sql<string>`date_trunc('day', ${vaultAccessRecords.accessedAt})::date::text`,
          count: sql<number>`count(*)::int`,
        })
        .from(vaultAccessRecords)
        .where(
          and(
            gte(vaultAccessRecords.accessedAt, sixtyDaysAgo),
            sql`${vaultAccessRecords.entryId} = ANY(ARRAY[${sql.join(entryIds.map(id => sql`${id}::uuid`), sql`, `)}])`
          )
        )
        .groupBy(sql`date_trunc('day', ${vaultAccessRecords.accessedAt})::date`)
        .orderBy(sql`date_trunc('day', ${vaultAccessRecords.accessedAt})::date`);

      accessHistory = rawHistory;
    }

    return NextResponse.json({
      entries,
      earnings: {
        thisMonth: thisMonthEarnings.toFixed(4),
        lastMonth: lastMonthEarnings.toFixed(4),
        allTime: allTimeEarnings.toFixed(4),
        pendingDistribution: pendingEarnings.toFixed(4),
      },
      topEntry: topEntry
        ? {
            title: topEntry.title,
            slug: topEntry.slug,
            accessCount: topEntry.accessCount,
          }
        : null,
      accessHistory,
    });
  } catch (error) {
    console.error('[Vault Stats API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
