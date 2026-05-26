import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultPassSubscriptions } from '@solscribe/db';
import { eq, and, gt } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';
import { PLATFORM_FEE_WALLET } from '@/lib/solana/constants';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an active vault pass
    const activePass = await db.query.vaultPassSubscriptions.findFirst({
      where: and(
        eq(vaultPassSubscriptions.subscriberId, user.id),
        eq(vaultPassSubscriptions.status, 'active'),
        gt(vaultPassSubscriptions.expiresAt, new Date())
      ),
    });

    if (activePass) {
      return NextResponse.json({ error: 'User already has an active Vault Pass' }, { status: 400 });
    }

    // Create a pending Vault Pass record
    // Default price is 5.00 USDC
    const monthlyPrice = '5.00';

    const passRecord = await db.insert(vaultPassSubscriptions).values({
      subscriberId: user.id,
      status: 'pending',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      monthlyPriceUsdc: monthlyPrice,
    }).returning();

    return NextResponse.json({
      amount: parseFloat(monthlyPrice),
      creatorWallet: PLATFORM_FEE_WALLET, // Pass money goes to the platform wallet initially, then distributed
      passId: passRecord[0].id,
    });
  } catch (error) {
    console.error('[Vault Pass Initiate API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
