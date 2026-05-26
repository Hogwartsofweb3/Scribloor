import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, publications, subscriptions, transactions, users } from '@solscribe/db';
import { eq, and } from '@solscribe/db';
import { randomUUID } from 'crypto';
import { PLATFORM_FEE_BPS, PLATFORM_FEE_WALLET } from '@/lib/solana/constants';

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscription/initiate
 * Body: { publicationId: string }
 *
 * Checks for existing active subscription, creates pending subscription +
 * pending transaction records, returns data needed to build the tx client-side.
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

    // Resolve DB user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch publication
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

    // ── Check for existing active subscription ───────────────────────────
    const existingActive = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.subscriberId, dbUser.id),
        eq(subscriptions.publicationId, publicationId),
        eq(subscriptions.status, 'active')
      ),
    });
    if (existingActive) {
      return NextResponse.json(
        { error: 'You already have an active subscription to this publication' },
        { status: 409 }
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

    const amountUsdc = Number(publication.monthlyPriceUsdc);
    const platformFeeUsdc = (amountUsdc * PLATFORM_FEE_BPS) / 10_000;
    const creatorReceivedUsdc = amountUsdc - platformFeeUsdc;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // ── Create pending subscription + pending transaction atomically ──────
    const subscriptionId = randomUUID();
    const transactionId = randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(subscriptions).values({
        id: subscriptionId,
        subscriberId: dbUser.id,
        publicationId,
        subscriberWallet,
        status: 'pending',
        startedAt: now,
        expiresAt,
      });

      await tx.insert(transactions).values({
        id: transactionId,
        subscriptionId,
        txSignature: `pending_${subscriptionId}`, // Placeholder — updated on confirm
        amountUsdc: String(amountUsdc),
        platformFeeUsdc: String(platformFeeUsdc),
        creatorReceivedUsdc: String(creatorReceivedUsdc),
        status: 'pending',
      });
    });

    return NextResponse.json({
      subscriptionId,
      transactionId,
      creatorWallet: publication.payoutWallet,
      amountUsdc,
      platformFeeWallet: PLATFORM_FEE_WALLET,
    });
  } catch (error) {
    console.error('Subscription initiate error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
