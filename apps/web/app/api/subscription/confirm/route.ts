import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, subscriptions, transactions, users } from '@solscribe/db';
import { eq, and } from 'drizzle-orm';
import { getConnection } from '@/lib/solana/connection';
import { verifySubscriptionTx } from '@/lib/solana/verify';
import { PLATFORM_FEE_BPS } from '@/lib/solana/constants';

/**
 * POST /api/subscription/confirm
 * Body: { txSignature: string, subscriptionId: string }
 *
 * Verifies the on-chain transaction, then marks the subscription as active.
 */
export async function POST(request: NextRequest) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { txSignature, subscriptionId } = body as {
      txSignature: string;
      subscriptionId: string;
    };

    if (!txSignature || !subscriptionId) {
      return NextResponse.json(
        { error: 'txSignature and subscriptionId are required' },
        { status: 400 }
      );
    }

    // Fetch DB user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the pending subscription with its publication
    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.id, subscriptionId),
        eq(subscriptions.subscriberId, dbUser.id)
      ),
      with: { publication: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status !== 'pending') {
      return NextResponse.json(
        { error: 'Subscription is not in a pending state' },
        { status: 409 }
      );
    }

    const totalAmount = Number(subscription.publication.monthlyPriceUsdc ?? 0);
    const feeAmount = (totalAmount * PLATFORM_FEE_BPS) / 10_000;
    const creatorAmount = totalAmount - feeAmount;

    // Verify the on-chain transaction
    const connection = getConnection();
    const { valid, actualAmount, error: verifyError } = await verifySubscriptionTx({
      txSignature,
      expectedCreatorWallet: subscription.publication.payoutWallet,
      expectedAmountUsdc: creatorAmount,
      connection,
    });

    if (!valid) {
      return NextResponse.json(
        { error: `Transaction verification failed: ${verifyError}` },
        { status: 400 }
      );
    }

    // Derive actual fee from actual amount (maintain same ratio)
    const actualFeeAmount = (actualAmount * PLATFORM_FEE_BPS) / (10_000 - PLATFORM_FEE_BPS);

    // Record transaction and activate subscription atomically
    await db.transaction(async (tx) => {
      await tx.insert(transactions).values({
        subscriptionId: subscription.id,
        txSignature,
        amountUsdc: String(actualAmount + actualFeeAmount),
        platformFeeUsdc: String(actualFeeAmount),
        creatorReceivedUsdc: String(actualAmount),
        status: 'confirmed',
        confirmedAt: new Date(),
      });

      await tx
        .update(subscriptions)
        .set({
          status: 'active',
          lastTxSignature: txSignature,
        })
        .where(eq(subscriptions.id, subscriptionId));
    });

    return NextResponse.json({ success: true, subscriptionId });
  } catch (error) {
    console.error('Subscription confirm error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
