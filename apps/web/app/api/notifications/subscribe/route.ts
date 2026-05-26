import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, pushSubscriptions, eq, and } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // Check if subscription already exists for this endpoint
    const existing = await db.query.pushSubscriptions.findFirst({
      where: and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, subscription.endpoint)
      )
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed' });
    }

    // Save subscription
    await db.insert(pushSubscriptions).values({
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PUSH_SUBSCRIBE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
