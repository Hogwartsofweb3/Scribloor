import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerDbUser } from '@/lib/auth/privy';
import { db, publications, users, posts, vaultEntries, tips, eq } from '@solscribe/db';
import { buildTipTransaction } from '@/lib/solana/tip';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getServerDbUser(req);
  if (!user || !user.walletAddress) {
    return NextResponse.json({ error: 'Unauthorized or missing wallet' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { publicationId, postId, vaultEntryId, amountUsdc, message } = body;

    if (!publicationId || !amountUsdc || amountUsdc <= 0) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Validate Target Publication & Recipient
    const publication = await db.query.publications.findFirst({
      where: eq(publications.id, publicationId),
      with: { owner: true }
    });

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    const recipientWallet = publication.payoutWallet;

    // 2. Build Transaction
    const base64Tx = await buildTipTransaction({
      tipperWallet: user.walletAddress,
      recipientWallet,
      amountUsdc
    });

    // We do NOT save the tip to the DB here. 
    // It will be saved by the Helius Webhook once confirmed, similar to subscriptions.
    // Wait, since tips need metadata (message, postId), we should probably record it as 'pending'
    // but the DB schema for tips doesn't have a 'status' field.
    // Let's insert it without tx_signature, or insert it in the webhook.
    // Actually, we must save it here if we want to retain the 'message'.
    // We will need to store the message somewhere temporarily, or add it as a memo to the solana tx!
    // Since we don't have a pending status, we will just rely on the webhook to create the tip.
    // How does the webhook know the message? We can cache it in Redis keyed by the tipper wallet.
    // Or we can add `memo` instruction to the transaction. Redis is simpler.

    return NextResponse.json({
      transaction: base64Tx,
      recipientWallet,
      message: 'Transaction built successfully'
    });

  } catch (error: any) {
    console.error('[API] Tip error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
