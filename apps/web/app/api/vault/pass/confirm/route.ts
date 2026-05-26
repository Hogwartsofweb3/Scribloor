import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultPassSubscriptions } from '@solscribe/db';
import { eq, and } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { txSignature, passId } = body;

    if (!txSignature || !passId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify record exists and belongs to user
    const record = await db.query.vaultPassSubscriptions.findFirst({
      where: and(
        eq(vaultPassSubscriptions.id, passId),
        eq(vaultPassSubscriptions.subscriberId, user.id)
      ),
    });

    if (!record) {
      return NextResponse.json({ error: 'Pass subscription not found' }, { status: 404 });
    }

    if (record.status === 'active') {
      return NextResponse.json({ error: 'Vault Pass is already active' }, { status: 400 });
    }

    // Set to active immediately for UX. Webhook will verify.
    await db.update(vaultPassSubscriptions)
      .set({ 
        status: 'active',
        lastTxSignature: txSignature 
      })
      .where(eq(vaultPassSubscriptions.id, passId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Vault Pass Confirm API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
