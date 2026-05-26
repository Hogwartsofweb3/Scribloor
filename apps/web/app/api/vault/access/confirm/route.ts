import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultAccessRecords } from '@solscribe/db';
import { eq, and } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { txSignature, recordId } = body;

    if (!txSignature || !recordId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify record exists and belongs to user
    const record = await db.query.vaultAccessRecords.findFirst({
      where: and(
        eq(vaultAccessRecords.id, recordId),
        eq(vaultAccessRecords.userId, user.id)
      ),
    });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    if (record.txSignature) {
      return NextResponse.json({ error: 'Transaction already confirmed' }, { status: 400 });
    }

    // Note: The Helius webhook will also verify this transaction asynchronously.
    // For immediate UX, we update the signature now.
    await db.update(vaultAccessRecords)
      .set({ txSignature })
      .where(eq(vaultAccessRecords.id, recordId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Vault Confirm API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
