import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, posts, publications, subscriptions, transactions, users, emailSends } from '@solscribe/db';
import { eq, and, gte, lt, desc, inArray, sql } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate session
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized: Session not found' }, { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized: User not found in database' }, { status: 401 });
    }

    // 3. Resolve publication owned by creator
    const pub = await db.query.publications.findFirst({
      where: eq(publications.ownerId, dbUser.id),
    });

    if (!pub) {
      return NextResponse.json({
        success: false,
        noPublication: true,
      });
    }

    const now = new Date();
    const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 4. Gather Subscribers Statistics
    const allActiveSubscribers = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.publicationId, pub.id),
        eq(subscriptions.status, 'active')
      ),
    });

    const activeCount = allActiveSubscribers.length;

    const newThisMonth = allActiveSubscribers.filter(
      (sub) => new Date(sub.startedAt) >= firstOfCurrentMonth
    ).length;

    const churnedThisMonthResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.publicationId, pub.id),
          inArray(subscriptions.status, ['expired', 'cancelled']),
          gte(subscriptions.updatedAt, firstOfCurrentMonth)
        )
      );
    const churnedThisMonth = Number(churnedThisMonthResult[0]?.count || 0);

    // 5. Gather Revenue Statistics (Gross and Net)
    const allConfirmedTx = await db
      .select({
        amountUsdc: transactions.amountUsdc,
        creatorReceivedUsdc: transactions.creatorReceivedUsdc,
        confirmedAt: transactions.confirmedAt,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(subscriptions, eq(transactions.subscriptionId, subscriptions.id))
      .where(
        and(
          eq(subscriptions.publicationId, pub.id),
          eq(transactions.status, 'confirmed')
        )
      );

    let allTimeGross = 0;
    let allTimeNet = 0;
    let thisMonthGross = 0;
    let thisMonthNet = 0;
    let lastMonthGross = 0;
    let lastMonthNet = 0;

    allConfirmedTx.forEach((tx) => {
      const grossVal = parseFloat(tx.amountUsdc.toString() || '0');
      const netVal = parseFloat(tx.creatorReceivedUsdc.toString() || '0');
      const txDate = new Date(tx.confirmedAt || tx.createdAt);

      allTimeGross += grossVal;
      allTimeNet += netVal;

      if (txDate >= firstOfCurrentMonth) {
        thisMonthGross += grossVal;
        thisMonthNet += netVal;
      } else if (txDate >= firstOfLastMonth && txDate < firstOfCurrentMonth) {
        lastMonthGross += grossVal;
        lastMonthNet += netVal;
      }
    });

    // 6. Gather Posts Statistics
    const allPosts = await db.query.posts.findMany({
      where: eq(posts.publicationId, pub.id),
    });

    const postsStats = {
      total: allPosts.length,
      published: allPosts.filter((p) => p.status === 'published').length,
      drafts: allPosts.filter((p) => p.status === 'draft').length,
    };

    // 7. Gather Newsletter Delivery Open Rates
    const allPostIds = allPosts.map((p) => p.id);
    let emailStats = { sent: 0, opened: 0, openRate: 0 };

    if (allPostIds.length > 0) {
      const sends = await db
        .select({
          status: emailSends.status,
          openedAt: emailSends.openedAt,
        })
        .from(emailSends)
        .where(inArray(emailSends.postId, allPostIds));

      const sentCount = sends.length;
      const openedCount = sends.filter(
        (s) => s.status === 'opened' || s.openedAt !== null
      ).length;
      const rate = sentCount > 0 ? (openedCount / sentCount) * 100 : 0;

      emailStats = {
        sent: sentCount,
        opened: openedCount,
        openRate: Math.round(rate * 10) / 10,
      };
    }

    // 8. Generate last 60 days history timeline
    const timelineData: { date: string; gross: number; net: number; subscribers: number }[] = [];
    const allActiveHistory = await db.query.subscriptions.findMany({
      where: eq(subscriptions.publicationId, pub.id),
      orderBy: [subscriptions.startedAt],
    });

    for (let i = 59; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      // Sum gross & net for this specific day
      let dayGross = 0;
      let dayNet = 0;
      allConfirmedTx.forEach((tx) => {
        const txDate = new Date(tx.confirmedAt || tx.createdAt);
        if (txDate >= dayStart && txDate <= dayEnd) {
          dayGross += parseFloat(tx.amountUsdc.toString() || '0');
          dayNet += parseFloat(tx.creatorReceivedUsdc.toString() || '0');
        }
      });

      // Cumulative active count on this day
      const activeOnDay = allActiveHistory.filter((sub) => {
        const start = new Date(sub.startedAt);
        const expiredOrCancelled = ['expired', 'cancelled'].includes(sub.status);
        const end = sub.expiresAt ? new Date(sub.expiresAt) : null;
        
        // Subscribed before day ends
        const subscribedBefore = start <= dayEnd;
        // Term has not expired before this day started
        const notExpiredYet = !expiredOrCancelled || !end || end >= dayStart;

        return subscribedBefore && notExpiredYet;
      }).length;

      timelineData.push({
        date: dayLabel,
        gross: Math.round(dayGross * 100) / 100,
        net: Math.round(dayNet * 100) / 100,
        subscribers: activeOnDay,
      });
    }

    // 9. Gather Recent Activity Unified Feed
    // a. New subscriber alerts (active status)
    const newSubs = await db
      .select({
        id: subscriptions.id,
        subscriberWallet: subscriptions.subscriberWallet,
        displayName: users.displayName,
        username: users.username,
        date: subscriptions.startedAt,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(and(eq(subscriptions.publicationId, pub.id), eq(subscriptions.status, 'active')))
      .orderBy(desc(subscriptions.startedAt))
      .limit(5);

    // b. New transactions alerts (confirmed status)
    const newTxs = await db
      .select({
        id: transactions.id,
        amountUsdc: transactions.amountUsdc,
        displayName: users.displayName,
        wallet: subscriptions.subscriberWallet,
        date: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(subscriptions, eq(transactions.subscriptionId, subscriptions.id))
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(and(eq(subscriptions.publicationId, pub.id), eq(transactions.status, 'confirmed')))
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    // c. Post publishing alerts
    const newPubPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        date: posts.publishedAt,
      })
      .from(posts)
      .where(and(eq(posts.publicationId, pub.id), eq(posts.status, 'published')))
      .orderBy(desc(posts.publishedAt))
      .limit(5);

    // d. Subscription expired alerts
    const expiredSubs = await db
      .select({
        id: subscriptions.id,
        subscriberWallet: subscriptions.subscriberWallet,
        displayName: users.displayName,
        username: users.username,
        date: subscriptions.expiresAt,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(and(eq(subscriptions.publicationId, pub.id), eq(subscriptions.status, 'expired')))
      .orderBy(desc(subscriptions.expiresAt))
      .limit(5);

    const activityFeed: any[] = [];
    newSubs.forEach((sub) => {
      activityFeed.push({
        id: `sub-${sub.id}`,
        type: 'new_subscriber',
        title: 'New Subscriber Joined',
        description: sub.displayName || sub.username || `${sub.subscriberWallet.substring(0, 6)}...${sub.subscriberWallet.substring(sub.subscriberWallet.length - 4)}`,
        date: sub.date.toISOString(),
      });
    });

    newTxs.forEach((tx) => {
      activityFeed.push({
        id: `tx-${tx.id}`,
        type: 'new_transaction',
        title: 'Transaction Confirmed',
        description: `Received ${parseFloat(tx.amountUsdc.toString())} USDC from ${tx.displayName || `${tx.wallet.substring(0, 6)}...${tx.wallet.substring(tx.wallet.length - 4)}`}`,
        date: tx.date.toISOString(),
      });
    });

    newPubPosts.forEach((post) => {
      if (post.date) {
        activityFeed.push({
          id: `post-${post.id}`,
          type: 'post_published',
          title: 'Article Published',
          description: `"${post.title}" is now live and distributed to readers.`,
          date: post.date.toISOString(),
        });
      }
    });

    expiredSubs.forEach((sub) => {
      activityFeed.push({
        id: `exp-${sub.id}`,
        type: 'subscription_expired',
        title: 'Subscription Expired',
        description: `${sub.displayName || sub.username || `${sub.subscriberWallet.substring(0, 6)}...${sub.subscriberWallet.substring(sub.subscriberWallet.length - 4)}`}'s term has ended.`,
        date: sub.date.toISOString(),
      });
    });

    // Sort unified activity feed chronologically descending
    activityFeed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 10. Pull Recent Transactions Audit Table
    const recentTxList = await db
      .select({
        id: transactions.id,
        txSignature: transactions.txSignature,
        amountUsdc: transactions.amountUsdc,
        platformFeeUsdc: transactions.platformFeeUsdc,
        creatorReceivedUsdc: transactions.creatorReceivedUsdc,
        status: transactions.status,
        createdAt: transactions.createdAt,
        subscriberWallet: subscriptions.subscriberWallet,
        subscriberDisplayName: users.displayName,
        subscriberUsername: users.username,
      })
      .from(transactions)
      .innerJoin(subscriptions, eq(transactions.subscriptionId, subscriptions.id))
      .innerJoin(users, eq(subscriptions.subscriberId, users.id))
      .where(eq(subscriptions.publicationId, pub.id))
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    // 11. Pull Subscriber Roster List
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
      .where(eq(subscriptions.publicationId, pub.id))
      .orderBy(desc(subscriptions.createdAt));

    // Sum total paid per subscription term
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

    const subscribersList = subscriberRoster.map((sub) => ({
      id: sub.id,
      wallet: sub.subscriberWallet,
      displayName: sub.displayName,
      username: sub.username,
      startedAt: sub.startedAt.toISOString(),
      expiresAt: sub.expiresAt.toISOString(),
      status: sub.status,
      totalPaid: txSumMap.get(sub.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      subscribers: {
        total: activeCount,
        newThisMonth,
        churnedThisMonth,
      },
      revenue: {
        thisMonth: Math.round(thisMonthNet * 100) / 100,
        lastMonth: Math.round(lastMonthNet * 100) / 100,
        allTime: Math.round(allTimeNet * 100) / 100,
        currency: 'USDC',
      },
      posts: postsStats,
      emailStats,
      recentTransactions: recentTxList.map((tx) => ({
        id: tx.id,
        signature: tx.txSignature,
        amount: parseFloat(tx.amountUsdc.toString()),
        fee: parseFloat(tx.platformFeeUsdc.toString()),
        net: parseFloat(tx.creatorReceivedUsdc.toString()),
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
        subscriber: tx.subscriberDisplayName || tx.subscriberUsername || tx.subscriberWallet,
      })),
      subscriberGrowth: timelineData.map((t) => ({ date: t.date, count: t.subscribers })),
      revenueTimeline: timelineData.map((t) => ({ date: t.date, gross: t.gross, net: t.net })),
      subscribersList,
      recentActivity: activityFeed.slice(0, 10),
    });
  } catch (error) {
    console.error('Error compiling creator dashboard stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
