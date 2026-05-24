import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, subscriptions, publications, users } from '@solscribe/db';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/subscriptions/[id]
 * Cancels a subscription by setting status = 'cancelled'.
 * No refund is issued — access continues until expiresAt.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body as { action?: string };

    if (action !== 'cancel') {
      return NextResponse.json(
        { error: 'Invalid action. Only "cancel" is supported.' },
        { status: 400 }
      );
    }

    // Verify ownership — the subscription must belong to this user
    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.id, params.id),
        eq(subscriptions.subscriberId, dbUser.id)
      ),
    });

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (sub.status !== 'active') {
      return NextResponse.json(
        { error: `Cannot cancel a subscription with status "${sub.status}"` },
        { status: 409 }
      );
    }

    // Cancel the subscription — access remains until expiresAt
    await db
      .update(subscriptions)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(subscriptions.id, params.id));

    // Decrement the publication's subscriber count
    const pub = await db.query.publications.findFirst({
      where: eq(publications.id, sub.publicationId),
    });
    if (pub && pub.subscriberCount > 0) {
      await db
        .update(publications)
        .set({ subscriberCount: pub.subscriberCount - 1, updatedAt: new Date() })
        .where(eq(publications.id, sub.publicationId));
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. You will retain access until your current term expires.',
      expiresAt: sub.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
