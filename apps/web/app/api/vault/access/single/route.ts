import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultEntries, vaultAccessRecords, users } from '@solscribe/db';
import { eq, and } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';
import { PLATFORM_FEE_WALLET } from '@/lib/solana/constants';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Check if entry exists
    const entry = await db.query.vaultEntries.findFirst({
      where: eq(vaultEntries.id, entryId),
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Check if user already has single access
    const existingAccess = await db.query.vaultAccessRecords.findFirst({
      where: and(
        eq(vaultAccessRecords.userId, user.id),
        eq(vaultAccessRecords.entryId, entryId)
      ),
    });

    if (existingAccess) {
      return NextResponse.json({ error: 'User already has access to this entry' }, { status: 400 });
    }

    // For single access, payment goes to platform wallet directly (or split, but for this demo platform collects and distributes via cron, or creator gets it directly. The spec says platform keeps 15% of PASS, but single access wasn't explicitly defined for split, so we'll route 100% to creator minus fee, similar to subscriptions).
    // Actually, we'll route to creator wallet like normal subscriptions.
    
    // Fetch creator wallet
    const creator = await db.query.users.findFirst({
      where: eq(users.id, entry.authorId),
    });

    if (!creator?.walletAddress) {
      return NextResponse.json({ error: 'Creator has no connected wallet to receive funds' }, { status: 400 });
    }

    // We don't create the pending record yet until we get confirmation, or we can create it without txSignature.
    // Let's create a pending record to hold the amount paid.
    const accessRecord = await db.insert(vaultAccessRecords).values({
      entryId,
      userId: user.id,
      accessType: 'single_purchase',
      amountPaidUsdc: entry.singleAccessPriceUsdc,
    }).returning();

    return NextResponse.json({
      amount: parseFloat(entry.singleAccessPriceUsdc || '0'),
      creatorWallet: creator.walletAddress,
      recordId: accessRecord[0].id,
      entryId,
    });
  } catch (error) {
    console.error('[Vault Single Access API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
