import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, publications, subscriptions, transactions, users } from '@solscribe/db';
import { eq, and, sql } from '@solscribe/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate session
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return new NextResponse('Unauthorized: User not found', { status: 401 });
    }

    // 3. Resolve publication owned by creator
    const pub = await db.query.publications.findFirst({
      where: eq(publications.ownerId, dbUser.id),
    });

    if (!pub) {
      return new NextResponse('No publication found', { status: 404 });
    }

    // 4. Pull Subscriber Roster List
    const subscriberRoster = await db
      .select({
        id: subscriptions.id,
        subscriberWallet: subscriptions.subscriberWallet,
        displayName: users.displayName,
        username: users.username,
        startedAt: subscriptions.startedAt,
        expiresAt: subscriptions.expiresAt,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(eq(subscriptions.publicationId, pub.id));

    // Sum total paid per subscription
    const txSums = await db
      .select({
        subscriptionId: transactions.subscriptionId,
        totalPaid: sql<number>`SUM(${transactions.amountUsdc})`,
      })
      .from(transactions)
      .where(eq(transactions.status, 'confirmed'))
      .groupBy(transactions.subscriptionId);

    const txSumMap = new Map<string, number>();
    txSums.forEach((sum) => {
      txSumMap.set(sum.subscriptionId, parseFloat(sum.totalPaid?.toString() || '0'));
    });

    // 5. Generate CSV Content
    const headers = ['Wallet', 'Name', 'Username', 'Status', 'Subscribed Date', 'Expiry Date', 'Total Paid (USDC)'];
    const rows = subscriberRoster.map((sub) => {
      const name = (sub.displayName || '').replace(/"/g, '""');
      const username = (sub.username || '').replace(/"/g, '""');
      const totalPaid = txSumMap.get(sub.id) || 0;
      
      return [
        sub.subscriberWallet,
        `"${name}"`,
        `"${username}"`,
        sub.status,
        sub.startedAt.toISOString().split('T')[0],
        sub.expiresAt.toISOString().split('T')[0],
        totalPaid.toFixed(2),
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // 6. Return as downloadable CSV attachment
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv; charset=utf-8');
    responseHeaders.set('Content-Disposition', `attachment; filename="${pub.slug}-subscribers.csv"`);

    return new NextResponse(csvContent, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error exporting subscribers CSV:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
