import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, users } from '@solscribe/db';
import { eq, and, ne } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/check-username
 * Query: ?username=example
 * Checks if a username is available for registration.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.toLowerCase()?.trim();

    if (!username || username.length < 2 || username.length > 32) {
      return NextResponse.json({ available: false, error: 'Invalid username' }, { status: 400 });
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json({ available: false, error: 'Invalid characters' }, { status: 400 });
    }

    const privyUser = await getServerUser(request);
    let currentDbUserId: string | null = null;

    if (privyUser) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.privyId, privyUser.id),
      });
      if (dbUser) {
        currentDbUserId = dbUser.id;
      }
    }

    // Check if another user has this username
    const conflict = await db.query.users.findFirst({
      where: currentDbUserId
        ? and(eq(users.username, username), ne(users.id, currentDbUserId))
        : eq(users.username, username),
    });

    return NextResponse.json({ available: !conflict });
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
