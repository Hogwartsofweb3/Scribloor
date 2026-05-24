import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, subscriptions, publications, users, transactions } from '@solscribe/db';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscriptions
 * Returns all subscriptions for the authenticated reader, with publication details
 * and most-recent transaction info.
 */
export async function GET(request: NextRequest) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all subscriptions with publication info joined
    const userSubs = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        subscriberWallet: subscriptions.subscriberWallet,
        startedAt: subscriptions.startedAt,
        expiresAt: subscriptions.expiresAt,
        lastTxSignature: subscriptions.lastTxSignature,
        createdAt: subscriptions.createdAt,
        publicationId: publications.id,
        publicationSlug: publications.slug,
        publicationName: publications.name,
        publicationDescription: publications.description,
        publicationCover: publications.coverImageUrl,
        publicationPrice: publications.monthlyPriceUsdc,
        publicationOwnerName: users.displayName,
        publicationOwnerUsername: users.username,
      })
      .from(subscriptions)
      .innerJoin(publications, eq(subscriptions.publicationId, publications.id))
      .innerJoin(users, eq(publications.ownerId, users.id))
      .where(eq(subscriptions.subscriberId, dbUser.id))
      .orderBy(desc(subscriptions.createdAt));

    // Fetch total amount paid per subscription
    const txSums = await db
      .select({
        subscriptionId: transactions.subscriptionId,
        totalPaid: sql<number>`COALESCE(SUM(${transactions.amountUsdc}), 0)`,
        txCount: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(eq(transactions.status, 'confirmed'))
      .groupBy(transactions.subscriptionId);

    const txSumMap = new Map<string, { totalPaid: number; txCount: number }>();
    txSums.forEach((t) => {
      txSumMap.set(t.subscriptionId, {
        totalPaid: parseFloat(t.totalPaid?.toString() || '0'),
        txCount: Number(t.txCount || 0),
      });
    });

    const now = new Date();

    const result = userSubs.map((sub) => {
      const txData = txSumMap.get(sub.id);
      const msRemaining = sub.expiresAt.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

      return {
        id: sub.id,
        status: sub.status,
        subscriberWallet: sub.subscriberWallet,
        startedAt: sub.startedAt.toISOString(),
        expiresAt: sub.expiresAt.toISOString(),
        daysRemaining: sub.status === 'active' ? daysRemaining : 0,
        lastTxSignature: sub.lastTxSignature,
        createdAt: sub.createdAt.toISOString(),
        totalPaid: txData?.totalPaid ?? 0,
        txCount: txData?.txCount ?? 0,
        publication: {
          id: sub.publicationId,
          slug: sub.publicationSlug,
          name: sub.publicationName,
          description: sub.publicationDescription,
          coverImageUrl: sub.publicationCover,
          monthlyPriceUsdc: sub.publicationPrice ? parseFloat(sub.publicationPrice.toString()) : null,
          creatorName: sub.publicationOwnerName || sub.publicationOwnerUsername || 'Unknown Creator',
        },
      };
    });

    return NextResponse.json({ subscriptions: result });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
