import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, subscriptions, transactions, publications, users } from '@solscribe/db';
import { eq, and } from 'drizzle-orm';
import { getConnection } from '@/lib/solana/connection';
import { verifySubscriptionTx } from '@/lib/solana/verify';
import { sendSubscriptionWelcomeEmail } from '@/lib/email/subscription';
import { PLATFORM_FEE_BPS } from '@/lib/solana/constants';
import type { HeliusWebhookPayload, EnhancedTransaction } from '@/types/helius';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/helius
 *
 * Receives Helius Enhanced Transaction webhooks, verifies each USDC transfer,
 * and activates the matching pending subscription.
 *
 * Always returns 200 so Helius does not retry indefinitely on logic errors.
 */
export async function POST(request: NextRequest) {
  // ── 1. Verify webhook secret ─────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET;

  if (!webhookSecret || authHeader !== webhookSecret) {
    // Return 200 to prevent Helius retries, but log the rejection
    console.warn('[helius-webhook] Unauthorized request — bad or missing secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 200 });
  }

  let payload: HeliusWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    console.error('[helius-webhook] Failed to parse body');
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!Array.isArray(payload)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ── 2. Process each transaction ──────────────────────────────────────────
  await Promise.allSettled(payload.map(processSingleTransaction));

  return NextResponse.json({ ok: true }, { status: 200 });
}

async function processSingleTransaction(tx: EnhancedTransaction): Promise<void> {
  const { signature } = tx;

  try {
    // ── a) Idempotency check ───────────────────────────────────────────────
    const existingTx = await db.query.transactions.findFirst({
      where: eq(transactions.txSignature, signature),
    });

    if (existingTx && existingTx.status === 'confirmed') {
      // Already processed — skip silently
      return;
    }

    // ── b) Find a USDC transfer in the event ──────────────────────────────
    const usdcTransfer = tx.tokenTransfers.find(
      (t) => t.mint === USDC_MINT && t.tokenAmount > 0
    );

    if (!usdcTransfer) {
      // Not a USDC transfer we care about
      return;
    }

    const recipientWallet = usdcTransfer.toUserAccount;

    // ── c) Find pending subscription where publication payout = recipient ──
    const pendingSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.status, 'pending'),
      with: {
        publication: true,
        subscriber: true,
      },
    });

    // Filter: publication payout wallet must match the token recipient
    if (
      !pendingSubscription ||
      pendingSubscription.publication.payoutWallet !== recipientWallet
    ) {
      return;
    }

    const totalAmount = Number(pendingSubscription.publication.monthlyPriceUsdc ?? 0);
    const feeAmount = (totalAmount * PLATFORM_FEE_BPS) / 10_000;
    const creatorExpectedAmount = totalAmount - feeAmount;

    // ── d) On-chain verification ───────────────────────────────────────────
    const connection = getConnection();
    const { valid, actualAmount, error: verifyError } = await verifySubscriptionTx({
      txSignature: signature,
      expectedCreatorWallet: recipientWallet,
      expectedAmountUsdc: creatorExpectedAmount,
      connection,
    });

    // ── e) Find or create the transaction record ──────────────────────────
    const actualFeeAmount =
      (actualAmount * PLATFORM_FEE_BPS) / (10_000 - PLATFORM_FEE_BPS);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (!valid) {
      // Mark transaction as failed if a record exists
      if (existingTx) {
        await db
          .update(transactions)
          .set({ status: 'failed' })
          .where(eq(transactions.txSignature, signature));
      }
      console.warn(`[helius-webhook] Verification failed for ${signature}: ${verifyError}`);
      return;
    }

    // ── f) Atomically confirm tx, activate subscription, bump counter ──────
    await db.transaction(async (dbTx) => {
      if (existingTx) {
        // Update the existing pending record
        await dbTx
          .update(transactions)
          .set({
            status: 'confirmed',
            confirmedAt: now,
          })
          .where(eq(transactions.txSignature, signature));
      } else {
        // Insert a new confirmed record (webhook arrived before client confirm)
        await dbTx.insert(transactions).values({
          subscriptionId: pendingSubscription.id,
          txSignature: signature,
          amountUsdc: String(actualAmount + actualFeeAmount),
          platformFeeUsdc: String(actualFeeAmount),
          creatorReceivedUsdc: String(actualAmount),
          status: 'confirmed',
          confirmedAt: now,
        });
      }

      // Activate subscription
      await dbTx
        .update(subscriptions)
        .set({
          status: 'active',
          expiresAt,
          lastTxSignature: signature,
        })
        .where(eq(subscriptions.id, pendingSubscription.id));

      // Increment publication subscriber count
      await dbTx
        .update(publications)
        .set({
          subscriberCount:
            (pendingSubscription.publication.subscriberCount ?? 0) + 1,
        })
        .where(eq(publications.id, pendingSubscription.publicationId));
    });

    // ── g) Send welcome email (best-effort — don't fail the webhook) ───────
    const subscriberEmail =
      pendingSubscription.subscriber.email;

    if (subscriberEmail) {
      try {
        await sendSubscriptionWelcomeEmail({
          subscriberEmail,
          publicationName: pendingSubscription.publication.name,
          creatorName:
            pendingSubscription.publication.name, // Fallback — creator name from publication
          expiresAt,
        });
      } catch (emailErr) {
        console.error('[helius-webhook] Failed to send welcome email:', emailErr);
      }
    }

    console.info(`[helius-webhook] Subscription activated: ${pendingSubscription.id} via tx ${signature}`);
  } catch (err) {
    console.error(`[helius-webhook] Error processing tx ${signature}:`, err);
  }
}
