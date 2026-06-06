import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerDbUser } from '@/lib/auth/privy';
import { db, pushSubscriptions, eq } from '@solscribe/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getServerDbUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json({ error: 'Missing encryption keys' }, { status: 400 });
    }

    // Check if endpoint is already registered
    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, endpoint),
    });

    if (existing) {
      // Update existing if owner changes or keys change
      await db
        .update(pushSubscriptions)
        .set({
          userId: user.id,
          p256dh,
          auth,
        })
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      // Register new subscription
      await db.insert(pushSubscriptions).values({
        userId: user.id,
        endpoint,
        p256dh,
        auth,
      });
    }

    return NextResponse.json({ success: true, message: 'Web push subscription registered' });
  } catch (error: any) {
    console.error('[Web Push API] Subscription registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
