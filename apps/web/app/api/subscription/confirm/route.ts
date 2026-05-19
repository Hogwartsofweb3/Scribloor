import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, subscriptions, transactions, users } from '@solscribe/db';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscription/confirm
 * Body: { txSignature: string, subscriptionId: string }
 *
 * Called by the client immediately after the user signs and submits the tx.
 * Updates the transaction record with the real signature so the Helius webhook
 * can find and verify it. Returns { status: 'pending_confirmation' }.
 *
 * The webhook at /api/webhooks/helius handles the final activation.
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

    // Resolve DB user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify subscription belongs to this user and is pending
    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.id, subscriptionId),
        eq(subscriptions.subscriberId, dbUser.id)
      ),
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status !== 'pending') {
      return NextResponse.json(
        { error: `Subscription is not pending (current status: ${subscription.status})` },
        { status: 409 }
      );
    }

    // Check for signature collision (replay protection)
    const existingBySignature = await db.query.transactions.findFirst({
      where: eq(transactions.txSignature, txSignature),
    });
    if (existingBySignature && existingBySignature.subscriptionId !== subscriptionId) {
      return NextResponse.json(
        { error: 'Transaction signature already used by another subscription' },
        { status: 409 }
      );
    }

    // Update the pending transaction record with the real signature
    await db
      .update(transactions)
      .set({ txSignature })
      .where(
        and(
          eq(transactions.subscriptionId, subscriptionId),
          eq(transactions.status, 'pending')
        )
      );

    // The Helius webhook will handle final verification and activation
    return NextResponse.json({ status: 'pending_confirmation', txSignature });
  } catch (error) {
    console.error('Subscription confirm error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
