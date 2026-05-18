import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, publications, subscriptions, users } from '@solscribe/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * POST /api/subscription/initiate
 * Body: { publicationId: string }
 *
 * Returns the info needed by the client to build & sign the transaction:
 *   { amount, creatorWallet, subscriptionId }
 */
export async function POST(request: NextRequest) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { publicationId } = body as { publicationId: string };

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId is required' }, { status: 400 });
    }

    // Fetch the DB user (we need their wallet address)
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch publication details
    const publication = await db.query.publications.findFirst({
      where: eq(publications.id, publicationId),
    });

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    if (!publication.monthlyPriceUsdc) {
      return NextResponse.json(
        { error: 'Publication has no subscription price set' },
        { status: 400 }
      );
    }

    const subscriberWallet =
      dbUser.walletAddress ?? privyUser.wallet?.address ?? '';

    if (!subscriberWallet) {
      return NextResponse.json(
        { error: 'No wallet address found for subscriber' },
        { status: 400 }
      );
    }

    // Create a pending subscription record
    const subscriptionId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(subscriptions).values({
      id: subscriptionId,
      subscriberId: dbUser.id,
      publicationId,
      subscriberWallet,
      status: 'pending',
      startedAt: now,
      expiresAt,
    });

    return NextResponse.json({
      amount: Number(publication.monthlyPriceUsdc),
      creatorWallet: publication.payoutWallet,
      subscriptionId,
    });
  } catch (error) {
    console.error('Subscription initiate error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
