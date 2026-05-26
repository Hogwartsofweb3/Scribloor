import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, subscriptions, transactions, publications, users, vaultAccessRecords, vaultPassSubscriptions } from '@solscribe/db';
import { eq, and } from '@solscribe/db';
import { getConnection } from '@/lib/solana/connection';
import { verifySubscriptionTx } from '@/lib/solana/verify';
import { sendSubscriptionWelcomeEmail } from '@/lib/email/subscription';
import { PLATFORM_FEE_BPS, PLATFORM_FEE_WALLET } from '@/lib/solana/constants';
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
  await Promise.allSettled(
    payload.flatMap(tx => [
      processSingleTransaction(tx),
      processVaultSingleAccess(tx),
      processVaultPass(tx),
    ])
  );

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

/**
 * Handles Vault single-access payment confirmations from Helius.
 * Looks for a pending vault_access_record with no txSignature that matches
 * the USDC transfer amount and updates it to confirmed.
 */
async function processVaultSingleAccess(tx: EnhancedTransaction): Promise<void> {
  const { signature } = tx;
  try {
    const usdcTransfer = tx.tokenTransfers?.find(
      (t) => t.mint === USDC_MINT && t.tokenAmount > 0 && t.toUserAccount === PLATFORM_FEE_WALLET
    );
    if (!usdcTransfer) return;

    // Check if this tx already confirmed a vault record
    const existing = await db.query.vaultAccessRecords.findFirst({
      where: eq(vaultAccessRecords.txSignature, signature),
    });
    if (existing) return;

    // Find a pending vault_access_record (single_purchase, no tx yet) with matching amount
    const pending = await db.query.vaultAccessRecords.findFirst({
      where: and(
        eq(vaultAccessRecords.accessType, 'single_purchase'),
      ),
      with: { entry: true },
    });

    if (!pending || pending.txSignature) return;

    // Validate amount matches
    const expectedAmount = parseFloat(pending.amountPaidUsdc || '0');
    if (Math.abs(usdcTransfer.tokenAmount - expectedAmount) > 0.01) return;

    await db.update(vaultAccessRecords)
      .set({ txSignature: signature })
      .where(eq(vaultAccessRecords.id, pending.id));

    console.info(`[helius-webhook] Vault single access confirmed: entry=${pending.entryId} tx=${signature}`);
  } catch (err) {
    console.error(`[helius-webhook] Vault single access error for tx ${signature}:`, err);
  }
}

/**
 * Handles Vault Pass payment confirmations from Helius.
 * Activates the pending vault_pass_subscription for the buyer.
 */
async function processVaultPass(tx: EnhancedTransaction): Promise<void> {
  const { signature } = tx;
  try {
    const usdcTransfer = tx.tokenTransfers?.find(
      (t) => t.mint === USDC_MINT && t.tokenAmount === 5.0 && t.toUserAccount === PLATFORM_FEE_WALLET
    );
    if (!usdcTransfer) return;

    // Check idempotency
    const existing = await db.query.vaultPassSubscriptions.findFirst({
      where: eq(vaultPassSubscriptions.lastTxSignature, signature),
    });
    if (existing) return;

    // Find a pending pass for the sender wallet
    const senderWallet = usdcTransfer.fromUserAccount;
    const senderUser = await db.query.users.findFirst({
      where: eq(users.walletAddress, senderWallet),
    });
    if (!senderUser) return;

    const pendingPass = await db.query.vaultPassSubscriptions.findFirst({
      where: and(
        eq(vaultPassSubscriptions.subscriberId, senderUser.id),
        eq(vaultPassSubscriptions.status, 'pending' as any),
      ),
    });
    if (!pendingPass) return;

    await db.update(vaultPassSubscriptions)
      .set({
        status: 'active',
        lastTxSignature: signature,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .where(eq(vaultPassSubscriptions.id, pendingPass.id));

    console.info(`[helius-webhook] Vault Pass activated: user=${senderUser.id} tx=${signature}`);
  } catch (err) {
    console.error(`[helius-webhook] Vault Pass error for tx ${signature}:`, err);
  }
}

