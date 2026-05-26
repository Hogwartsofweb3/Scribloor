import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, users } from '@solscribe/db';
import { eq } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';
import { hasActiveSubscription } from '@/lib/subscriptions/access';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get('publicationId');

    if (!publicationId) {
      return NextResponse.json({ error: 'Missing publicationId' }, { status: 400 });
    }

    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ isSubscribed: false });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ isSubscribed: false });
    }

    const isSubscribed = await hasActiveSubscription({
      userId: dbUser.id,
      publicationId,
    });

    return NextResponse.json({ isSubscribed });
  } catch (error) {
    console.error('Error checking active subscription status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
